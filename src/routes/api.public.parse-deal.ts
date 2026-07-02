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

          const html = await fetchQuoteHtml(parsed.toString());
          if (!html) {
            return json({ error: "upstream fetch failed" }, 502);
          }
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

const BROWSER_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en;q=0.8",
};

// Cloudflare on quotes.goldtus.com sometimes blocks Worker-origin fetches with
// 530. Fall back to a public read-through proxy that renders the page for us.
export async function fetchQuoteHtml(url: string): Promise<string | null> {
  try {
    const direct = await fetch(url, { redirect: "follow", headers: BROWSER_HEADERS });
    if (direct.ok) return await direct.text();
  } catch {
    // fall through to proxy
  }
  const proxies = [
    `https://r.jina.ai/${url}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];
  for (const proxied of proxies) {
    try {
      const res = await fetch(proxied, { redirect: "follow", headers: BROWSER_HEADERS });
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 200) return text;
      }
    } catch {
      // try next proxy
    }
  }
  return null;
}