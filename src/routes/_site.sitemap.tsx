import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { canonical } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/sitemap")({
  head: () => ({
    meta: [
      { title: "מפת האתר | GoldTus" },
      { name: "description", content: "מפת האתר של גולדטוס — כל העמודים והדילים במקום אחד." },
      { property: "og:title", content: "מפת האתר | GoldTus" },
      { property: "og:url", content: canonical("/sitemap") },
    ],
    links: [{ rel: "canonical", href: canonical("/sitemap") }],
  }),
  component: SitemapPage,
});

const MAIN = [
  { to: "/", label: "בית" },
  { to: "/deals", label: "דילים חמים" },
  { to: "/services", label: "שירותים" },
  { to: "/travel-requirements", label: "דרישות כניסה למדינות" },
  { to: "/insurance", label: "ביטוח נסיעות" },
  { to: "/contact", label: "צור קשר" },
] as const;

const LEGAL = [
  { to: "/privacy", label: "מדיניות פרטיות" },
  { to: "/terms", label: "תנאי שימוש" },
  { to: "/accessibility", label: "הצהרת נגישות" },
] as const;

function SitemapPage() {
  const { data: deals = [] } = useQuery({
    queryKey: ["sitemap-deals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deals").select("id,destination,country,slug")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-14" dir="rtl">
      <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8">מפת האתר</h1>
      <div className="grid sm:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold mb-3">עמודים ראשיים</h2>
          <ul className="space-y-2 text-sm">
            {MAIN.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-primary hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-3">משפטי ונגישות</h2>
          <ul className="space-y-2 text-sm">
            {LEGAL.map((l) => (
              <li key={l.to}><Link to={l.to} className="text-primary hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </section>
      </div>

      {deals.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold mb-3">דילים פעילים ({deals.length})</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {deals.map((d) => (
              <li key={d.id}>
                <Link to="/deals" className="text-primary hover:underline">
                  {d.destination}{d.country ? ` · ${d.country}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}