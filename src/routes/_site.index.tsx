import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Award,
  Sparkles,
  ShieldCheck,
  Wifi,
  Plane,
  Crown,
} from "lucide-react";
import { QuickQuoteForm } from "@/components/site/QuickQuoteForm";
import heroImage from "@/assets/landing-hero.jpg";
import {
  canonical,
  ldScript,
  SITE_URL,
  PASSPORTCARD_URL,
  WIFLY_URL,
} from "@/lib/site-constants";

export { heroImage as landingHeroImage };

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1920&q=80",
    alt: "סנטוריני – יוון",
  },
  {
    url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1920&q=80",
    alt: "מלדיביים – בונגלו על המים",
  },
  {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80",
    alt: "פריז – מגדל אייפל",
  },
  {
    url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
    alt: "דובאי – קו רקיע",
  },
  {
    url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80",
    alt: "באלי – ריזורט טרופי",
  },
];

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "גולדטוס | טיסות וחופשות פרימיום בהתאמה אישית" },
      { name: "description", content: "גולדטוס מבית אמירים טורס: סוכן נסיעות פרימיום עם שירות אישי, טיסות עסקיות, מלונות יוקרה, VIP בנתב\"ג וקונסיירז' מלא. הצעה אישית בוואטסאפ." },
      { name: "keywords", content: "גולדטוס, GoldTus, אמירים טורס, סוכן נסיעות, טיסות פרימיום, חופשות יוקרה, VIP בנתב\"ג, ביטוח נסיעות" },
      { property: "og:title", content: "גולדטוס - טסים ברמה אחרת" },
      { property: "og:description", content: "טיסות וחופשות פרימיום עם שירות אישי ודילים נבחרים בלבד." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/") },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImage },
      { name: "twitter:title", content: "גולדטוס - טסים ברמה אחרת" },
      { name: "twitter:description", content: "טיסות וחופשות פרימיום עם שירות אישי ודילים נבחרים בלבד." },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
    scripts: [
      ldScript({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "גולדטוס",
        alternateName: "GoldTus",
        url: SITE_URL,
        inLanguage: "he-IL",
        publisher: { "@type": "Organization", name: "גולדטוס" },
      }),
    ],
  }),
  component: HomePage,
});

const whyUs = [
  { icon: Heart, title: "שירות אישי", desc: "מלווים אתכם מהרעיון ועד החזרה הביתה" },
  { icon: Award, title: "גב של אמירים טורס", desc: "עשרות שנות ניסיון ומוניטין בתעשייה" },
  { icon: Sparkles, title: "מחירים בלעדיים", desc: "דילים שמורים שלא תמצאו באתרי ההזמנות" },
  { icon: ShieldCheck, title: "ביטחון מלא", desc: "ליווי צמוד וזמינות מלאה בכל שעה" },
];

