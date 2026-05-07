import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Accessibility, X, Plus, Minus, Contrast, Link2, RotateCcw, Pause } from "lucide-react";

const STORAGE_KEY = "goldtus_a11y_v1";

type Settings = {
  fontScale: number; // 1, 1.15, 1.3, 1.5
  contrast: "default" | "high" | "inverted";
  highlightLinks: boolean;
  pauseAnimations: boolean;
  readableFont: boolean;
};

const DEFAULTS: Settings = {
  fontScale: 1,
  contrast: "default",
  highlightLinks: false,
  pauseAnimations: false,
  readableFont: false,
};

function applySettings(s: Settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.fontSize = s.fontScale === 1 ? "" : `${s.fontScale * 100}%`;
  root.classList.toggle("a11y-contrast-high", s.contrast === "high");
  root.classList.toggle("a11y-contrast-inverted", s.contrast === "inverted");
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.classList.toggle("a11y-pause-animations", s.pauseAnimations);
  root.classList.toggle("a11y-readable-font", s.readableFont);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = { ...DEFAULTS, ...JSON.parse(raw) } as Settings;
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch {
      /* noop */
    }
  }, []);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applySettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  const reset = () => {
    setSettings(DEFAULTS);
    applySettings(DEFAULTS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elegant hover:scale-110 transition-transform border-2 border-primary-foreground/20"
      >
        <Accessibility className="w-7 h-7" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="הגדרות נגישות"
          className="fixed bottom-24 right-6 z-50 w-[300px] max-h-[80vh] overflow-y-auto rounded-2xl border border-primary/40 bg-background/95 backdrop-blur-xl shadow-elegant"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-primary" aria-hidden="true" />
              נגישות
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגור תפריט נגישות"
              className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            <div>
              <div className="font-semibold mb-2">גודל טקסט</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.max(1, +(settings.fontScale - 0.15).toFixed(2)) })}
                  aria-label="הקטן טקסט"
                  className="w-9 h-9 rounded-md border border-border hover:border-primary flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center font-mono">{Math.round(settings.fontScale * 100)}%</div>
                <button
                  type="button"
                  onClick={() => update({ fontScale: Math.min(1.5, +(settings.fontScale + 0.15).toFixed(2)) })}
                  aria-label="הגדל טקסט"
                  className="w-9 h-9 rounded-md border border-border hover:border-primary flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2">ניגודיות</div>
              <div className="grid grid-cols-3 gap-1">
                {(["default", "high", "inverted"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update({ contrast: c })}
                    className={`px-2 py-2 rounded-md border text-[11px] ${
                      settings.contrast === c ? "border-primary bg-primary/10" : "border-border hover:border-primary"
                    }`}
                  >
                    {c === "default" ? "רגילה" : c === "high" ? "גבוהה" : "הפוכה"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => update({ highlightLinks: !settings.highlightLinks })}
              aria-pressed={settings.highlightLinks}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border ${
                settings.highlightLinks ? "border-primary bg-primary/10" : "border-border hover:border-primary"
              }`}
            >
              <Link2 className="w-4 h-4" aria-hidden="true" />
              הדגש קישורים
            </button>

            <button
              type="button"
              onClick={() => update({ pauseAnimations: !settings.pauseAnimations })}
              aria-pressed={settings.pauseAnimations}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border ${
                settings.pauseAnimations ? "border-primary bg-primary/10" : "border-border hover:border-primary"
              }`}
            >
              <Pause className="w-4 h-4" aria-hidden="true" />
              עצירת אנימציות
            </button>

            <button
              type="button"
              onClick={() => update({ readableFont: !settings.readableFont })}
              aria-pressed={settings.readableFont}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border ${
                settings.readableFont ? "border-primary bg-primary/10" : "border-border hover:border-primary"
              }`}
            >
              <Contrast className="w-4 h-4" aria-hidden="true" />
              גופן קריא
            </button>

            <button
              type="button"
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              איפוס הגדרות
            </button>

            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              className="block text-center text-primary underline"
            >
              הצהרת נגישות מלאה
            </Link>
          </div>
        </div>
      )}
    </>
  );
}