import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ShieldCheck,
  Wifi,
  Plane,
  Crown,
  CreditCard,
  BookOpen,
  Stethoscope,
  Luggage,
  Signal,
  MessageCircle,
  Flame,
  UtensilsCrossed,
  HeadphonesIcon,
  Umbrella,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { QuickQuoteForm } from "@/components/site/QuickQuoteForm";
import {
  canonical,
  ldScript,
  SITE_URL,
  PASSPORTCARD_URL,
  WIFLY_URL,
  GOLD_DEAL_CLUB_WHATSAPP_URL,
} from "@/lib/site-constants";

const heroImage =
  "https://images.unsplash.com/photo-1724053377801-04d2e6817c17?w=1200&h=630&fit=crop&q=85&auto=format";

export const landingHeroImage = heroImage;

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1724053377801-04d2e6817c17?auto=format&fit=crop&w=1920&q=80",
    alt: "איי סיישל – חוף טורקיז וחול לבן",
  },
  {
    url: "https://images.unsplash.com/photo-1721989253907-a6242e07c5b2?auto=format&fit=crop&w=1920&q=80",
    alt: "איי סיישל – Anse Source d'Argent, סלעים ומים צלולים",
  },
  {
    url: "https://images.unsplash.com/photo-1636110026885-8950fbdd3e74?auto=format&fit=crop&w=1920&q=80",
    alt: "איי סיישל – מבט אווירי על חוף ואוקיינוס",
  },
  {
    url: "https://images.unsplash.com/photo-1693260741045-2c136abbb95f?auto=format&fit=crop&w=1920&q=80",
    alt: "איי סיישל – סלעי גרניט ומים כחולים",
  },
  {
    url: "https://images.unsplash.com/photo-1729606684010-ed7627949061?auto=format&fit=crop&w=1920&q=80",
    alt: "איי סיישל – סירות ועצי דקל על חוף חולי",
  },
];

const TIP_IMAGES = {
  credit: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
  passport: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?auto=format&fit=crop&w=800&q=80",
  georgia: "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80",
  connection: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
  esim: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
};

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "גולדטוס | סוכנות נסיעות פרימיום עם שירות אישי" },
      { name: "description", content: "אתם אורזים מזוודה — אנחנו דואגים לכל השאר. טיסות, מלונות, העברות, השכרת רכב, ביטוח נסיעות, eSIM ושירות אישי — הכל במקום אחד. הצעה אישית בוואטסאפ." },
      { name: "keywords", content: "גולדטוס, GoldTus, סוכנות נסיעות פרימיום, סוכן נסיעות אישי, טיסות, מלונות, ביטוח נסיעות, השכרת רכב, eSIM, VIP בנתב\"ג, דילים לחו\"ל" },
      { property: "og:title", content: "גולדטוס | אתם אורזים מזוודה - אנחנו כבר נדאג לכל השאר" },
      { property: "og:description", content: "טיסות, מלונות, העברות, השכרת רכב, ביטוח נסיעות, eSIM ושירות אישי — הכל במקום אחד, עם ליווי אישי מהתכנון ועד הנחיתה." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "גולדטוס" },
      { property: "og:locale", content: "he_IL" },
      { property: "og:url", content: canonical("/") },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImage },
      { name: "twitter:title", content: "גולדטוס | אתם אורזים מזוודה - אנחנו כבר נדאג לכל השאר" },
      { name: "twitter:description", content: "שירות אישי, זמינות מלאה, ושקט נפשי לפני, במהלך ואחרי הנסיעה." },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
    scripts: [
      ldScript({
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "גולדטוס",
        alternateName: "GoldTus",
        url: SITE_URL,
        inLanguage: "he-IL",
        description: "סוכנות נסיעות פרימיום עם שירות אישי — טיסות, מלונות, ביטוח נסיעות, eSIM ושירות VIP.",
        areaServed: "IL",
      }),
    ],
  }),
  component: HomePage,
});

