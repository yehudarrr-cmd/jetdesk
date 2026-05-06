import { createFileRoute } from "@tanstack/react-router";
import { Phone, MessageCircle, Globe, Clock } from "lucide-react";
import { LeadForm } from "@/components/site/LeadForm";
import { PHONE_DISPLAY, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "צור קשר וקבלת הצעת מחיר | גולדטוס" },
      { name: "description", content: "השאירו פרטים וגולדטוס תחזור אליכם עם הצעה אישית. ניתן ליצור קשר גם בטלפון 055-775-6660 או בוואטסאפ." },
      { property: "og:title", content: "צור קשר | גולדטוס" },
      { property: "og:description", content: "טופס בקשת הצעת מחיר חכם, טלפון וחיבור ישיר לוואטסאפ." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="px-6 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">צרו קשר</span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            בואו נדבר על
            <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-1">
              הנסיעה הבאה שלכם
            </span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            השאירו פרטים בטופס ונחזור עם הצעה אישית, או דברו איתנו ישירות.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <LeadForm />

          <aside className="space-y-4">
            <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-4 p-5 rounded-xl border border-primary/30 bg-card/40 backdrop-blur-sm hover:border-primary transition-colors">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">טלפון</div>
                <div className="font-semibold text-base" dir="ltr">{PHONE_DISPLAY}</div>
              </div>
            </a>

            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-xl border border-primary/30 bg-card/40 backdrop-blur-sm hover:border-primary transition-colors">
              <div className="w-11 h-11 rounded-lg bg-success/15 border border-success/30 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-success" fill="currentColor" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">וואטסאפ</div>
                <div className="font-semibold text-base">צ'אט מהיר עם הצוות</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">שעות פעילות</div>
                <div className="font-semibold text-sm">א'-ה' 9:00-19:00, ו' 9:00-13:00</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">אתר</div>
                <div className="font-semibold text-sm" dir="ltr">www.goldtus.com</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}