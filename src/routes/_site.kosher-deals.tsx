import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed, MessageCircle, Info, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  canonical,
  ldScript,
  breadcrumbLd,
  SITE_URL,
  whatsappUrl,
  GOLD_DEAL_CLUB_WHATSAPP_URL,
} from "@/lib/site-constants";
import { DealCard } from "@/components/site/DealCard";

const TITLE = 'דילים כשרים לחו"ל | חופשות ומלונות כשרים - GoldTus';
const DESC =
  'דילים כשרים לחו"ל: חופשות עם מלונות כשרים, ארוחות בהשגחה, טיסות ליעדים ידידותיים למגזר הדתי וחבילות שבת מאורגנות. מתעדכן באופן שוטף על ידי GoldTus.';

export const Route = createFileRoute("/_site/kosher-deals")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          'דילים כשרים, חופשה כשרה, מלון כשר, אוכל כשר בחו"ל, טיולים לדתיים, חבילות כשרות, שבת בחו"ל, יעדים כשרים, טיסות לדתיים, גלאט כשר, פסח בחו"ל',
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: canonical("/kosher-deals") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: canonical("/kosher-deals") }],
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "בית", path: "/" },
          { name: "דילים כשרים", path: "/kosher-deals" },
        ]),
      ),
      ldScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: TITLE,
        description: DESC,
        url: canonical("/kosher-deals"),
        inLanguage: "he-IL",
        isPartOf: { "@type": "WebSite", name: "GoldTus", url: SITE_URL },
        about: {
          "@type": "Thing",
          name: "חופשות כשרות בחו\"ל",
          description:
            'חופשות ומלונות עם השגחה כשרותית, ארוחות כשרות ומלונות שומרי שבת ליעדים מובילים בעולם.',
        },
      }),
    ],
  }),
  component: KosherDealsPage,
});

const BENEFITS = [
  {
    icon: UtensilsCrossed,
    title: "מלונות עם אוכל כשר",
    desc: "מלונות עם משגיח כשרות, ארוחות מהדרין וגלאט כשר לאורך כל השבוע.",
  },
  {
    icon: ShieldCheck,
    title: "מותאם לשומרי שבת",
    desc: "יעדים וטיסות שמתחשבים בכניסת שבת וחג, מלונות עם מפתח שבת ומעלית שבת.",
  },
  {
    icon: Star,
    title: "יעדים ידידותיים למגזר",
    desc: "קפריסין, יוון, בטומי, בולגריה, איטליה ועוד — קהילות יהודיות פעילות ובית כנסת בקרבת המלון.",
  },
];

function KosherDealsPage() {
  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ["public-deals", "kosher"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("active", true)
        .contains("tags", ["kosher"])
        .order("featured", { ascending: false })
        .order("price_from", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="bg-[#001a4d] text-white" dir="rtl">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002d72] to-[#001a4d]">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #0b6b3a 0%, transparent 40%), radial-gradient(circle at 80% 80%, #FFD447 0%, transparent 40%)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 relative">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b6b3a]/25 border border-[#FFD447]/40 text-[#FFD447] text-xs font-bold tracking-widest uppercase">
              <UtensilsCrossed className="w-3.5 h-3.5" /> Kosher Deals
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FFD447]">
              דילים כשרים לחו"ל
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/85 leading-relaxed">
              חופשות ומלונות עם השגחה כשרותית, ארוחות כשרות ויעדים ידידותיים למגזר הדתי — מבחר דילים נבחר.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl("שלום, אשמח לקבל הצעה לחופשה כשרה עם מלון כשר")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all"
              >
                <MessageCircle className="w-4 h-4" fill="currentColor" />
                בקשו הצעה כשרה בוואטסאפ
              </a>
              <a
                href={GOLD_DEAL_CLUB_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#FFD447] bg-white/10 border border-[#FFD447]/55 hover:bg-white/15 transition-all"
              >
                <MessageCircle className="w-4 h-4" fill="currentColor" />
                מועדון דיל הזהב
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-6 -mt-3 relative z-10">
        <div className="grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border border-[#FFD447]/25 bg-[#0b1f4a] p-4 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]"
            >
              <div className="w-8 h-8 rounded-full bg-[#0b6b3a]/25 border border-[#FFD447]/40 flex items-center justify-center mb-2">
                <b.icon className="w-4 h-4 text-[#FFD447]" />
              </div>
              <div className="text-sm font-bold text-[#FFD447]">{b.title}</div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Info boxes */}
      <section className="max-w-4xl mx-auto px-6 mt-4 relative z-10 grid gap-3">
        <div className="rounded-xl border border-[#FFD447]/30 bg-[#0b1f4a] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#FFD447]" />
            </div>
            <div className="text-xs sm:text-sm text-white/85 leading-relaxed">
              <span className="font-bold text-[#FFD447]">חשוב לדעת:</span>{" "}
              רמת הכשרות של כל מלון (רגילה / מהדרין / גלאט) מצוינת בפרטי הדיל וניתן לוודא במעמד ההזמנה. מחירי טיסות, בתי מלון וחבילות משתנים באופן דינמי, המחיר הסופי נקבע במעמד ההזמנה בלבד. תמונות להמחשה בלבד. ט.ל.ח.
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
              <Info className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xs sm:text-sm text-white/90 leading-relaxed">
              <span className="font-bold text-amber-400">הבהרה בנושא כשרות:</span>{" "}
              GoldTus אינה נושאת באחריות על רמת הכשרות של המלונות, המסעדות או הספקים המופיעים בדילים. פרטי הכשרות המוצגים בעמוד זה מבוססים אך ורק על המידע שמסרו המלון והספקים. לפני כל הזמנה מומלץ לוודא ישירות מול המלון או הספק את רמת הכשרות, השגחתה והתאמתה לצרכים שלכם.
            </div>
          </div>
        </div>
      </section>

      {/* Deals grid */}
      <section className="max-w-6xl mx-auto px-6 py-14 sm:py-20">
        <h2 className="sr-only">רשימת הדילים הכשרים</h2>
        {isLoading && <div className="text-center text-white/70 py-16">טוען דילים כשרים…</div>}
        {error && <div className="text-center text-red-300 py-16">שגיאה בטעינת הדילים</div>}
        {!isLoading && !error && deals.length === 0 && (
          <div className="text-center text-white/80 py-16 space-y-3">
            <p>עדיין לא פורסמו דילים כשרים פעילים.</p>
            <p className="text-sm text-white/60">
              שלחו לנו הודעה בוואטסאפ עם היעד והתאריכים ונחזור עם הצעה כשרה מותאמת אישית.
            </p>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/10 bg-[#002d72]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center space-y-5">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FFD447]">
            מחפשים חופשה כשרה בהתאמה אישית?
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto">
            ספרו לנו רמת הכשרות הנדרשת (מהדרין / גלאט), תאריכים, יעד ומספר נוסעים — ונבנה עבורכם חבילה
            כשרה שמתאימה בדיוק לצרכים שלכם.
          </p>
          <a
            href={whatsappUrl("שלום, אשמח להצעה כשרה מותאמת אישית")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all"
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" />
            שלחו הודעה בוואטסאפ
          </a>
        </div>
      </section>
    </div>
  );
}