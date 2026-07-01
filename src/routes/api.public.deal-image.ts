import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_HOSTS = [
  "cf.bstatic.com",
  "q-xx.bstatic.com",
  "r-xx.bstatic.com",
  "q.bstatic.com",
  "r.bstatic.com",
  "quotes.goldtus.com",
  "goldtus.com",
  "www.goldtus.com",
  "image.pollinations.ai",
  "ak-d.tripcdn.com",
];

export const Route = createFileRoute("/api/public/deal-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("url")?.trim();
        if (!raw || raw.length > 2000) return new Response("Missing image", { status: 400 });

        let imageUrl: URL;
        try {
          imageUrl = new URL(raw);
        } catch {
          return new Response("Invalid image", { status: 400 });
        }

        if (imageUrl.protocol !== "https:" || !isAllowedHost(imageUrl.hostname)) {
          return new Response("Image host not allowed", { status: 400 });
        }

        const upstream = await fetch(imageUrl.toString(), {
          headers: {
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            Referer: "https://quotes.goldtus.com/",
            "User-Agent": "Mozilla/5.0 GoldTus-ImageProxy/1.0",
          },
        });

        if (!upstream.ok) return new Response("Image unavailable", { status: 502 });

        const contentType = upstream.headers.get("content-type") || "image/jpeg";
        if (!contentType.startsWith("image/")) {
          return new Response("Not an image", { status: 415 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});

function isAllowedHost(hostname: string) {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.includes(host) || host.endsWith(".bstatic.com") || host.endsWith(".tripcdn.com");
}