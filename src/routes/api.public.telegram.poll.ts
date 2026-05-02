import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUpdates, sendMessage } from "@/lib/telegram.server";
import { processMessage } from "@/lib/telegram-ai.server";
import { createClient } from "@supabase/supabase-js";

const MAX_RUNTIME_MS = 25_000;
const MIN_REMAINING_MS = 3_000;

export const Route = createFileRoute("/api/public/telegram/poll")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isAuthorized(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.replace(/^Bearer\s+/i, "");
  const token =
    request.headers.get("x-poll-token") ??
    bearer ??
    new URL(request.url).searchParams.get("token") ??
    null;
  if (!token) return false;

  // 1. Shared secret (used by cron / external schedulers)
  const expected = process.env.TELEGRAM_POLL_SECRET;
  if (expected && constantTimeEqual(expected, token)) return true;

  // 2. Authenticated Supabase user (used by the in-app "poll now" button)
  if (bearer) {
    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (url && anon) {
      try {
        const sb = createClient(url, anon, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await sb.auth.getClaims(bearer);
        if (!error && data?.claims?.sub) return true;
      } catch (e) {
        console.error("auth check failed:", e);
      }
    }
  }

  return false;
}

async function handle(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const startTime = Date.now();
  let totalProcessed = 0;

  try {
    const { data: state, error: stateErr } = await supabaseAdmin
      .from("telegram_bot_state")
      .select("update_offset")
      .eq("id", 1)
      .single();
    if (stateErr) throw new Error(stateErr.message);
    let currentOffset = state.update_offset;

    while (Date.now() - startTime < MAX_RUNTIME_MS - MIN_REMAINING_MS) {
      const remainingMs = MAX_RUNTIME_MS - (Date.now() - startTime);
      const timeout = Math.min(20, Math.floor(remainingMs / 1000) - 3);
      if (timeout < 1) break;

      const data = await getUpdates(currentOffset, timeout);
      const updates: any[] = data.result ?? [];
      if (updates.length === 0) continue;

      for (const u of updates) {
        if (u.message) {
          await handleMessage(u);
          totalProcessed++;
        }
      }

      currentOffset = Math.max(...updates.map((u: any) => u.update_id)) + 1;
      await supabaseAdmin
        .from("telegram_bot_state")
        .update({ update_offset: currentOffset, updated_at: new Date().toISOString() })
        .eq("id", 1);
    }

    return Response.json({ ok: true, processed: totalProcessed });
  } catch (e) {
    console.error("telegram poll error:", e);
    return Response.json(
      { ok: false, error: "Processing failed. Please try again.", processed: totalProcessed },
      { status: 500 }
    );
  }
}

async function handleMessage(update: any) {
  const msg = update.message;
  const chatId: number = msg.chat.id;
  const text: string = msg.text ?? "";
  const updateId: number = update.update_id;

  // Idempotency: skip if already stored
  const { data: existing } = await supabaseAdmin
    .from("telegram_messages")
    .select("update_id")
    .eq("update_id", updateId)
    .maybeSingle();
  if (existing) return;

  // Find owner by chat link
  const { data: link } = await supabaseAdmin
    .from("telegram_chat_links")
    .select("owner_id")
    .eq("chat_id", chatId)
    .maybeSingle();

  // Handle pairing flow
  if (!link) {
    await handlePairing(chatId, text, msg, updateId);
    return;
  }

  const ownerId = link.owner_id;

  // Store inbound message
  await supabaseAdmin.from("telegram_messages").insert({
    update_id: updateId,
    chat_id: chatId,
    owner_id: ownerId,
    text,
    raw_update: update,
    status: "received",
  });

  if (!text) {
    await sendMessage(chatId, "אני יודע לעבד רק הודעות טקסט כרגע 📝");
    return;
  }

  if (text.trim() === "/start" || text.trim() === "/help") {
    await sendMessage(chatId, helpText());
    return;
  }

  try {
    // Load owner's customers (lightweight)
    const { data: customers } = await supabaseAdmin
      .from("customers")
      .select("id, name, phone, pnr, destination")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false })
      .limit(200);

    const result = await processMessage(text, customers ?? []);
    const replyText = await executeAction(ownerId, result);

    await sendMessage(chatId, replyText);
    await supabaseAdmin
      .from("telegram_messages")
      .update({ status: "processed", ai_response: result, reply_text: replyText })
      .eq("update_id", updateId);
  } catch (e) {
    const err = e instanceof Error ? e.message : "unknown";
    console.error("process message error:", err);
    await sendMessage(chatId, "❌ אירעה שגיאה. נסה שוב מאוחר יותר.");
    await supabaseAdmin
      .from("telegram_messages")
      .update({ status: "error", error: err })
      .eq("update_id", updateId);
  }
}

