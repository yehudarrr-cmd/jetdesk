import { useEffect, useState } from "react";
import { X, ShieldCheck, Sparkles, ArrowLeft } from "lucide-react";
import { TRUSTY_INSURANCE_COMPARE_URL } from "@/lib/site-constants";

const DISMISS_KEY = "insurance-compare-dismissed-v1";
const SHOW_DELAY_MS = 6000;
const REOPEN_AFTER_MS = 1000 * 60 * 30; // 30 min

export function InsuranceComparePopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let isDismissed = false;
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < REOPEN_AFTER_MS) {
          isDismissed = true;
        } else {
          window.localStorage.removeItem(DISMISS_KEY);
        }
      }
    } catch {
      /* ignore */
    }
    setDismissed(isDismissed);
    if (isDismissed) return;
    const t = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const reopen = () => {
    try {
      window.localStorage.removeItem(DISMISS_KEY);
    } catch {
      /* ignore */
    }
    setDismissed(false);
    setOpen(true);
  };

  if (!open) {
    // Small persistent launcher so users can reopen the compare popup anytime
    return (
      <button
        type="button"
        onClick={reopen}
        aria-label="השוואת מחירי ביטוח נסיעות"
        className="fixed bottom-24 left-4 sm:bottom-28 sm:left-6 z-[55] inline-flex items-center gap-2 rounded-full pl-4 pr-3 py-2.5 text-xs font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] border border-[#FFD447] shadow-[0_10px_30px_-8px_rgba(255,212,71,0.55)] hover:translate-y-[-1px] transition-all"
        dir="rtl"
      >
        <span className="w-7 h-7 rounded-full bg-[#001a4d] text-[#FFD447] inline-flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" strokeWidth={2.4} />
        </span>
        השוואת ביטוח נסיעות
      </button>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-6 sm:pb-6 pointer-events-none animate-in slide-in-from-bottom-8 fade-in duration-500"
      dir="rtl"
      role="dialog"
      aria-label="השוואת מחירי ביטוח נסיעות"
    >
      <div className="pointer-events-auto max-w-3xl mx-auto relative overflow-hidden rounded-2xl border border-[#FFD447]/50 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.55)] bg-[linear-gradient(120deg,#001a4d_0%,#002d72_55%,#00194a_100%)]">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #FFD447 0%, transparent 45%), radial-gradient(circle at 85% 90%, #FFD447 0%, transparent 45%)",
          }}
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label="סגור"
          className="absolute top-2.5 left-2.5 z-10 w-8 h-8 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative grid sm:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 sm:p-5">
          <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-[#FFD447]/15 border border-[#FFD447]/45 items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[#FFD447]" strokeWidth={2.2} />
          </div>

          <div className="min-w-0 text-right">
            <div className="inline-flex items-center gap-1.5 mb-1.5 px-2.5 py-0.5 rounded-full bg-[#FFD447]/15 border border-[#FFD447]/40 text-[#FFD447] text-[11px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3" fill="currentColor" /> חדש
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
              השוו מחירי ביטוח נסיעות לחו"ל
            </h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
              כל חברות הביטוח במקום אחד — קבלו את הכיסוי המשתלם ביותר לטיול הבא שלכם תוך דקה.
            </p>
          </div>

          <a
            href={TRUSTY_INSURANCE_COMPARE_URL}
            target="_blank"
            rel="noopener sponsored"
            onClick={dismiss}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-3 text-sm font-bold text-[#001a4d] bg-[#FFD447] hover:bg-[#FFC000] shadow-[0_10px_28px_-8px_rgba(255,212,71,0.6)] hover:translate-y-[-1px] transition-all whitespace-nowrap"
          >
            להשוואת מחירים
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>

        <div className="relative border-t border-white/10 bg-black/20 px-4 py-1.5 text-[10px] text-white/55 text-center">
          שירות השוואה בשיתוף Trusty — ללא עלות, ללא התחייבות
        </div>
      </div>
    </div>
  );
}