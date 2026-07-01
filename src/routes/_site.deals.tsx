import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Plane, Hotel, Calendar, MoonStar, MapPin, MessageCircle, ExternalLink, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { canonical, ldScript, breadcrumbLd, SITE_URL, whatsappUrl } from "@/lib/site-constants";

type Deal = Database["public"]["Tables"]["deals"]["Row"];

const TITLE = 'דילים חמים לחו"ל | טיסות וחבילות נופש - GoldTus';
const DESC =
  'דילים חמים לחו"ל, טיסות, חבילות נופש ומבצעים שמתעדכנים באופן שוטף. מצאו את החופשה הבאה שלכם עם GoldTus.';

export const Route = createFileRoute("/_site/deals")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: 'דילים לחו"ל, דילים חמים, טיסות זולות, מבצעי טיסות, חבילות נופש, דילים ליוון, דילים לבטומי, דילים לטביליסי, דילים לקפריסין' },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: canonical("/deals") },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: canonical("/deals") }],
    scripts: [
      ldScript(breadcrumbLd([
        { name: "בית", path: "/" },
        { name: "דילים חמים", path: "/deals" },
      ])),
      ldScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: TITLE,
        description: DESC,
        url: canonical("/deals"),
        inLanguage: "he-IL",
        isPartOf: { "@type": "WebSite", name: "GoldTus", url: SITE_URL },
      }),
    ],
  }),
  component: DealsPage,
});

const IMG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23001a4d'/><stop offset='1' stop-color='%23002d72'/></linearGradient></defs><rect width='800' height='500' fill='url(%23g)'/><text x='400' y='260' fill='%23FFD447' font-family='serif' font-size='42' text-anchor='middle' font-weight='700'>GoldTus</text></svg>`,
  );

function DealsPage() {
  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ["public-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="bg-[#001a4d] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002d72] to-[#001a4d]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #FFD447 0%, transparent 40%), radial-gradient(circle at 80% 80%, #FFD447 0%, transparent 40%)" }} />
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 relative">
          <div className="text-center space-y-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 text-[#FFD447] text-xs font-bold tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5" fill="currentColor" /> Hot Deals
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-[#FFD447]">
              דילים חמים לחו"ל
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/85 leading-relaxed">
              הצעות נבחרות לטיסות, חבילות נופש ודילים שמתעדכנים באופן שוטף על ידי צוות GoldTus.
            </p>
            <a
              href={whatsappUrl("שלום, ראיתי את הדילים באתר ואשמח לקבל הצעה מותאמת")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" />
              קבלו הצעות בוואטסאפ
            </a>
          </div>
        </div>
      </section>

      {/* Info box */}
      <section className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
        <div className="rounded-2xl border border-[#FFD447]/30 bg-[#0b1f4a] p-5 sm:p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 flex items-center justify-center">
              <Info className="w-5 h-5 text-[#FFD447]" />
            </div>
            <div className="text-sm text-white/85 leading-relaxed">
              <div className="font-bold text-[#FFD447] mb-1">חשוב לדעת</div>
              מחירי טיסות, בתי מלון וחבילות נופש משתנים באופן דינמי בהתאם לזמינות, ביקוש ועדכוני הספקים. כל המחירים המוצגים נכונים למועד פרסום ההצעה בלבד. המחיר הסופי נקבע במעמד ההזמנה בלבד. התמונות להמחשה בלבד. ט.ל.ח.
            </div>
          </div>
        </div>
      </section>

      {/* Deals grid */}
      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-20">
        {isLoading && (
          <div className="text-center text-white/70 py-16">טוען דילים…</div>
        )}
        {error && (
          <div className="text-center text-red-300 py-16">שגיאה בטעינת הדילים</div>
        )}
        {!isLoading && !error && deals.length === 0 && (
          <div className="text-center text-white/75 py-16">
            אין דילים פעילים כרגע — צרו קשר בוואטסאפ להצעה אישית.
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => <DealCard key={d.id} deal={d} />)}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/10 bg-[#002d72]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-5">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFD447]">
            לא מצאתם את הדיל שחיפשתם?
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto">
            ספרו לנו לאן תרצו לטוס, באילו תאריכים ומה התקציב שלכם, ואנחנו נמצא עבורכם את ההצעה המשתלמת ביותר.
          </p>
          <a
            href={whatsappUrl("שלום, אשמח להצעת דיל מותאמת אישית")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all"
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" />
            שלחו לנו הודעה בוואטסאפ
          </a>
        </div>
      </section>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const href = deal.external_url || deal.quote_url || whatsappUrl(
    `שלום, אשמח לפרטים על הדיל ל${deal.destination}`,
  );
  const dateRange = formatDateRange(deal.start_date, deal.end_date);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl overflow-hidden bg-[#0b1f4a] border border-white/10 hover:border-[#FFD447]/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(255,212,71,0.35)] transition-all hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#001a4d]">
        <img
          src={deal.image_url || IMG_FALLBACK}
          alt={`${deal.destination} - ${deal.title ?? ""}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {deal.featured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFD447] text-[#001a4d] text-[11px] font-bold tracking-wide">
            <Flame className="w-3 h-3" fill="currentColor" /> מומלץ
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center gap-1.5 text-[#FFD447] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            {deal.country ? `${deal.destination} · ${deal.country}` : deal.destination}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-5 gap-3">
        <h3 className="font-display text-xl font-bold text-white leading-tight line-clamp-2 min-h-[3.5rem]">
          {deal.title || `חופשה ל${deal.destination}`}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/75">
          {dateRange && (
            <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#FFD447]" /> {dateRange}</div>
          )}
          {deal.nights != null && (
            <div className="flex items-center gap-1.5"><MoonStar className="w-3.5 h-3.5 text-[#FFD447]" /> {deal.nights} לילות</div>
          )}
          {deal.hotel && (
            <div className="flex items-center gap-1.5 col-span-2 truncate"><Hotel className="w-3.5 h-3.5 text-[#FFD447]" /> <span className="truncate">{deal.hotel}</span></div>
          )}
          {deal.airline && (
            <div className="flex items-center gap-1.5 col-span-2"><Plane className="w-3.5 h-3.5 text-[#FFD447]" /> {deal.airline}</div>
          )}
        </div>
        <div className="mt-auto pt-3 flex items-end justify-between border-t border-white/10">
          {deal.price_from != null ? (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/60">החל מ־</div>
              <div className="text-2xl font-bold text-[#FFD447] leading-none">
                ₪{deal.price_from.toLocaleString("he-IL")}
              </div>
            </div>
          ) : <span />}
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-[#001a4d] bg-[#FFD447] group-hover:bg-[#FFC000] transition-colors">
            לפרטים ולהזמנה <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

function formatDateRange(a: string | null, b: string | null): string {
  if (!a) return "";
  const fmt = (s: string) => {
    const d = new Date(s);
    return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit" }).format(d);
  };
  return b ? `${fmt(a)} – ${fmt(b)}` : fmt(a);
}