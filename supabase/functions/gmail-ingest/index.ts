import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GMAIL_GATEWAY = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM = `You extract structured flight ticket data from emails (subject + body + attachments).
Return ONLY by calling the function extract_flight_ticket.
- A single email can contain multiple flight legs (outbound + return + connections). Return each leg as one item in "flights".
- Datetimes MUST be ISO 8601 with timezone offset when possible (e.g. 2026-06-15T14:30:00+03:00). If no timezone is given, use the airport's local timezone if you know it, otherwise return without offset.
- Airports as 3-letter IATA codes.
- Passenger names exactly as printed (Latin letters, "LAST/FIRST" if that's the format).
- pnr = booking reference / record locator (6 chars typically). Leave null if not found.
- If the email is NOT a flight ticket / itinerary, return is_flight_ticket=false and an empty flights array.`;

// ---------- Types ----------
type ExtractedFlight = {
  airline: string | null;
  flight_number: string | null;
  departure_airport: string | null;
  arrival_airport: string | null;
  departure_datetime: string | null;
  arrival_datetime: string | null;
};
type Extracted = {
  is_flight_ticket: boolean;
  pnr: string | null;
  passengers: string[];
  flights: ExtractedFlight[];
};

// ---------- Gmail helpers ----------
function gmailHeaders() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GOOGLE_MAIL_API_KEY =
    Deno.env.get("GOOGLE_MAIL_API_KEY_1") ??
    Deno.env.get("GOOGLE_MAIL_API_KEY_2") ??
    Deno.env.get("GOOGLE_MAIL_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  if (!GOOGLE_MAIL_API_KEY) throw new Error("Gmail connector not linked (GOOGLE_MAIL_API_KEY missing)");
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
  };
}

async function gmailListMessages(query: string, maxResults = 50): Promise<string[]> {
  const url = `${GMAIL_GATEWAY}/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: gmailHeaders() });
  if (!res.ok) throw new Error(`Gmail list failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data.messages ?? []).map((m: { id: string }) => m.id);
}

type GmailMessage = {
  id: string;
  payload?: GmailPart;
  internalDate?: string;
};
type GmailPart = {
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: GmailPart[];
};

async function gmailGetMessage(id: string): Promise<GmailMessage> {
  const res = await fetch(`${GMAIL_GATEWAY}/users/me/messages/${id}?format=full`, { headers: gmailHeaders() });
  if (!res.ok) throw new Error(`Gmail get failed: ${res.status}`);
  return res.json();
}

async function gmailGetAttachment(messageId: string, attachmentId: string): Promise<string> {
  const res = await fetch(
    `${GMAIL_GATEWAY}/users/me/messages/${messageId}/attachments/${attachmentId}`,
    { headers: gmailHeaders() },
  );
  if (!res.ok) throw new Error(`Gmail attachment failed: ${res.status}`);
  const data = await res.json();
  // Gmail returns base64url; convert to standard base64
  return (data.data as string).replace(/-/g, "+").replace(/_/g, "/");
}

