import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/goldtus-logo-transparent.png";

const NAV = [
  { to: "/", label: "בית" },
  { to: "/services", label: "שירותים" },
  { to: "/insurance", label: "ביטוח נסיעות" },
  { to: "/travel-requirements", label: "דרישות נסיעה" },
  { to: "/contact", label: "צור קשר" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const wrapperClass = transparent
    ? "absolute top-0 inset-x-0 z-30 bg-transparent"
    : "sticky top-0 inset-x-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/40";

  return (
    <header className={wrapperClass}>
      <div className="max-w-7xl mx-auto px-5 sm:px-10 h-20 flex items-center justify-between gap-4">
        <Link to="/" aria-label="גולדטוס - דף הבית" className="flex items-center">
          <img
            src={logoImage}
            alt="גולדטוס - GoldTus"
            width={160}
            height={64}
            className="h-12 sm:h-14 w-auto"
            style={{
              filter:
                "drop-shadow(0 0 14px rgba(212,175,55,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
            }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((n) => {
            const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-2 rounded-md transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-foreground/85 hover:text-primary"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="תפריט"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-primary/30 bg-background/40 backdrop-blur-sm text-foreground"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="px-5 py-3 flex flex-col">
            {NAV.map((n) => {
              const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`py-3 text-sm border-b border-border/30 last:border-0 ${
                    active ? "text-primary font-semibold" : "text-foreground/90"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}