function HomePage() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setSlide((s) => (s + 1) % HERO_SLIDES.length),
      6000,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92svh] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          {HERO_SLIDES.map((s, i) => (
            <img
              key={s.url}
              src={s.url}
              alt={s.alt}
              width={1920}
              height={1080}
              fetchPriority={i === 0 ? "high" : "low"}
              decoding="async"
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1600ms] ease-in-out"
              style={{ opacity: slide === i ? 1 : 0 }}
            />
          ))}
          {/* Light gradient mask for legibility of dark text */}
          <div className="absolute inset-0 bg-gradient-to-l from-white/85 via-white/55 to-white/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Slider dots */}
        <div className="absolute z-20 bottom-6 inset-x-0 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.url}
              type="button"
              aria-label={`מעבר לתמונה ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                slide === i ? "w-8 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/60"
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-10 pt-28 sm:pt-32 pb-14">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-3 space-y-5 sm:space-y-6 text-center lg:text-right">
              <span className="inline-block text-[11px] sm:text-xs tracking-[0.35em] text-primary uppercase font-semibold bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-primary/15">
                Premium Wanderlust · גולדטוס
              </span>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-primary">
                טיסות וחופשות
                <span className="block bg-[linear-gradient(90deg,oklch(0.28_0.09_260),oklch(0.55_0.15_82),oklch(0.28_0.09_260))] bg-clip-text text-transparent">
                  פרימיום בהתאמה אישית
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-foreground/80 leading-relaxed max-w-lg mx-auto lg:mx-0">
                שלחו יעד, תאריכים ומספר נוסעים - נחזור עם דיל מדויק, בלי כאב ראש. שקט נפשי וניהול מלא מהתכנון ועד הנחיתה.
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/80 justify-center lg:justify-start pt-1">
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-accent" strokeWidth={1.75} /> טיסות פרימיום</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-accent" strokeWidth={1.75} /> שירות אישי</span>
                <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-accent" strokeWidth={1.75} /> VIP בנתב"ג</span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-[0_16px_36px_-12px_rgba(11,30,59,0.45)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-14px_rgba(11,30,59,0.55)] transition-all border border-[oklch(0.75_0.13_82_/_0.35)]"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  <span>לכל השירותים</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-white/70 backdrop-blur-sm text-primary px-5 py-2.5 text-sm font-bold hover:bg-white hover:-translate-y-0.5 transition-all"
                >
                  <Heart className="w-4 h-4 text-accent" strokeWidth={2} />
                  <span>ייעוץ אישי</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 lg:self-center">
              <QuickQuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* INSTANT TRAVEL ESSENTIALS – Affiliate zone */}
      <section className="relative -mt-10 sm:-mt-16 z-20 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-block text-[11px] tracking-[0.35em] text-accent uppercase font-bold">
              Instant Travel Essentials
            </span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-primary mt-1">
              סוגרים פינות לטיסה בקליק
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {/* Card A – Insurance */}
            <a
              href={PASSPORTCARD_URL}
              target="_blank"
              rel="noopener sponsored"
              className="group relative overflow-hidden rounded-3xl bg-white border border-primary/15 p-6 sm:p-7 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 animate-breathe-gold"
            >
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[oklch(0.75_0.13_82_/_0.15)] blur-2xl pointer-events-none" />
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] flex items-center justify-center text-primary-foreground shadow-[0_16px_30px_-14px_rgba(11,30,59,0.5)] ring-2 ring-[oklch(0.75_0.13_82_/_0.55)]">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="text-[11px] tracking-[0.3em] text-accent uppercase font-bold">PassportCard</div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-primary mt-1">ביטוח נסיעות פרימיום</h3>
                <p className="text-sm text-foreground/70 mt-1.5">כיסוי רפואי מלא בחו"ל, ללא השתתפות עצמית - הפעלה מיידית.</p>
                <span className="inline-flex items-center gap-2 mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold group-hover:bg-[oklch(0.22_0.08_260)] transition-colors">
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
              className="group relative overflow-hidden rounded-3xl bg-white border border-success/25 p-6 sm:p-7 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 animate-breathe-emerald"
            >
              <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[oklch(0.60_0.15_155_/_0.15)] blur-2xl pointer-events-none" />
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[linear-gradient(135deg,oklch(0.55_0.15_155),oklch(0.65_0.15_170))] flex items-center justify-center text-white shadow-[0_16px_30px_-14px_rgba(5,150,105,0.55)] ring-2 ring-white/60">
                <Wifi className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="text-[11px] tracking-[0.3em] text-success uppercase font-bold">WiFly · eSIM</div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-primary mt-1">אינטרנט גלובלי בקליק</h3>
                <p className="text-sm text-foreground/70 mt-1.5">חבילת סלולר / eSIM בכ-200 יעדים - הפעלה בדקה, ללא כרטיס פיזי.</p>
                <span className="inline-flex items-center gap-2 mt-3 rounded-full bg-success text-white px-4 py-2 text-xs font-bold group-hover:bg-[oklch(0.55_0.15_155)] transition-colors">
                  קבלו קופון והזמינו
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 sm:py-24 px-6 relative overflow-hidden mt-10">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="inline-block text-xs tracking-[0.35em] text-accent uppercase font-bold">למה גולדטוס</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary">
              שקט נפשי <span className="text-accent">מהזמנה ועד הנחיתה</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="group text-center bg-white rounded-2xl border border-primary/10 p-5 sm:p-6 hover:border-accent/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.2)] transition-all"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-[linear-gradient(135deg,oklch(0.98_0.005_90),oklch(0.94_0.02_82))] flex items-center justify-center ring-1 ring-accent/40 mb-4">
                  <item.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-primary">{item.title}</h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="pb-16 sm:pb-20 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          <Link to="/services" className="group p-6 rounded-2xl border border-primary/15 bg-white hover:border-accent transition-colors shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-accent tracking-[0.25em] uppercase mb-2 font-bold">שירותי פרימיום</div>
                <h3 className="font-display text-xl font-semibold text-primary">הכל תחת גג אחד</h3>
                <p className="text-sm text-muted-foreground mt-1">טיסות, מלונות, רכב, VIP ועוד</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/contact" className="group p-6 rounded-2xl border border-primary/15 bg-white hover:border-accent transition-colors shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-accent tracking-[0.25em] uppercase mb-2 font-bold">צור קשר</div>
                <h3 className="font-display text-xl font-semibold text-primary">בקשת הצעת מחיר</h3>
                <p className="text-sm text-muted-foreground mt-1">נחזור אליכם בתוך 24 שעות</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}