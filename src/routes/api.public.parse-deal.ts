import { createFileRoute } from "@tanstack/react-router";
import { parseQuoteHtml } from "@/lib/deals-parser";

// Public server route: fetches a quotes.goldtus.com page server-side (no CORS)
// and returns a parsed deal payload. Used by the admin /_app/deals page.
// Only fetches URLs under quotes.goldtus.com to prevent SSRF abuse.

export const Route = createFileRoute("/api/public/parse-deal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { url?: string };
          const url = body.url?.trim();
          if (!url) {
            return json({ error: "missing url" }, 400);
          }
          let parsed: URL;
          try {
            parsed = new URL(url);
          } catch {
            return json({ error: "invalid url" }, 400);
          }
          if (parsed.hostname !== "quotes.goldtus.com") {
            return json({ error: "only quotes.goldtus.com is allowed" }, 400);
          }

          const res = await fetch(parsed.toString(), {
            headers: { "User-Agent": "GoldTus-DealBot/1.0" },
          });
          if (!res.ok) {
            return json({ error: `upstream ${res.status}` }, 502);
          }
          const html = await res.text();
          const deal = parseQuoteHtml(html);
          return json({ deal, quote_url: parsed.toString() });
        } catch (err) {
          return json({ error: err instanceof Error ? err.message : "parse error" }, 500);
        }
      },
    },
  },
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}