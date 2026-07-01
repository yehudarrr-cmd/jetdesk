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
  CreditCard,
  BookOpen,
  Stethoscope,
  Luggage,
  Signal,
} from "lucide-react";
import { QuickQuoteForm } from "@/components/site/QuickQuoteForm";
import {
  canonical,
  ldScript,
  SITE_URL,
  PASSPORTCARD_URL,
  WIFLY_URL,
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
      {/* HERO – El Al inspired: full-width horizontal slider on top, floating booking card below */}
      <section className="relative bg-[#002d72] overflow-hidden">
        {/* Full-width slider band */}
        <div className="relative w-full h-[62vh] min-h-[460px] sm:min-h-[520px] lg:min-h-[600px] max-h-[780px]">
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
          {/* El Al style deep-blue overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,45,114,0.55)_0%,rgba(0,45,114,0.25)_35%,rgba(0,45,114,0.75)_100%)] pointer-events-none" />

          {/* Headline overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto w-full px-5 sm:px-10 text-right text-white">
              <span className="inline-block text-[11px] sm:text-xs tracking-[0.4em] uppercase font-semibold bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 border border-white/30">
                Premium Wanderlust · גולדטוס
              </span>
              <h1 className="mt-5 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                טסים ברמה אחרת
                <span className="block text-[#FFD447] mt-2">חופשות פרימיום בהתאמה אישית</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg lg:text-xl font-medium text-white/90 leading-relaxed max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                שלחו יעד, תאריכים ומספר נוסעים - נחזור עם דיל מדויק, ללא כאב ראש. ניהול מלא מהתכנון ועד הנחיתה.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
                <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-[#FFD447]" strokeWidth={2} /> טיסות פרימיום</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#FFD447]" strokeWidth={2} /> שירות אישי</span>
                <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-[#FFD447]" strokeWidth={2} /> VIP בנתב"ג</span>
              </div>
            </div>
          </div>

          {/* Slider dots */}
          <div className="absolute z-10 bottom-6 inset-x-0 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.url}
                type="button"
                aria-label={`מעבר לתמונה ${i + 1}`}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  slide === i ? "w-10 bg-[#FFD447]" : "w-2 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating booking card – El Al style, overlaps slider */}
        <div className="relative z-20 max-w-6xl mx-auto px-5 sm:px-10 -mt-24 sm:-mt-28 pb-16">
          <div className="rounded-2xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-primary/10 p-5 sm:p-7">
            <QuickQuoteForm />
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

      {/* SOCIAL PROOF – WhatsApp testimonial */}
      <section className="py-16 sm:py-24 px-5 sm:px-10 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-none text-right">
            <span className="inline-block text-[11px] tracking-[0.35em] text-accent uppercase font-bold">
              Real Client - Real Words
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.15] tracking-tight text-primary">
              לא אני אומר. לקוח שחזר הלילה מפאפוס אומר.
            </h2>
            <p className="mt-5 text-base sm:text-lg font-medium text-foreground/85 leading-relaxed">
              בסוף לא זוכרים רק את המלון או את הטיסה. זוכרים את מי שדואג לך.
            </p>
            <p className="mt-6 text-sm sm:text-base text-foreground/70 italic">
              תודה על האמון. מחכה לחופשה הבאה שלכם.
            </p>
          </div>

          <div className="order-1 lg:order-none flex justify-center">
            <div className="relative w-[300px] sm:w-[340px] rounded-[42px] bg-[#0b1e3b] p-3 shadow-[0_40px_80px_-30px_rgba(11,30,59,0.55)] ring-1 ring-primary/20">
              <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
                <div className="h-6 w-32 rounded-b-2xl bg-[#0b1e3b]" />
              </div>
              <div className="rounded-[32px] overflow-hidden bg-[#ECE5DD]">
                <div className="bg-[#075E54] text-white px-4 pt-8 pb-3 flex items-center gap-3" dir="rtl">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">ג</div>
                  <div className="flex-1 text-right">
                    <div className="text-sm font-semibold">לקוח גולדטוס</div>
                    <div className="text-[11px] text-white/80">Yesterday, 23:20</div>
                  </div>
                </div>
                <div className="px-3 py-4 space-y-2 min-h-[360px]" dir="rtl">
                  <div className="max-w-[85%] bg-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm text-[#111] shadow-sm mr-auto text-right">
                    מה קורה? יקר<br />
                    נחתנו בשלום תודה רבה על הכל<br />
                    על הזמינות והשירות<br />
                    הכל הלך מעולה<br />
                    נהנו מאוד כמובן<br />
                    שבפעם הבאה אנחנו איתך
                    <div className="text-[10px] text-black/40 mt-1">23:18</div>
                  </div>
                  <div className="max-w-[75%] bg-[#DCF8C6] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#111] shadow-sm ml-auto text-right">
                    איזה כיף לשמוע. שמח שנהניתם. תודה
                    <div className="text-[10px] text-black/40 mt-1 flex justify-end gap-1">23:20 ✓✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO TRAVEL TIPS HUB */}
      <section className="py-16 sm:py-24 px-5 sm:px-10 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-[11px] tracking-[0.35em] text-accent uppercase font-bold">
              Knowledge Base
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary">
              טיפים חכמים למטייל הישראלי
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <article className="bg-white rounded-2xl border border-primary/10 p-6 shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.3)] transition-all text-right">
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] flex items-center justify-center text-primary-foreground mb-4">
                <CreditCard className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-primary leading-snug">
                תשלום בכרטיס אשראי בחו"ל - האם לבחור בשקלים או במטבע המקומי?
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                כשאתם משלמים בחו"ל בכרטיס אשראי, מסוף התשלום יציע לכם לעיתים קרובות לבחור בין חיוב בשקלים (ILS) לבין חיוב במטבע המקומי. התשובה החד-משמעית היא: כמעט תמיד עדיף לבחור במטבע המקומי. ההמרה לשקלים בקופה כוללת כמעט תמיד שער המרה גבוה מאוד ופחות משתלם. בחירה במטבע המקומי משאירה את עמלת ההמרה לחברת האשראי שלכם, שהיא לרוב זולה ומשתלמת משמעותית.
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-primary/10 p-6 shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.3)] transition-all text-right">
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,oklch(0.55_0.15_82),oklch(0.65_0.15_82))] flex items-center justify-center text-primary mb-4">
                <BookOpen className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-primary leading-snug">
                תוקף דרכון לטיסה - כמה חודשים מראש חובה לבדוק את הדרכון?
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                הידעתם? עצם העובדה שהדרכון שלכם בתוקף למהלך השהות אינה מספיקה. מדינות רבות ברחבי העולם (כולל אירופה וארה"ב) דורשות באופן רשמי שהדרכון שלכם יהיה בתוקף של לפחות 6 חודשים מעבר ליום הכניסה למדינה. לא מעט נוסעים מגיעים מדי יום לנתב"ג ומגלים ברגע האחרון שהם אינם יכולים לעלות לטיסה. בדקו את תוקף הדרכון שלכם עוד לפני הזמנת החופשה!
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-primary/10 p-6 shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.3)] transition-all text-right">
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,oklch(0.55_0.15_155),oklch(0.65_0.15_170))] flex items-center justify-center text-white mb-4">
                <Stethoscope className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-primary leading-snug">
                חובת ביטוח רפואי לגאורגיה - חוק חדש למטיילים בטביליסי ובאטומי
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                ממשלת גאורגיה החלה לאכוף בקפידה חוק חדש המטיל חובת הצגת ביטוח רפואי לכל תייר הנכנס למדינה. כבר לא מדובר בהמלצה, אלא בדרישה רשמית של משטרת הגבולות הגאורגית לחובת כיסוי מלא לכל ימי השהות. ודאו שהפקתם פוליסה מתאימה ושמרתם אותה בנייד.
              </p>
              <a
                href={PASSPORTCARD_URL}
                target="_blank"
                rel="noopener sponsored"
                className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary hover:text-accent transition-colors"
              >
                לחצו כאן להפקת ביטוח נסיעות מותאם לגאורגיה ב-PassportCard
                <ArrowLeft className="w-4 h-4" />
              </a>
            </article>

            <article className="bg-white rounded-2xl border border-primary/10 p-6 shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.3)] transition-all text-right">
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] flex items-center justify-center text-primary-foreground mb-4">
                <Luggage className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-primary leading-snug">
                טיסת קונקשן (טיסה עם עצירת ביניים) - איך לעשות את זה נכון ובלי לאבד את המזוודה?
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                טיסת המשך דורשת תכנון קפדני: זמן חיבור מינימלי, בדיקת העברת מזוודות אוטומטית בין חברות התעופה, וידוא מסוף היציאה, וסיכוני הגעה באיחור. אנחנו בונים לכם מסלול טיסה שמפחית סיכונים ומבטיח נחיתה חלקה עם המזוודה במקום הנכון.
              </p>
            </article>

            <article className="bg-white rounded-2xl border border-primary/10 p-6 shadow-[0_10px_30px_-20px_rgba(11,30,59,0.25)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,30,59,0.3)] transition-all text-right md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,oklch(0.55_0.15_155),oklch(0.65_0.15_170))] flex items-center justify-center text-white mb-4">
                <Signal className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-primary leading-snug">
                eSIM לחו"ל או חבילת גלישה מהארץ - מה הדרך הזולה ביותר להישאר מחוברים?
              </h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed">
                חבילות eSIM לרוב זולות משמעותית מחבילות רומינג של המפעילים בארץ, מציעות מהירות טובה יותר, ומופעלות בדקה - בלי להחליף כרטיס SIM פיזי. השוו את מחיר הג'יגה ליום השהות ואת מספר הימים הכלולים בחבילה לפני שאתם רוכשים.
              </p>
              <a
                href={WIFLY_URL}
                target="_blank"
                rel="noopener sponsored"
                className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-success hover:text-primary transition-colors"
              >
                לרכישת חבילת גלישה משתלמת ואינטרנט מהיר לחו"ל בקליק לחצו כאן
                <ArrowLeft className="w-4 h-4" />
              </a>
            </article>
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