const trustPillars = [
  { icon: Crown, title: "שירות VIP אישי", desc: "מנהל תיק ייעודי לכל לקוח" },
  { icon: HeadphonesIcon, title: "ליווי לפני, במהלך ואחרי", desc: "זמינים בכל שלב של הנסיעה" },
  { icon: Plane, title: "טיסות, מלונות, ביטוח ו-eSIM", desc: "הכל תחת גג אחד — בלי לרוץ בין ספקים" },
  { icon: MessageCircle, title: "מענה מהיר בוואטסאפ", desc: "תגובה בדרך כלל תוך דקות" },
];

const reviews = [
  {
    name: "יעל ק.",
    trip: "פאפוס · חופשה זוגית",
    quote:
      "יחס אישי אמיתי מהרגע הראשון. שאלנו שאלות בכל שעה של היום — וקיבלנו מענה מיידי. הרגשנו שיש עלינו מי שסומכים.",
  },
  {
    name: "אבי מ.",
    trip: "מלדיביים · ירח דבש",
    quote:
      "חסכו לנו ימים של חיפושים. הכל תואם מראש — טיסה, מלון, העברות וביטוח. הגענו רגועים ליעד בלי לגעת בכלום.",
  },
  {
    name: "משפחת לוי",
    trip: "רומא · חופשת פסח",
    quote:
      "הליווי היה אישי, מקצועי וזמין. גם כשהיו שינויים בטיסה — טיפלו בזה במקומנו. שקט נפשי אמיתי לאורך כל הדרך.",
  },
  {
    name: "דנה ש.",
    trip: "יוון · חופשה משפחתית",
    quote:
      "מרגישים שיש עליכם מישהו שדואג. תשובה מהירה בוואטסאפ, המלצות מדויקות, וטיפול בכל פרט קטן. חוזרים בהמשך השנה.",
  },
];

