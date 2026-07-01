import { MessageCircle, ShieldCheck, Wifi } from "lucide-react";
import { whatsappUrl, PASSPORTCARD_URL, WIFLY_URL } from "@/lib/site-constants";

export function FloatingWhatsApp() {
  return (
    <>
      {/* Desktop: floating WhatsApp bubble */}
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שלח הודעת ווטסאפ"
        className="hidden md:flex fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-success items-center justify-center shadow-elegant hover:scale-110 transition-transform animate-wa-pulse"
      >
        <MessageCircle className="w-7 h-7 text-white" fill="currentColor" />
      </a>

      {/* Mobile: pinned bottom action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-8px_28px_-10px_rgba(11,30,59,0.25)]">
        <div className="grid grid-cols-3 gap-1 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-success text-white font-bold text-[11px] animate-wa-pulse"
          >
            <MessageCircle className="w-4 h-4" fill="currentColor" />
            וואטסאפ
          </a>
          <a
            href={PASSPORTCARD_URL}
            target="_blank"
            rel="noopener sponsored"
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg text-primary-foreground bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] border border-[oklch(0.75_0.13_82_/_0.55)] text-[11px] font-bold"
          >
            <ShieldCheck className="w-4 h-4" />
            ביטוח
          </a>
          <a
            href={WIFLY_URL}
            target="_blank"
            rel="noopener sponsored"
            className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg bg-white text-primary border border-primary/40 text-[11px] font-bold"
          >
            <Wifi className="w-4 h-4" />
            eSIM
          </a>
        </div>
      </div>
      {/* Spacer so content isn't hidden behind mobile bar */}
      <div className="md:hidden h-20" aria-hidden="true" />
    </>
  );
}