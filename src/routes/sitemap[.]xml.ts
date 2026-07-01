import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "https://goldtus.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/deals", changefreq: "daily", priority: "0.95" },
          { path: "/services", changefreq: "monthly", priority: "0.9" },
          { path: "/insurance", changefreq: "monthly", priority: "0.9" },
          { path: "/travel-requirements", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.8" },
          { path: "/sitemap", changefreq: "weekly", priority: "0.5" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          { path: "/accessibility", changefreq: "yearly", priority: "0.3" },
        ];

        try {
          const sb = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await sb
            .from("deals")
            .select("id,updated_at,active")
            .eq("active", true);
          if (data) {
            for (const d of data) {
              entries.push({
                path: `/deals#${d.id}`,
                lastmod: d.updated_at ? new Date(d.updated_at).toISOString().slice(0, 10) : undefined,
                changefreq: "daily",
                priority: "0.7",
              });
            }
          }
        } catch {
          // Fail open — still return the static entries.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Short cache so admin "refresh all deals" is reflected quickly.
            "Cache-Control": "public, max-age=60, s-maxage=60",
          },
        });
      },
    },
  },
});