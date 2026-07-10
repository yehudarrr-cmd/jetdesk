import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ShieldCheck, Wifi, MessageCircle } from "lucide-react";
import logoImage from "@/assets/goldtus-logo-transparent.png";
import { PASSPORTCARD_URL, WIFLY_URL, whatsappUrl } from "@/lib/site-constants";

const NAV = [
  { to: "/", label: "בית" },
  { to: "/deals", label: "🔥 דילים חמים" },
  { to: "/kosher-deals", label: "✡︎ דילים כשרים" },
  { to: "/services", label: "שירותי פרימיום" },
  { to: "/travel-requirements", label: "ויזה ודרישות כניסה" },
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
            style={{
              filter:
                "contrast(1.15) saturate(1.15) drop-shadow(0 2px 4px rgba(11,30,59,0.25)) drop-shadow(0 8px 20px rgba(11,30,59,0.35))",
            }}
          />
        </Link>

        {/* Center: nav — premium pill styling */}
        <nav className="hidden md:flex items-center justify-center gap-1 text-[13px]">
          {NAV.map((n) => {
            const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
            return (
              <Link
                key={`${n.to}-${n.label}`}
                to={n.to}
                className={`nav-link-lux px-4 py-2 rounded-full whitespace-nowrap tracking-[0.01em] ${
                  active
                    ? "nav-link-lux-active text-[#001a4d]"
                    : "text-[#001a4d]/70 hover:text-[#001a4d] hover:bg-white/40"
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
            className="btn-lux-emerald inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.02em]"
          >
            <MessageCircle className="w-4 h-4" fill="currentColor" />
            וואטסאפ
          </a>
          <a
            href={PASSPORTCARD_URL}
            target="_blank"
            rel="noopener sponsored"
            className="btn-lux-dark inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.02em]"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={1.7} />
            ביטוח נסיעות
          </a>
          <a
            href={WIFLY_URL}
            target="_blank"
            rel="noopener sponsored"
            className="btn-lux-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.02em] text-[#001a4d]"
          >
            <Wifi className="w-4 h-4 text-[#0f7a52]" strokeWidth={1.7} />
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