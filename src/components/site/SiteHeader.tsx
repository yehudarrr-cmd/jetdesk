import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ShieldCheck, Wifi, MessageCircle } from "lucide-react";
import logoImage from "@/assets/goldtus-logo-transparent.png";
import { PASSPORTCARD_URL, WIFLY_URL, whatsappUrl } from "@/lib/site-constants";

const NAV = [
  { to: "/", label: "בית" },
  { to: "/services", label: "היעדים שלנו" },
  { to: "/services", label: "שירותי VIP" },
  { to: "/travel-requirements", label: "טיולים מאורגנים" },
  { to: "/contact", label: "צור קשר" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const wrapperClass = transparent
    ? "absolute top-0 inset-x-0 z-30 bg-white/70 backdrop-blur-md border-b border-border/50"
    : "sticky top-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-b border-border/60 shadow-[0_1px_20px_-10px_rgba(11,30,59,0.15)]";

  return (
    <header className={wrapperClass}>
      <div className="max-w-7xl mx-auto px-5 sm:px-10 h-24 sm:h-28 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Right (RTL): logo */}
        <Link to="/" aria-label="גולדטוס - דף הבית" className="flex items-center shrink-0">
          <img
            src={logoImage}
            alt="גולדטוס - GoldTus"
            width={260}
            height={104}
            className="h-16 sm:h-20 lg:h-24 w-auto"
            style={{ filter: "drop-shadow(0 6px 16px rgba(11,30,59,0.35)) drop-shadow(0 0 1px rgba(11,30,59,0.4))" }}
          />
        </Link>

        {/* Center: nav */}
        <nav className="hidden md:flex items-center justify-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
            return (
              <Link
                key={`${n.to}-${n.label}`}
                to={n.to}
                className={`px-3 py-2 rounded-md transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-foreground/75 hover:text-primary"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Left (RTL): affiliate CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white bg-success hover:bg-[oklch(0.55_0.15_155)] shadow-[0_8px_24px_-10px_rgba(5,150,105,0.5)] hover:translate-y-[-1px] transition-all animate-wa-pulse"
          >
            <MessageCircle className="w-4 h-4" fill="currentColor" />
            וואטסאפ
          </a>
          <a
            href={PASSPORTCARD_URL}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground shadow-[0_8px_24px_-10px_rgba(11,30,59,0.5)] bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] hover:translate-y-[-1px] hover:shadow-[0_12px_28px_-10px_rgba(11,30,59,0.55)] transition-all border border-[oklch(0.75_0.13_82_/_0.55)]"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            ביטוח נסיעות
          </a>
          <a
            href={WIFLY_URL}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white bg-[oklch(0.60_0.15_155)] hover:bg-[oklch(0.55_0.15_155)] shadow-[0_8px_24px_-10px_rgba(5,150,105,0.5)] hover:translate-y-[-1px] hover:shadow-[0_12px_28px_-10px_rgba(5,150,105,0.6)] transition-all"
          >
            <Wifi className="w-4 h-4" strokeWidth={2} />
            eSIM גלובלי
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="תפריט"
          className="md:hidden justify-self-end inline-flex items-center justify-center w-10 h-10 rounded-md border border-primary/30 bg-white/80 backdrop-blur-sm text-foreground"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-white/98 backdrop-blur-xl">
          <nav className="px-5 py-3 flex flex-col">
            {NAV.map((n) => {
              const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={`${n.to}-${n.label}`}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`py-3 text-sm border-b border-border/50 ${
                    active ? "text-primary font-semibold" : "text-foreground/85"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="pt-3 grid grid-cols-2 gap-2">
              <a
                href={PASSPORTCARD_URL}
                target="_blank"
                rel="noopener sponsored"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold text-primary-foreground bg-[linear-gradient(135deg,oklch(0.22_0.08_260),oklch(0.42_0.13_258))] border border-[oklch(0.75_0.13_82_/_0.55)]"
              >
                <ShieldCheck className="w-4 h-4" /> ביטוח נסיעות
              </a>
              <a
                href={WIFLY_URL}
                target="_blank"
                rel="noopener sponsored"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold text-white bg-[oklch(0.60_0.15_155)]"
              >
                <Wifi className="w-4 h-4" /> eSIM גלובלי
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}