function HomePage() {
  const [slide, setSlide] = useState(0);
  const [review, setReview] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      7500,
    );
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const id = window.setInterval(
      () => setReview((r) => (r + 1) % reviews.length),
      6500,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {/* HERO — cinematic slider with subtle Ken-Burns zoom */}
      <section className="relative bg-[#001a4d] overflow-hidden">
        {/* Full-width slider band */}
        <div className="relative w-full h-[68vh] min-h-[520px] sm:min-h-[560px] lg:min-h-[640px] max-h-[820px]">
          {HERO_SLIDES.map((s, i) => (
            <div
              key={s.url}
              className="absolute inset-0 overflow-hidden transition-opacity duration-[1800ms] ease-in-out"
              style={{ opacity: slide === i ? 1 : 0 }}
              aria-hidden={slide === i ? undefined : true}
            >
              <img
                src={s.url}
                alt={s.alt}
                width={1920}
                height={1080}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 w-full h-full object-cover ${
                  slide === i ? "animate-hero-zoom" : ""
                }`}
                style={{ transform: slide === i ? undefined : "scale(1.04)" }}
              />
            </div>
          ))}
          {/* Stronger cinematic overlay for readability */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,26,77,0.55)_0%,rgba(0,26,77,0.35)_45%,rgba(0,26,77,0.85)_100%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(255,212,71,0.10),transparent_55%)]" />

          {/* Headline overlay */}
          <div className="absolute inset-0 flex items-center pb-24 sm:pb-28">
            <div className="max-w-7xl mx-auto w-full px-5 sm:px-10 text-right text-white">
              <span className="inline-block animate-rise-in text-[11px] sm:text-xs tracking-[0.45em] uppercase font-medium bg-white/8 backdrop-blur-md rounded-full px-5 py-2 border border-white/25">
                Premium Wanderlust · גולדטוס
              </span>
              <h1
                className="mt-6 animate-rise-in font-display text-4xl sm:text-6xl lg:text-[5.25rem] font-semibold leading-[1.05] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
                style={{ animationDelay: "120ms" }}
              >
                טסים ברמה אחרת
                <span className="block text-[#FFD447] mt-3 font-normal">חופשות פרימיום בהתאמה אישית</span>
              </h1>
              <p
                className="mt-6 animate-rise-in text-base sm:text-lg lg:text-xl font-light text-white/90 leading-relaxed max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
                style={{ animationDelay: "260ms" }}
              >
                שלחו יעד, תאריכים ומספר נוסעים — נחזור עם הצעה מדויקת. ליווי אישי, מהתכנון ועד הנחיתה.
              </p>
              <div
                className="mt-7 animate-rise-in flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-white/80"
                style={{ animationDelay: "400ms" }}
              >
                <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-[#FFD447]" strokeWidth={1.6} /> טיסות פרימיום</span>
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#FFD447]" strokeWidth={1.6} /> שירות אישי</span>
                <span className="hidden sm:inline h-1 w-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-[#FFD447]" strokeWidth={1.6} /> VIP בנתב"ג</span>
              </div>
            </div>
          </div>

          {/* Slider dots */}
          <div className="absolute z-10 bottom-8 inset-x-0 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.url}
                type="button"
                aria-label={`מעבר לתמונה ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  slide === i ? "w-12 bg-[#FFD447]" : "w-6 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating booking card — lighter, thinner ring */}
        <div className="relative z-20 max-w-5xl mx-auto px-5 sm:px-10 -mt-24 sm:-mt-32 pb-14">
          <div className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_40px_100px_-30px_rgba(0,10,40,0.5)] ring-1 ring-black/5 p-5 sm:p-8">
            <QuickQuoteForm />
          </div>
        </div>
      </section>

      {/* TRUST BAR — clean 4-column, generous whitespace, no cards */}
      <section className="bg-white py-16 sm:py-24 px-5 sm:px-10 border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <span className="inline-block text-[11px] tracking-[0.4em] text-[#c99a1e] uppercase font-medium">
              Why GoldTus
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold tracking-tight text-[#001a4d]">
              שקט נפשי מהתכנון ועד הנחיתה
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {trustPillars.map((p, i) => (
              <div key={i} className="text-center px-2 group">
                <div className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center bg-[#FFF7DA] ring-1 ring-[#FFD447]/40 group-hover:ring-[#FFD447] transition-all">
                  <p.icon className="w-6 h-6 text-[#c99a1e]" strokeWidth={1.6} />
                </div>
                <h3 className="text-[15px] font-semibold text-[#001a4d]">{p.title}</h3>
                <p className="mt-2 text-[13px] text-[#001a4d]/60 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTANT TRAVEL ESSENTIALS — softer cream bg, lighter cards */}
      <section className="relative py-20 sm:py-24 px-5 sm:px-10 bg-[#FAF8F3]">
        <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(255,212,71,0.10),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-block text-[11px] tracking-[0.4em] text-[#c99a1e] uppercase font-medium">
              Instant Travel Essentials
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold tracking-tight text-[#001a4d]">
              סוגרים פינות לטיסה — בקליק
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card A – Insurance */}
            <a
              href={PASSPORTCARD_URL}
              target="_blank"
              rel="noopener sponsored"
              className="group relative overflow-hidden rounded-3xl bg-white border border-black/[0.06] p-7 sm:p-8 flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-25px_rgba(0,26,77,0.25)] transition-all duration-500"
            >
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#001a4d] flex items-center justify-center text-[#FFD447]">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="text-[10px] tracking-[0.3em] text-[#c99a1e] uppercase font-medium">PassportCard</div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#001a4d] mt-1.5">ביטוח נסיעות פרימיום</h3>
                <p className="text-[13.5px] text-[#001a4d]/65 mt-2 leading-relaxed">כיסוי רפואי מלא בחו"ל, ללא השתתפות עצמית — הפעלה מיידית.</p>
                <span className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#001a4d] group-hover:text-[#c99a1e] transition-colors">
                  להזמנה ולפרטים
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </a>

            {/* Card B – eSIM */}
            <a
              href={WIFLY_URL}
              target="_blank"
              rel="noopener sponsored"
              className="group relative overflow-hidden rounded-3xl bg-white border border-black/[0.06] p-7 sm:p-8 flex items-center gap-5 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-25px_rgba(6,95,70,0.25)] transition-all duration-500"
            >
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[oklch(0.55_0.15_155)] flex items-center justify-center text-white">
                <Wifi className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="text-[10px] tracking-[0.3em] text-[oklch(0.45_0.13_155)] uppercase font-medium">WiFly · eSIM</div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#001a4d] mt-1.5">אינטרנט גלובלי בקליק</h3>
                <p className="text-[13.5px] text-[#001a4d]/65 mt-2 leading-relaxed">חבילת סלולר / eSIM בכ-200 יעדים — הפעלה בדקה, ללא כרטיס פיזי.</p>
                <span className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#001a4d] group-hover:text-[oklch(0.45_0.13_155)] transition-colors">
                  קבלו קופון והזמינו
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF — warm ivory reviews slider */}
      <section className="relative py-20 sm:py-28 px-5 sm:px-10 bg-[#FAF6EC]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,212,71,0.10),transparent_65%)]" />
        <div className="relative">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-[11px] tracking-[0.4em] text-[#c99a1e] uppercase font-medium">
            Client Voices
          </span>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold tracking-tight text-[#001a4d]">
            לקוחות שחזרו אלינו — ומספרים
          </h2>
          <p className="mt-3 text-sm text-[#001a4d]/60 max-w-xl mx-auto">
            מאות משפחות וזוגות סמכו עלינו לתכנן את החופשה שלהם — הנה כמה מהחוויות שלהם.
          </p>

          <div className="relative mt-12 min-h-[220px] sm:min-h-[200px]">
            {reviews.map((r, i) => (
              <blockquote
                key={i}
                aria-hidden={review === i ? undefined : true}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
                style={{
                  opacity: review === i ? 1 : 0,
                  transform: `translateY(${review === i ? 0 : 8}px)`,
                  pointerEvents: review === i ? "auto" : "none",
                }}
              >
                <p className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-light text-[#001a4d] leading-[1.5] max-w-2xl">
                  “{r.quote}”
                </p>
                <footer className="mt-6 text-sm text-[#001a4d]/70">
                  <span className="font-semibold text-[#001a4d]">{r.name}</span>
                  <span className="mx-2 text-[#001a4d]/30">·</span>
                  <span>{r.trip}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setReview((r) => (r - 1 + reviews.length) % reviews.length)}
              className="w-9 h-9 rounded-full border border-[#001a4d]/15 flex items-center justify-center text-[#001a4d] hover:border-[#FFD447] hover:text-[#c99a1e] transition-colors"
              aria-label="ביקורת קודמת"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`מעבר לביקורת ${i + 1}`}
                  onClick={() => setReview(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    review === i ? "w-8 bg-[#FFD447]" : "w-4 bg-[#001a4d]/15 hover:bg-[#001a4d]/30"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReview((r) => (r + 1) % reviews.length)}
              className="w-9 h-9 rounded-full border border-[#001a4d]/15 flex items-center justify-center text-[#001a4d] hover:border-[#FFD447] hover:text-[#c99a1e] transition-colors"
              aria-label="ביקורת הבאה"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-10">
            <a
              href={GOLD_DEAL_CLUB_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#001a4d] hover:text-[#c99a1e] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              הצטרפו למועדון דיל הזהב בוואטסאפ
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
        </div>
      </section>

      {/* SEO TRAVEL TIPS HUB — lighter blog cards */}
      <section className="py-20 sm:py-24 px-5 sm:px-10 bg-[#FAF8F3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <span className="inline-block text-[11px] tracking-[0.4em] text-[#c99a1e] uppercase font-medium">
              Knowledge Base
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold tracking-tight text-[#001a4d]">
              טיפים חכמים למטייל הישראלי
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right">
              <div className="relative h-56 overflow-hidden">
                <img src={TIP_IMAGES.credit} alt="תשלום בכרטיס אשראי בחו״ל" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out" loading="lazy" />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <CreditCard className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  אשראי בחו"ל — שקלים או מטבע מקומי?
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  כמעט תמיד עדיף לבחור במטבע המקומי — ההמרה לשקלים בקופה כוללת שער המרה גבוה שאינו משתלם. בחירה במטבע המקומי משאירה את ההמרה לחברת האשראי שלכם.
                </p>
              </div>
            </article>

            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right">
              <div className="relative h-56 overflow-hidden">
                <img src={TIP_IMAGES.passport} alt="תוקף דרכון" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out" loading="lazy" />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  תוקף דרכון — 6 חודשים לפני היציאה
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  מדינות רבות דורשות דרכון בתוקף של לפחות 6 חודשים מיום הכניסה. בדקו את הדרכון עוד לפני שאתם מזמינים את החופשה.
                </p>
              </div>
            </article>

            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right">
              <div className="relative h-56 overflow-hidden">
                <img src={TIP_IMAGES.georgia} alt="גאורגיה - טביליסי" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out" loading="lazy" />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <Stethoscope className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  חובת ביטוח רפואי לגאורגיה
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  משטרת הגבולות בגאורגיה דורשת ביטוח רפואי בתוקף לכל תייר. ודאו שהפקתם פוליסה מתאימה עוד לפני שאתם עולים לטיסה.
                </p>
                <a
                  href={PASSPORTCARD_URL}
                  target="_blank"
                  rel="noopener sponsored"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#001a4d] hover:text-[#c99a1e] transition-colors"
                >
                  להפקת ביטוח ב-PassportCard
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </article>

            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right">
              <div className="relative h-56 overflow-hidden">
                <img src={TIP_IMAGES.connection} alt="טיסת קונקשן" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out" loading="lazy" />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <Luggage className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  טיסת קונקשן — איך לא לאבד את המזוודה
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  זמן חיבור מינימלי, העברת מזוודות אוטומטית ובחירת מסופים חכמה — אנחנו בונים מסלול שמפחית סיכונים ומבטיח נחיתה חלקה.
                </p>
              </div>
            </article>

            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right md:col-span-2 lg:col-span-1">
              <div className="relative h-56 overflow-hidden">
                <img src={TIP_IMAGES.esim} alt="eSIM לחו״ל" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out" loading="lazy" />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <Signal className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  eSIM לחו"ל — מחוברים בזול
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  חבילות eSIM זולות משמעותית מרומינג, מהירות ומופעלות בדקה — בלי כרטיס SIM פיזי.
                </p>
                <a
                  href={WIFLY_URL}
                  target="_blank"
                  rel="noopener sponsored"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#001a4d] hover:text-[#c99a1e] transition-colors"
                >
                  לרכישת חבילת גלישה
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </article>

            <article className="group bg-white rounded-2xl overflow-hidden border border-black/[0.05] shadow-[0_10px_30px_-15px_rgba(0,26,77,0.15)] hover:shadow-[0_25px_50px_-20px_rgba(0,26,77,0.25)] hover:-translate-y-1 transition-all duration-500 text-right">
              <div className="relative h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1508433957232-3107f5fd5995?auto=format&fit=crop&w=800&q=80"
                  alt="טיפ לחיסכון בביטוח נסיעות"
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1200ms] ease-out"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#001a4d] shadow-sm">
                  <Umbrella className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-semibold text-[#001a4d] leading-snug">
                  טיפ לחיסכון בביטוח נסיעות
                </h3>
                <p className="mt-3 text-sm text-[#001a4d]/65 leading-relaxed line-clamp-3">
                  אם יש לכם גמישות בתאריכים, השתדלו להימנע מטיסות בימי ראשון וחמישי. ברוב המקרים אלו ימים מבוקשים יותר, ולכן גם מחירי ביטוח הנסיעות נוטים להיות גבוהים יותר לעומת אמצע השבוע.
                </p>
                <a
                  href={PASSPORTCARD_URL}
                  target="_blank"
                  rel="noopener sponsored"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-[#001a4d] hover:text-[#c99a1e] transition-colors"
                >
                  להשוואת ביטוחי נסיעות
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA STRIP — compact, warm ivory */}
      <section className="py-16 sm:py-20 px-5 sm:px-10 bg-[#FAF6EC]">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/deals" className="group p-6 rounded-2xl bg-white border border-black/[0.06] hover:border-[#FFD447] hover:-translate-y-0.5 transition-all shadow-[0_10px_30px_-15px_rgba(0,26,77,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#c99a1e] tracking-[0.3em] uppercase mb-2 font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" fill="currentColor" /> דילים חמים
                </div>
                <h3 className="font-display text-lg font-semibold text-[#001a4d]">חופשות במחירי היכרות</h3>
                <p className="text-sm text-[#001a4d]/60 mt-1">טיסות + מלון במחירים מוזלים</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#001a4d]/60 group-hover:text-[#c99a1e] group-hover:-translate-x-1 transition-all" />
            </div>
          </Link>
          <Link to="/kosher-deals" className="group p-6 rounded-2xl bg-white border border-black/[0.06] hover:border-[#0b6b3a] hover:-translate-y-0.5 transition-all shadow-[0_10px_30px_-15px_rgba(0,26,77,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#0b6b3a] tracking-[0.3em] uppercase mb-2 font-semibold flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5" /> דילים כשרים
                </div>
                <h3 className="font-display text-lg font-semibold text-[#001a4d]">חופשה עם מלון כשר</h3>
                <p className="text-sm text-[#001a4d]/60 mt-1">מלונות בהשגחה, אוכל מהדרין</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#001a4d]/60 group-hover:text-[#0b6b3a] group-hover:-translate-x-1 transition-all" />
            </div>
          </Link>
          <Link to="/services" className="group p-6 rounded-2xl bg-white border border-black/[0.06] hover:border-[#FFD447] hover:-translate-y-0.5 transition-all shadow-[0_10px_30px_-15px_rgba(0,26,77,0.12)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#c99a1e] tracking-[0.3em] uppercase mb-2 font-semibold">שירותי פרימיום</div>
                <h3 className="font-display text-lg font-semibold text-[#001a4d]">הכל תחת גג אחד</h3>
                <p className="text-sm text-[#001a4d]/60 mt-1">טיסות, מלונות, רכב, VIP ועוד</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#001a4d]/60 group-hover:text-[#c99a1e] group-hover:-translate-x-1 transition-all" />
            </div>
          </Link>
          <Link to="/contact" className="group p-6 rounded-2xl bg-[#001a4d] border border-[#FFD447]/40 hover:border-[#FFD447] hover:-translate-y-0.5 transition-all shadow-[0_20px_40px_-15px_rgba(0,26,77,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#FFD447] tracking-[0.3em] uppercase mb-2 font-semibold">צור קשר</div>
                <h3 className="font-display text-lg font-semibold text-white">בקשת הצעת מחיר</h3>
                <p className="text-sm text-white/70 mt-1">נחזור אליכם תוך 24 שעות</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#FFD447] group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* FINAL CTA — clean premium closer */}
      <section className="relative overflow-hidden bg-[#001a4d] py-24 sm:py-32 px-5 sm:px-10">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,212,71,0.18),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,212,71,0.4),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,212,71,0.25),transparent)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block text-[11px] tracking-[0.45em] text-[#FFD447] uppercase font-medium">
            Your next journey · begins here
          </span>
          <h2 className="mt-5 font-display text-3xl sm:text-5xl lg:text-[3.5rem] font-semibold text-white leading-[1.1] tracking-tight">
            החופשה הבאה שלכם
            <span className="block text-[#FFD447] font-light mt-2">מתחילה בשיחה אחת</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-xl mx-auto">
            ספרו לנו לאן חלמתם — נחזור עם הצעה מדויקת, אישית ובטוב טעם. ללא התחייבות.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#FFD447] text-[#001a4d] px-8 py-4 text-sm font-semibold hover:bg-[#FFC000] shadow-[0_20px_50px_-15px_rgba(255,212,71,0.6)] hover:-translate-y-0.5 transition-all"
            >
              קבלת הצעה אישית
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <a
              href={GOLD_DEAL_CLUB_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 text-white px-8 py-4 text-sm font-medium hover:border-[#FFD447] hover:text-[#FFD447] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              שיחה בוואטסאפ
            </a>
          </div>
        </div>
      </section>
    </>
  );
}