function headerValue(part: GmailPart | undefined, name: string): string {
  if (!part?.headers) return "";
  const h = part.headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

function base64UrlDecode(data: string): string {
  const b64 = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
}

function extractTextAndAttachments(payload: GmailPart | undefined): {
  text: string;
  attachments: { filename: string; mimeType: string; attachmentId: string }[];
} {
  const text: string[] = [];
  const attachments: { filename: string; mimeType: string; attachmentId: string }[] = [];

  function walk(part: GmailPart | undefined) {
    if (!part) return;
    const mime = part.mimeType ?? "";
    if (part.body?.attachmentId && part.filename) {
      attachments.push({
        filename: part.filename,
        mimeType: mime,
        attachmentId: part.body.attachmentId,
      });
    } else if (mime === "text/plain" && part.body?.data) {
      text.push(base64UrlDecode(part.body.data));
    } else if (mime === "text/html" && part.body?.data) {
      // strip tags very crudely
      const html = base64UrlDecode(part.body.data);
      text.push(html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    }
    if (part.parts) part.parts.forEach(walk);
  }
  walk(payload);
  return { text: text.join("\n\n").slice(0, 50000), attachments };
}

// ---------- AI extraction ----------
async function extractFlightData(
  subject: string,
  from: string,
  body: string,
  attachments: { filename: string; mimeType: string; base64: string }[],
): Promise<Extracted> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

  const userContent: Array<Record<string, unknown>> = [
    {
      type: "text",
      text: `Subject: ${subject}\nFrom: ${from}\n\nBody:\n${body}\n\nAttached files: ${attachments.map((a) => a.filename).join(", ") || "(none)"}\n\nExtract every flight leg.`,
    },
  ];
  for (const att of attachments.slice(0, 3)) {
    if (att.mimeType.startsWith("image/") || att.mimeType === "application/pdf") {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${att.mimeType};base64,${att.base64}` },
      });
    }
  }

  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userContent },
      ],
      tools: [{
        type: "function",
        function: {
          name: "extract_flight_ticket",
          description: "Structured flight ticket data",
          parameters: {
            type: "object",
            properties: {
              is_flight_ticket: { type: "boolean" },
              pnr: { type: ["string", "null"] },
              passengers: { type: "array", items: { type: "string" } },
              flights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    airline: { type: ["string", "null"] },
                    flight_number: { type: ["string", "null"] },
                    departure_airport: { type: ["string", "null"] },
                    arrival_airport: { type: ["string", "null"] },
                    departure_datetime: { type: ["string", "null"] },
                    arrival_datetime: { type: ["string", "null"] },
                  },
                  required: [],
                  additionalProperties: false,
                },
              },
            },
            required: ["is_flight_ticket", "flights", "passengers"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "extract_flight_ticket" } },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return { is_flight_ticket: false, pnr: null, passengers: [], flights: [] };
  return JSON.parse(toolCall.function.arguments) as Extracted;
}

// ---------- Customer matching ----------
type Customer = { id: string; name: string; pnr: string | null };

function normalize(s: string): string {
  return s
    .toUpperCase()
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "") // strip Hebrew niqqud
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Hebrew transliteration overrides (subset from src/lib/he-translit.ts).
const NAME_OVERRIDES: Record<string, string> = {
  AVRAHAM: "אברהם", YITZHAK: "יצחק", YITZCHAK: "יצחק", YAAKOV: "יעקב",
  MOSHE: "משה", DAVID: "דוד", DOVID: "דוד", SHLOMO: "שלמה", YOSEF: "יוסף",
  YEHUDA: "יהודה", YEHUDAH: "יהודה", ELIEZER: "אליעזר", ELIYAHU: "אליהו",
  MENACHEM: "מנחם", MORDECHAI: "מרדכי", SHMUEL: "שמואל", CHAIM: "חיים",
  YISRAEL: "ישראל", ISRAEL: "ישראל", DANIEL: "דניאל", YONATAN: "יונתן",
  RAFAEL: "רפאל", AHARON: "אהרון", AARON: "אהרון", NOAM: "נועם",
  ARI: "ארי", ARIEL: "אריאל",
  MIRIAM: "מרים", LEAH: "לאה", RIVKA: "רבקה", SARAH: "שרה", SARA: "שרה",
  RACHEL: "רחל", CHANA: "חנה", HANNA: "חנה", ESTHER: "אסתר", SHIRA: "שירה",
  YAEL: "יעל", NOA: "נועה", TAMAR: "תמר",
  COHEN: "כהן", LEVI: "לוי", LEVY: "לוי", KATZ: "כץ", GOLDMAN: "גולדמן",
  FRIEDMAN: "פרידמן", ROSENBERG: "רוזנברג", WEISS: "ווייס", KLEIN: "קליין",
  MIZRAHI: "מזרחי", PERETZ: "פרץ",
};
const LETTERS: Record<string, string> = {
  A: "א", B: "ב", C: "ק", D: "ד", E: "א", F: "פ", G: "ג", H: "ה", I: "י",
  J: "ג", K: "ק", L: "ל", M: "מ", N: "נ", O: "ו", P: "פ", Q: "ק", R: "ר",
  S: "ס", T: "ט", U: "ו", V: "ו", W: "ו", X: "קס", Y: "י", Z: "ז",
};
function transliterateWord(word: string): string {
  const upper = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!upper) return "";
  if (NAME_OVERRIDES[upper]) return NAME_OVERRIDES[upper];
  let s = upper
    .replace(/SHCH/g, "שצ")
    .replace(/SCH/g, "ש").replace(/SH/g, "ש")
    .replace(/CH/g, "ח").replace(/TS/g, "צ").replace(/TZ/g, "צ")
    .replace(/TH/g, "ת").replace(/PH/g, "פ").replace(/CK/g, "ק");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "E" && i > 0 && i < s.length - 1) continue;
    out += LETTERS[ch] ?? ch;
  }
  return out;
}
function toHebrewName(name: string): string {
  return name.split(/[\s\/\-,]+/).filter(Boolean).map(transliterateWord).join(" ").trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(normalize(s).split(" ").filter((t) => t.length >= 2));
}

function nameMatchScore(passengerLatin: string, customerName: string): number {
  const heb = toHebrewName(passengerLatin);
  const customerTokens = tokenSet(customerName);
  const candidateTokens = new Set([
    ...tokenSet(passengerLatin),
    ...tokenSet(heb),
  ]);
  if (!customerTokens.size || !candidateTokens.size) return 0;
  let overlap = 0;
  for (const t of candidateTokens) if (customerTokens.has(t)) overlap++;
  return overlap / Math.max(customerTokens.size, candidateTokens.size);
}

function matchCustomer(
  extracted: Extracted,
  customers: Customer[],
): { customer: Customer | null; reason: string } {
  // 1. PNR match
  if (extracted.pnr) {
    const byPnr = customers.find((c) => c.pnr && c.pnr.toUpperCase() === extracted.pnr!.toUpperCase());
    if (byPnr) return { customer: byPnr, reason: "pnr" };
  }
  // 2. Name fuzzy match — best score across all passengers × all customers
  let best: { customer: Customer; score: number } | null = null;
  for (const passenger of extracted.passengers) {
    for (const c of customers) {
      const score = nameMatchScore(passenger, c.name);
      if (score >= 0.5 && (!best || score > best.score)) best = { customer: c, score };
    }
  }
  if (best) return { customer: best.customer, reason: `name(${best.score.toFixed(2)})` };
  return { customer: null, reason: "no-match" };
}

// ---------- Main ----------
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const jsonRes = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return jsonRes({ error: "Unauthorized" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: authErr } = await sb.auth.getUser();
    if (authErr || !userData?.user) return jsonRes({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({} as { full_scan?: boolean; max_messages?: number }));
    const fullScan = body.full_scan === true;
    const maxMessages = Math.min(body.max_messages ?? (fullScan ? 50 : 20), 50);

    // Build Gmail query
    const range = fullScan ? "newer_than:30d" : "newer_than:7d";
    const query = `${range} (has:attachment OR subject:(ticket OR טיסה OR flight OR booking OR confirmation OR "e-ticket" OR itinerary OR כרטיס))`;

    const ids = await gmailListMessages(query, maxMessages);

    // Fetch already-processed IDs
    const { data: existingLogs } = await sb
      .from("email_ingest_log")
      .select("gmail_message_id")
      .in("gmail_message_id", ids.length ? ids : ["__none__"]);
    const alreadySeen = new Set((existingLogs ?? []).map((r: { gmail_message_id: string }) => r.gmail_message_id));
    const toProcess = ids.filter((id) => !alreadySeen.has(id));

    // Load customers once
    const { data: customersData } = await sb
      .from("customers")
      .select("id, name, pnr");
    const customers = (customersData ?? []) as Customer[];

    const summary = { scanned: ids.length, processed: 0, matched: 0, unmatched: 0, skipped: alreadySeen.size, failed: 0 };

    for (const id of toProcess) {
      try {
        const msg = await gmailGetMessage(id);
        const subject = headerValue(msg.payload, "Subject");
        const from = headerValue(msg.payload, "From");
        const receivedAt = msg.internalDate ? new Date(parseInt(msg.internalDate, 10)).toISOString() : null;
        const { text, attachments: attMeta } = extractTextAndAttachments(msg.payload);

        // Download up to 3 relevant attachments (PDF/images), <=5MB each
        const attachments: { filename: string; mimeType: string; base64: string }[] = [];
        for (const a of attMeta) {
          if (!(a.mimeType.startsWith("image/") || a.mimeType === "application/pdf")) continue;
          if (attachments.length >= 3) break;
          try {
            const b64 = await gmailGetAttachment(id, a.attachmentId);
            if (b64.length > 7_000_000) continue; // ~5MB binary
            attachments.push({ filename: a.filename, mimeType: a.mimeType, base64: b64 });
          } catch (e) {
            console.warn("attachment fetch failed", a.filename, e);
          }
        }

        const extracted = await extractFlightData(subject, from, text, attachments);

        if (!extracted.is_flight_ticket || !extracted.flights.length) {
          await sb.from("email_ingest_log").insert({
            owner_id: userId,
            gmail_message_id: id,
            subject, from_email: from, received_at: receivedAt,
            status: "skipped",
            extracted_data: extracted as unknown as Record<string, unknown>,
            error: "not a flight ticket",
          });
          continue;
        }

        const match = matchCustomer(extracted, customers);
        summary.processed++;

        if (!match.customer) {
          summary.unmatched++;
          await sb.from("email_ingest_log").insert({
            owner_id: userId,
            gmail_message_id: id,
            subject, from_email: from, received_at: receivedAt,
            status: "unmatched",
            passenger_names: extracted.passengers,
            pnr: extracted.pnr,
            extracted_data: extracted as unknown as Record<string, unknown>,
            error: `Could not match customer: ${match.reason}`,
          });
          continue;
        }

        // Insert flights
        const flightRows = extracted.flights.map((f) => ({
          customer_id: match.customer!.id,
          owner_id: userId,
          airline: f.airline,
          flight_number: f.flight_number,
          departure_airport: f.departure_airport,
          arrival_airport: f.arrival_airport,
          departure_datetime: f.departure_datetime,
          arrival_datetime: f.arrival_datetime,
          pnr: extracted.pnr,
          source: "gmail",
          source_email_id: id,
        }));
        const { data: insertedFlights, error: flightErr } = await sb
          .from("flights")
          .insert(flightRows)
          .select("id");
        if (flightErr) throw flightErr;

        // Backfill PNR on customer if missing
        if (extracted.pnr && !match.customer.pnr) {
          await sb.from("customers").update({ pnr: extracted.pnr }).eq("id", match.customer.id);
        }

        summary.matched++;
        await sb.from("email_ingest_log").insert({
          owner_id: userId,
          gmail_message_id: id,
          subject, from_email: from, received_at: receivedAt,
          status: "matched",
          matched_customer_id: match.customer.id,
          matched_flight_ids: (insertedFlights ?? []).map((r: { id: string }) => r.id),
          passenger_names: extracted.passengers,
          pnr: extracted.pnr,
          extracted_data: extracted as unknown as Record<string, unknown>,
        });
      } catch (e) {
        summary.failed++;
        console.error("ingest failure for", id, e);
        await sb.from("email_ingest_log").insert({
          owner_id: userId,
          gmail_message_id: id,
          status: "failed",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    await sb.from("email_ingest_state").upsert({
      owner_id: userId,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: "owner_id" });

    return jsonRes({ ok: true, summary });
  } catch (e) {
    console.error("gmail-ingest fatal", e);
    return jsonRes({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});