async function handlePairing(chatId: number, text: string, msg: any, updateId: number) {
  const code = text?.trim().toUpperCase();

  await supabaseAdmin.from("telegram_messages").insert({
    update_id: updateId,
    chat_id: chatId,
    text,
    raw_update: { message: msg },
    status: "unpaired",
  });

  if (!code || code === "/START") {
    await sendMessage(
      chatId,
      "👋 שלום! כדי לחבר את הבוט לחשבון שלך במערכת:\n\n1. כנס לאפליקציה → טלגרם\n2. לחץ על 'צור קוד חיבור'\n3. שלח לי כאן את הקוד (4 תווים)"
    );
    return;
  }

  if (!/^[A-Z0-9]{4,8}$/.test(code)) {
    await sendMessage(chatId, "🔑 שלח לי את קוד החיבור שיצרת באפליקציה (אותיות וספרות).");
    return;
  }

  const { data: pc } = await supabaseAdmin
    .from("telegram_pairing_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!pc || pc.used_at || new Date(pc.expires_at) < new Date()) {
    await sendMessage(chatId, "❌ קוד לא תקין או פג תוקף. צור קוד חדש באפליקציה.");
    return;
  }

  await supabaseAdmin.from("telegram_chat_links").insert({
    chat_id: chatId,
    owner_id: pc.owner_id,
    username: msg.from?.username ?? null,
    first_name: msg.from?.first_name ?? null,
    paired_at: new Date().toISOString(),
  });
  await supabaseAdmin
    .from("telegram_pairing_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code", code);

  await sendMessage(chatId, `✅ הבוט מחובר!\n\n${helpText()}`);
}

function helpText() {
  return `אני העוזר של Travel CRM 🌍\nשלח לי טקסט חופשי ואני אעדכן את המערכת:\n\n• "יעקב חלפון שילם 500$ במזומן"\n• "צור לקוח חדש: דנה לוי 0501234567 לתאילנד 15-25/8"\n• "תזכיר לי מחר להתקשר ליעקב"\n• "מה היתרה של דנה?"`;
}

async function executeAction(ownerId: string, result: any): Promise<string> {
  const { action, reply } = result;

  switch (action) {
    case "create_or_update_customer": {
      let customerId = result.customer_id;
      const updates = result.customer_updates ?? {};
      if (customerId) {
        await supabaseAdmin.from("customers").update(updates).eq("id", customerId).eq("owner_id", ownerId);
      } else if (result.customer_name) {
        const { data, error } = await supabaseAdmin
          .from("customers")
          .insert({ name: result.customer_name, owner_id: ownerId, ...updates })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        customerId = data.id;
      }
      if (customerId) {
        await supabaseAdmin.from("timeline_events").insert({
          customer_id: customerId,
          owner_id: ownerId,
          type: "telegram",
          title: "עדכון מטלגרם",
          description: reply,
        });
      }
      return `✅ ${reply}`;
    }
    case "record_payment": {
      if (!result.customer_id || !result.payment?.amount) return `⚠️ ${reply}`;
      await supabaseAdmin.from("payments").insert({
        customer_id: result.customer_id,
        owner_id: ownerId,
        amount: result.payment.amount,
        method: result.payment.method ?? "cash",
        notes: result.payment.notes ?? null,
      });
      // Update amount_paid
      const { data: sums } = await supabaseAdmin
        .from("payments")
        .select("amount")
        .eq("customer_id", result.customer_id);
      const total = (sums ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
      await supabaseAdmin.from("customers").update({ amount_paid: total }).eq("id", result.customer_id);
      return `💰 ${reply}`;
    }
    case "create_task": {
      await supabaseAdmin.from("tasks").insert({
        customer_id: result.customer_id ?? null,
        owner_id: ownerId,
        title: result.task?.title ?? "משימה מטלגרם",
        due_date: result.task?.due_date ?? null,
        priority: result.task?.priority ?? "medium",
      });
      return `📌 ${reply}`;
    }
    case "query_info":
      return `ℹ️ ${result.query_answer ?? reply}`;
    default:
      return `🤔 ${reply}`;
  }
}