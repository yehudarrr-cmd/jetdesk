import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plane, Briefcase, Globe, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { INSURANCE_URL } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/insurance")({
  head: () => ({
    meta: [
      { title: "ביטוח נסיעות לחו\"ל | גולדטוס - פוליסה דיגיטלית מהירה" },
      { name: "description", content: "ביטוח נסיעות לחו\"ל בפספורט קארד דרך גולדטוס - פוליסה דיגיטלית מאובטחת, רכישה עצמאית במהירות, כיסוי מלא לכל יעד." },
      { property: "og:title", content: "ביטוח נסיעות לחו\"ל | גולדטוס" },
      { property: "og:description", content: "סגרו ביטוח נסיעות לחו\"ל לפני הטיסה — דיגיטלי, מהיר ומאובטח." },
    ],
  }),
  component: InsurancePage,
});

const benefits = [
  "כיסוי רפואי מלא בחו\"ל",
  "ביטול וקיצור נסיעה",
  "אובדן ועיכוב כבודה",
  "פוליסה דיגיטלית מיידית",
];

function InsurancePage() {
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <Card className="relative p-8 sm:p-12 bg-card/40 backdrop-blur-sm border border-primary/30 rounded-2xl shadow-gold-soft text-center overflow-hidden">
          <div className="absolute inset-0 gradient-radial-gold opacity-30 pointer-events-none" />
          <div className="relative space-y-6">
            <div className="relative w-16 h-16 mx-auto rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
              <Plane className="absolute -bottom-1 -left-1 w-4 h-4 text-primary bg-background rounded-full p-0.5 border border-primary/40" strokeWidth={1.5} />
            </div>

            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">שקט נפשי בנסיעה</span>

            <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
              ביטוח נסיעות לחו"ל
              <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-1">
                סוגרים את זה לפני הטיסה
              </span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              דרך האתר שלנו תוכלו לעבור ישירות לרכישת ביטוח נסיעות בפספורט קארד —
              מהיר, נוח ומאובטח. הפוליסה מונפקת דיגיטלית תוך דקות.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto text-right">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a href={INSURANCE_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full sm:w-auto">
                <Button type="button" className="w-full sm:w-auto gradient-primary text-primary-foreground shadow-glow font-semibold h-12 px-10 text-base gap-2 hover:scale-[1.02] transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                  לרכישת ביטוח נסיעות
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> כל העולם</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> פוליסה דיגיטלית</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> רכישה מאובטחת</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}