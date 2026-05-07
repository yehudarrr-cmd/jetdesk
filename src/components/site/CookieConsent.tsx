import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "goldtus_cookie_consent_v1";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  date: string;
};

export function getStoredConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getStoredConsent()) setOpen(true);
  }, []);

  const save = (c: Omit<Consent, "necessary" | "date">) => {
    const consent: Consent = {
      necessary: true,
      analytics: c.analytics,
      marketing: c.marketing,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="הודעת קוקיז"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[60] rounded-2xl border border-primary/40 bg-background/95 backdrop-blur-xl shadow-elegant"
    >
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold">אנו משתמשים בקוקיז</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              האתר משתמש בעוגיות (Cookies) הכרחיות לתפעולו, ובעוגיות לא הכרחיות לאנליטיקה ושיווק. ניתן לאשר, לסרב או לבחור באופן פרטני. למידע נוסף ראו{" "}
              <Link to="/privacy" className="text-primary underline">
                מדיניות הפרטיות
              </Link>
              .
            </p>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-2 border-t border-border/40 pt-3">
            <label className="flex items-center justify-between text-xs">
              <span>
                <strong>הכרחיות</strong> — נדרשות לתפעול האתר
              </span>
              <input type="checkbox" checked disabled className="accent-primary" />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span>
                <strong>אנליטיקה</strong> — סטטיסטיקות שימוש
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-primary"
              />
            </label>
            <label className="flex items-center justify-between text-xs">
              <span>
                <strong>שיווק</strong> — פרסום מותאם
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="accent-primary"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => save({ analytics: true, marketing: true })}
            className="flex-1 min-w-[110px] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-bold hover:opacity-90 transition"
          >
            אשר הכל
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: false, marketing: false })}
            className="flex-1 min-w-[110px] rounded-lg border border-border bg-background text-foreground px-3 py-2 text-xs font-medium hover:border-primary transition"
          >
            דחה הכל
          </button>
          {showSettings ? (
            <button
              type="button"
              onClick={() => save({ analytics, marketing })}
              className="flex-1 min-w-[110px] rounded-lg border border-primary/50 bg-background text-foreground px-3 py-2 text-xs font-medium hover:border-primary transition"
            >
              שמור בחירה
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="text-xs text-muted-foreground hover:text-primary underline px-2 py-2"
            >
              הגדרות
            </button>
          )}
        </div>
      </div>
    </div>
  );
}