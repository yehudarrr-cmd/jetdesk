import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Flame, MessageCircle, Info, ArrowUpDown, CalendarArrowUp, Banknote } from "lucide-react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { canonical, ldScript, breadcrumbLd, SITE_URL, whatsappUrl, GOLD_DEAL_CLUB_WHATSAPP_URL } from "@/lib/site-constants";
import { DealCard } from "@/components/site/DealCard";
import { getPublicDeals } from "@/lib/public-deals.functions";

const TITLE = 'דילים חמים לחו"ל | טיסות וחבילות נופש - GoldTus';
const DESC =
  'דילים חמים לחו"ל, טיסות, חבילות נופש ומבצעים שמתעדכנים באופן שוטף. מצאו את החופשה הבאה שלכם עם GoldTus.';

const searchSchema = z.object({
  sort: fallback(z.union([z.literal("price_asc"), z.literal("date_asc")]), "price_asc").default("price_asc"),
});

const publicDealsQuery = (sort: "price_asc" | "date_asc") =>
  queryOptions({
    queryKey: ["public-deals", sort],
    queryFn: () => getPublicDeals({ data: { kosher: false, sort } }),
  });

export const Route = createFileRoute("/_site/deals")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search: { sort } }) => ({ sort }),
  loader: ({ context, deps: { sort } }) => context.queryClient.ensureQueryData(publicDealsQuery(sort)),
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

function SortToggle({ sort }: { sort: "price_asc" | "date_asc" }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition-all";
  const active =
    "bg-[#FFD447] text-[#001a4d] border-[#FFD447] shadow-[0_8px_24px_-8px_rgba(255,212,71,0.55)]";
  const inactive =
    "bg-white/5 text-white/90 border-white/20 hover:bg-white/10 hover:border-[#FFD447]/40";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
      <span className="text-sm text-white/70 flex items-center gap-1.5 ml-1">
        <ArrowUpDown className="w-4 h-4" />
        מיון:
      </span>
      <Link
        from="/deals"
        search={(prev) => ({ ...prev, sort: "price_asc" })}
        className={`${base} ${sort === "price_asc" ? active : inactive}`}
        aria-current={sort === "price_asc" ? "page" : undefined}
      >
        <Banknote className="w-4 h-4" />
        הזול ביותר קודם
      </Link>
      <Link
        from="/deals"
        search={(prev) => ({ ...prev, sort: "date_asc" })}
        className={`${base} ${sort === "date_asc" ? active : inactive}`}
        aria-current={sort === "date_asc" ? "page" : undefined}
      >
        <CalendarArrowUp className="w-4 h-4" />
        תאריכי יציאה קרובים קודם
      </Link>
    </div>
  );
}

function DealsPage() {
  const { sort } = Route.useSearch();
  const { data: deals = [] } = useSuspenseQuery(publicDealsQuery(sort));

  return (
    <div className="bg-[#001a4d] text-white" dir="rtl">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#002d72] to-[#001a4d]">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #FFD447 0%, transparent 40%), radial-gradient(circle at 80% 80%, #FFD447 0%, transparent 40%)" }} />
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-6 sm:pt-10 sm:pb-8 relative">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 text-[#FFD447] text-xs font-bold tracking-widest uppercase">
              <Flame className="w-3.5 h-3.5" fill="currentColor" /> Hot Deals
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FFD447]">
              דילים חמים לחו"ל
            </h1>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/85 leading-relaxed">
              הצעות נבחרות לטיסות, חבילות נופש ודילים שמתעדכנים באופן שוטף על ידי צוות GoldTus.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={whatsappUrl("שלום, ראיתי את הדילים באתר ואשמח לקבל הצעה מותאמת")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all"
              >
                <MessageCircle className="w-4 h-4" fill="currentColor" />
                קבלו הצעות בוואטסאפ
              </a>
              <a
                href={GOLD_DEAL_CLUB_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[#FFD447] bg-white/10 border border-[#FFD447]/55 hover:bg-white/15 shadow-[0_10px_30px_-12px_rgba(255,212,71,0.45)] hover:translate-y-[-1px] transition-all"
              >
                <MessageCircle className="w-4 h-4" fill="currentColor" />
                מועדון דיל הזהב
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info box */}
      <section className="max-w-4xl mx-auto px-6 -mt-3 relative z-10">
        <div className="rounded-xl border border-[#FFD447]/30 bg-[#0b1f4a] p-4 sm:p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#FFD447]" />
            </div>
            <div className="text-xs sm:text-sm text-white/85 leading-relaxed">
              <span className="font-bold text-[#FFD447]">חשוב לדעת:</span>{" "}
              מחירי טיסות, בתי מלון וחבילות נופש משתנים באופן דינמי בהתאם לזמינות, ביקוש ועדכוני הספקים. כל המחירים המוצגים נכונים למועד פרסום ההצעה בלבד. המחיר הסופי נקבע במעמד ההזמנה בלבד. התמונות להמחשה בלבד. ט.ל.ח.
            </div>
          </div>
        </div>
      </section>

      {/* Deals grid */}
      <section className="max-w-6xl mx-auto px-6 py-6 sm:py-10">
        <SortToggle sort={sort} />
        {deals.length === 0 && (
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
          <a
            href={GOLD_DEAL_CLUB_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-[#FFD447] bg-white/10 border border-[#FFD447]/55 hover:bg-white/15 transition-all"
          >
            <MessageCircle className="w-5 h-5" fill="currentColor" />
            כניסה לקבוצת מועדון דיל הזהב
          </a>
        </div>
      </section>
    </div>
  );
}