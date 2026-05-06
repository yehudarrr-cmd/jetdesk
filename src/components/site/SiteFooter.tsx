import { Link } from "@tanstack/react-router";
import { Plane, Phone, MessageCircle, Globe, ShieldCheck } from "lucide-react";
import { PHONE_DISPLAY, WHATSAPP_NUMBER, whatsappUrl } from "@/lib/site-constants";

export function SiteFooter() {
  return (
    <>
      <section className="py-10 px-6 border-t border-border/40 bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 text-sm">
          <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-medium tracking-wide" dir="ltr">{PHONE_DISPLAY}</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4 text-success" fill="currentColor" />
            <span className="font-medium">וואטסאפ</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <Link to="/insurance" className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-medium">ביטוח נסיעות</span>
          </Link>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <a href="https://www.goldtus.com" className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-medium tracking-wide" dir="ltr">www.goldtus.com</span>
          </a>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span className="tracking-wide">גולדטוס מבית אמירים טורס</span>
          </div>
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} GoldTus</span>
            <Link to="/auth" className="hover:text-primary transition-colors">
              כניסה למערכת
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}