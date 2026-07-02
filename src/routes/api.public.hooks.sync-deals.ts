import { createFileRoute } from "@tanstack/react-router";
import { parseQuoteHtml } from "@/lib/deals-parser";
import { fetchQuoteHtml } from "./api.public.parse-deal";

// Cron-triggered sync: re-parses every deal with a quote_url from
// quotes.goldtus.com and updates cached fields (price, dates, hotel, image).
// Called by pg_cron every few hours. Also callable manually.

export const Route = createFileRoute("/api/public/hooks/sync-deals")({
  server: {
    handlers: {
      POST: async () => run(),
      GET: async () => run(),
    },
  },
});

async function run() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: deals, error } = await supabaseAdmin
    .from("deals")
    .select("id,quote_url,destination,country,title,hotel,airline,price_from,start_date,end_date,nights,image_url")
    .not("quote_url", "is", null);

  if (error) {
    return json({ ok: false, error: error.message }, 500);
  }

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const d of deals ?? []) {
    try {
      const url = d.quote_url as string;
      if (!url.startsWith("https://quotes.goldtus.com/")) continue;
      const html = await fetchQuoteHtml(url);
      if (!html) { failed++; errors.push(`${d.id}: upstream fetch failed`); continue; }
      const parsed = parseQuoteHtml(html);

      const patch = {
        destination: parsed.destination ?? d.destination,
        country: parsed.country ?? d.country,
        title: parsed.title ?? d.title,
        hotel: parsed.hotel ?? d.hotel,
        airline: parsed.airline ?? d.airline,
        price_from: parsed.price_from ?? d.price_from,
        start_date: parsed.start_date ?? d.start_date,
        end_date: parsed.end_date ?? d.end_date,
        nights: parsed.nights ?? d.nights,
        image_url: parsed.image_url ?? d.image_url,
        last_synced_at: new Date().toISOString(),
      };
      const { error: upErr } = await supabaseAdmin.from("deals").update(patch).eq("id", d.id);
      if (upErr) { failed++; errors.push(`${d.id}: ${upErr.message}`); continue; }
      updated++;
    } catch (e) {
      failed++;
      errors.push(`${d.id}: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return json({ ok: true, total: deals?.length ?? 0, updated, failed, errors: errors.slice(0, 10), at: new Date().toISOString() });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}