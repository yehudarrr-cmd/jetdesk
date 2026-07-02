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
            redirect: "follow",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "he-IL,he;q=0.9,en;q=0.8",
            },
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