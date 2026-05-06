import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Award, Sparkles, ShieldCheck, Plane, Crown, Globe } from "lucide-react";
import { QuickQuoteForm } from "@/components/site/QuickQuoteForm";
import heroImage from "@/assets/landing-hero.jpg";

export { heroImage as landingHeroImage };

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "גולדטוס | טיסות וחופשות פרימיום בהתאמה אישית" },
      { name: "description", content: "גולדטוס מבית אמירים טורס: סוכן נסיעות פרימיום עם שירות אישי, טיסות עסקיות, מלונות יוקרה, VIP בנתב\"ג וקונסיירז' מלא. הצעה אישית בוואטסאפ." },
      { name: "keywords", content: "גולדטוס, GoldTus, אמירים טורס, סוכן נסיעות, טיסות פרימיום, חופשות יוקרה, VIP בנתב\"ג, ביטוח נסיעות" },
      { property: "og:title", content: "גולדטוס - טסים ברמה אחרת" },
      { property: "og:description", content: "טיסות וחופשות פרימיום עם שירות אישי ודילים נבחרים בלבד." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: HomePage,
});

const whyUs = [
  { icon: Heart, title: "שירות אישי" },
  { icon: Award, title: "גב של אמירים טורס" },
  { icon: Sparkles, title: "מחירים בלעדיים" },
  { icon: ShieldCheck, title: "ביטחון מלא" },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92svh] flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="חלון מטוס פרטי עם נוף עננים בשקיעת זהב"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-10 pt-28 sm:pt-32 pb-10">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 lg:gap-14 items-center">
            <div className="lg:col-span-3 space-y-5 sm:space-y-6 text-center lg:text-right">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                טיסות וחופשות
                <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                  פרימיום בהתאמה אישית
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-foreground/85 leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                שלחו יעד, תאריכים ומספר נוסעים — ונמצא לכם דיל מדויק בלי כאב ראש. שקט נפשי, ניהול מא׳ ועד ת׳.
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/80 justify-center lg:justify-start pt-1">
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-primary" strokeWidth={1.5} /> טיסות פרימיום</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.5} /> שירות אישי</span>
                <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-primary" strokeWidth={1.5} /> VIP בנתב"ג</span>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-glow hover:scale-[1.04] transition-transform"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  <span>לכל השירותים</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  to="/insurance"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-primary/70 bg-background/40 backdrop-blur-sm text-foreground px-5 py-2.5 text-sm font-bold hover:bg-primary/10 hover:scale-[1.04] transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span>ביטוח נסיעות</span>
                </Link>
                <Link
                  to="/travel-requirements"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-background/30 backdrop-blur-sm text-foreground/90 px-5 py-2.5 text-sm font-medium hover:bg-primary/10 transition-all"
                >
                  <Globe className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span>דרישות נסיעה</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 lg:self-center">
              <QuickQuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-14 sm:py-20 px-6 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">למה גולדטוס</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              שקט נפשי <span className="text-primary">מהזמנה ועד הנחיתה</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {whyUs.map((item, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full border border-primary/40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-14 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          <Link to="/services" className="group p-6 rounded-2xl border border-primary/30 bg-card/40 backdrop-blur-sm hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-primary tracking-[0.25em] uppercase mb-2">שירותי פרימיום</div>
                <h3 className="text-lg font-bold">הכל תחת גג אחד</h3>
                <p className="text-sm text-muted-foreground mt-1">טיסות, מלונות, רכב, VIP ועוד</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link to="/contact" className="group p-6 rounded-2xl border border-primary/30 bg-card/40 backdrop-blur-sm hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-primary tracking-[0.25em] uppercase mb-2">צור קשר</div>
                <h3 className="text-lg font-bold">בקשת הצעת מחיר</h3>
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