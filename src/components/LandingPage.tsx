import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plane,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  Briefcase,
  BookOpen,
  Crown,
  Umbrella,
  Hotel,
  Car,
  Heart,
  Award,
  Globe,
  Phone,
  ChevronDown,
} from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";
import logoImage from "@/assets/goldtus-logo-transparent.png";

const WHATSAPP_NUMBER = "972557756660";
const PHONE_DISPLAY = "055-775-6660";

const leadSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100),
  phone: z.string().trim().min(9, "מספר טלפון לא תקין").max(20),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255).optional().or(z.literal("")),
  destination: z.string().trim().max(200).optional(),
  travelers: z.string().trim().max(10).optional(),
  message: z.string().trim().max(1000).optional(),
});

const quickQuoteSchema = z.object({
  destination: z.string().trim().min(2, "אנא מלאו יעד").max(120),
  departDate: z.string().trim().max(20).optional(),
  returnDate: z.string().trim().max(20).optional(),
  travelers: z.string().trim().min(1).max(3),
  level: z.enum(["regular", "premium", "luxury"]),
});

const services = [
  { icon: Hotel, title: "טיסות + מלונות יוקרה" },
  { icon: Car, title: "השכרת רכב והעברות" },
  { icon: Briefcase, title: "טיסות עסקיות" },
  { icon: BookOpen, title: "מגזר דתי" },
  { icon: Crown, title: "VIP בנתב\"ג" },
  { icon: Umbrella, title: "ביטוח נסיעות" },
];

const whyUs = [
  { icon: Heart, title: "שירות אישי" },
  { icon: Award, title: "גב של אמירים טורס" },
  { icon: Sparkles, title: "מחירים בלעדיים" },
  { icon: ShieldCheck, title: "ביטחון מלא" },
];

const levelLabel: Record<string, string> = {
  regular: "רגילה",
  premium: "פרימיום",
  luxury: "יוקרה",
};

export function LandingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quickLevel, setQuickLevel] = useState<"regular" | "premium" | "luxury">("premium");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      destination: String(formData.get("destination") || ""),
      travelers: String(formData.get("travelers") || ""),
      message: String(formData.get("message") || ""),
    };

    const result = leadSchema.safeParse(raw);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "אנא בדוק את הפרטים");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("landing_leads").insert({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email || null,
        destination: result.data.destination || null,
        number_of_travelers: result.data.travelers ? parseInt(result.data.travelers) || 1 : 1,
        message: result.data.message || null,
        source: "landing_page",
      });

      if (error) throw error;
      setSubmitted(true);
      toast.success("הפנייה התקבלה! נחזור אליך בהקדם.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Lead submission error:", err);
      toast.error("שגיאה בשליחה. נסה שוב או צור קשר בווטסאפ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      destination: String(formData.get("destination") || ""),
      departDate: String(formData.get("departDate") || ""),
      returnDate: String(formData.get("returnDate") || ""),
      travelers: String(formData.get("travelers") || "2"),
      level: quickLevel,
    };

    const parsed = quickQuoteSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "אנא מלאו את הפרטים");
      return;
    }

    const d = parsed.data;
    const lines = [
      "שלום, אשמח לקבל הצעה לחופשה:",
      `יעד: ${d.destination}`,
      d.departDate ? `תאריך יציאה: ${d.departDate}` : null,
      d.returnDate ? `תאריך חזרה: ${d.returnDate}` : null,
      `מספר נוסעים: ${d.travelers}`,
      `רמת חופשה: ${levelLabel[d.level]}`,
    ].filter(Boolean).join("\n");

    // Fire-and-forget save to leads (best effort, don't block WhatsApp)
    supabase.from("landing_leads").insert({
      name: "פנייה מהירה (וואטסאפ)",
      phone: "—",
      destination: d.destination,
      number_of_travelers: parseInt(d.travelers) || 1,
      message: lines,
      source: "quick_quote_whatsapp",
    }).then(({ error }) => {
      if (error) console.error("Quick quote save error:", error);
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("שלום, אני מעוניין/ת לקבל הצעה לחופשה")}`;
  const scrollToForm = () => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* HERO - strict 60/40 split, logo top-right header */}
      <section className="relative min-h-[92svh] flex flex-col overflow-hidden">
        {/* Background image with single dark overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="חלון מטוס פרטי עם נוף עננים בשקיעת זהב וכוס שמפניה"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Header - logo pinned top-right (RTL) */}
        <header className="absolute top-0 right-0 z-20 pt-6 pr-6 sm:pt-8 sm:pr-10 pointer-events-none">
          <img
            src={logoImage}
            alt="גולדטוס - GoldTus"
            width={200}
            height={200}
            className="h-16 w-auto animate-fade-in-down"
            style={{
              filter:
                "drop-shadow(0 0 18px rgba(212,175,55,0.18)) drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
            }}
          />
        </header>

        {/* Hero grid - 60/40 split on desktop, stacked on mobile */}
        <div className="relative z-10 flex-1 flex items-center px-5 sm:px-10 pt-24 sm:pt-28 pb-8">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-8 lg:gap-14 items-center">
            {/* RIGHT (RTL first) - 60% - Headline & subheadline */}
            <div className="lg:col-span-3 space-y-5 sm:space-y-6 text-center lg:text-right">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                טיסות וחופשות
                <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                  פרימיום בהתאמה אישית
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-foreground/85 leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                שלחו יעד, תאריכים ומספר נוסעים - ונמצא לכם דיל מדויק בלי כאב ראש.
              </p>

              {/* Features line - icons + text, always visible */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-foreground/80 justify-center lg:justify-start pt-1">
                <span className="flex items-center gap-1.5"><Plane className="w-4 h-4 text-primary" strokeWidth={1.5} /> טיסות פרטיות</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.5} /> שירות אישי</span>
                <span className="flex items-center gap-1.5"><Crown className="w-4 h-4 text-primary" strokeWidth={1.5} /> VIP בנתב"ג</span>
              </div>
            </div>

            {/* LEFT (RTL second) - 40% - Quick quote form */}
            <Card className="lg:col-span-2 lg:self-center p-6 sm:p-7 lg:p-8 bg-black/55 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
              <form onSubmit={handleQuickQuote} className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold">קבלו הצעה מותאמת אישית</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    השאירו פרטים ונחזור אליכם בהקדם עם הצעה מותאמת אישית
                  </p>
                </div>

                <div>
                  <Label htmlFor="q-destination" className="text-xs">יעד *</Label>
                  <Input
                    id="q-destination"
                    name="destination"
                    required
                    maxLength={120}
                    placeholder="מלדיביים, דובאי, יוון..."
                    className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="q-depart" className="text-xs">תאריך יציאה</Label>
                    <Input
                      id="q-depart"
                      name="departDate"
                      type="date"
                      className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="q-return" className="text-xs">תאריך חזרה</Label>
                    <Input
                      id="q-return"
                      name="returnDate"
                      type="date"
                      className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="q-travelers" className="text-xs">מס' נוסעים</Label>
                    <Input
                      id="q-travelers"
                      name="travelers"
                      type="number"
                      min={1}
                      max={20}
                      defaultValue={2}
                      required
                      className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="q-level" className="text-xs">רמת חופשה</Label>
                    <Select value={quickLevel} onValueChange={(v) => setQuickLevel(v as typeof quickLevel)}>
                      <SelectTrigger id="q-level" className="mt-1.5 h-11 bg-input/60 border-border/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">רגילה</SelectItem>
                        <SelectItem value="premium">פרימיום</SelectItem>
                        <SelectItem value="luxury">יוקרה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold gap-2 shadow-glow text-base hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="w-5 h-5" fill="currentColor" />
                  קבלו הצעה בוואטסאפ
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  <ShieldCheck className="w-3 h-3 inline ml-1" />
                  הפרטים שלכם מאובטחים. ללא ספאם.
                </p>
              </form>
            </Card>
          </div>
        </div>

        {/* Scroll-down indicator */}
        <button
          type="button"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          aria-label="גללו להמשך"
          className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5 text-primary/80 hover:text-primary transition-colors group"
        >
          <span className="text-[11px] tracking-[0.25em] text-foreground/70 group-hover:text-foreground">
            גללו להמשך
          </span>
          <ChevronDown
            className="w-5 h-5 animate-bounce"
            style={{ animationDuration: "2s" }}
            strokeWidth={1.5}
          />
        </button>
      </section>

      {/* ABOUT - compact */}
      <section id="about" className="py-14 sm:py-20 px-6 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">מי אנחנו</span>
          <p className="text-xl sm:text-2xl lg:text-3xl font-light leading-relaxed text-foreground/90">
            <span className="text-primary font-medium">גולדטוס</span> הופכת את עולם התעופה
            לחוויה <span className="text-primary font-medium">חלקה, יוקרתית ובטוחה</span>.
            <br className="hidden sm:block" />
            לא רק מזמינים כרטיס - מנהלים לכם את הדרך.
          </p>
        </div>
      </section>

      {/* SERVICES - condensed grid */}
      <section className="py-14 sm:py-20 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">השירותים</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              הכל תחת <span className="text-primary">גג אחד</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {services.map((service, i) => (
              <Card
                key={i}
                className="p-4 sm:p-5 bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-colors flex flex-col items-center text-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground leading-tight">{service.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-14 sm:py-20 px-6 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {whyUs.map((item, i) => (
              <div key={i} className="text-center space-y-3 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full border border-primary/40 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <item.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAVEL INSURANCE */}
      <section id="travel-insurance" className="py-14 sm:py-20 px-6 border-t border-border/40">
        <div className="max-w-3xl mx-auto">
          <Card className="relative p-8 sm:p-10 bg-card/40 backdrop-blur-sm border border-primary/30 rounded-2xl shadow-gold-soft text-center overflow-hidden">
            <div className="absolute inset-0 gradient-radial-gold opacity-30 pointer-events-none" />
            <div className="relative space-y-5">
              <div className="relative w-16 h-16 mx-auto rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" strokeWidth={1.5} />
                <Plane className="absolute -bottom-1 -left-1 w-4 h-4 text-primary bg-background rounded-full p-0.5 border border-primary/40" strokeWidth={1.5} />
              </div>

              <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">שירות נוסף</span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                ביטוח נסיעות לחו"ל
                <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-1">
                  סוגרים את זה לפני הטיסה
                </span>
              </h2>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                לפני שממריאים, דואגים גם לשקט הנפשי. דרך האתר תוכלו לעבור ישירות לרכישת ביטוח נסיעות לחו"ל בפספורט קארד, במהירות ובנוחות.
              </p>

              <div className="pt-2">
                <a
                  href="https://bit.ly/4fW6B98"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <Button
                    type="button"
                    className="w-full sm:w-auto gradient-primary text-primary-foreground shadow-glow font-semibold h-12 px-8 text-base gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    לרכישת ביטוח נסיעות
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><Plane className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> מותאם לטיסה</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> פוליסה דיגיטלית</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} /> מאובטח</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* DETAILED LEAD FORM (kept for users who want a fuller channel) */}
      <section id="lead-form" className="py-16 sm:py-24 px-6 border-t border-border/40">
        <div className="max-w-xl mx-auto">
          <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-primary/20 shadow-elegant">
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full border border-primary/40 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">תודה רבה!</h3>
                <p className="text-sm text-muted-foreground">קיבלנו את פרטיכם, נחזור אליכם בהקדם.</p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button className="gradient-primary text-primary-foreground gap-2">
                    <MessageCircle className="w-4 h-4" />
                    שיחה בוואטסאפ
                  </Button>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="block mx-auto text-xs text-muted-foreground hover:text-primary mt-3 transition-colors"
                >
                  שליחת פנייה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center space-y-1 mb-2">
                  <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">צרו קשר</span>
                  <h3 className="text-xl font-bold">השאירו פרטים מלאים</h3>
                  <p className="text-xs text-muted-foreground">נחזור אליכם בהקדם</p>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm">שם מלא *</Label>
                  <Input id="name" name="name" required maxLength={100} placeholder="ישראל ישראלי" className="mt-1.5 bg-input/60 border-border/60 focus:border-primary" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone" className="text-sm">טלפון *</Label>
                    <Input id="phone" name="phone" required type="tel" maxLength={20} placeholder="050-1234567" className="mt-1.5 bg-input/60 border-border/60 focus:border-primary" />
                  </div>
                  <div>
                    <Label htmlFor="travelers" className="text-sm">מס' נוסעים</Label>
                    <Input id="travelers" name="travelers" type="number" min="1" max="20" defaultValue="2" className="mt-1.5 bg-input/60 border-border/60 focus:border-primary" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm">אימייל</Label>
                  <Input id="email" name="email" type="email" maxLength={255} placeholder="email@example.com" className="mt-1.5 bg-input/60 border-border/60 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="destination" className="text-sm">יעד מבוקש</Label>
                  <Input id="destination" name="destination" maxLength={200} placeholder="מלדיביים, יוון, דובאי..." className="mt-1.5 bg-input/60 border-border/60 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm">פרטים נוספים</Label>
                  <Textarea id="message" name="message" rows={3} maxLength={1000} placeholder="תאריכים, סגנון נופש, דרישות מיוחדות..." className="mt-1.5 bg-input/60 border-border/60 focus:border-primary resize-none" />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-primary shadow-glow text-primary-foreground font-semibold h-12 text-base hover:scale-[1.02] transition-transform"
                >
                  {submitting ? "שולח..." : "שלחו פנייה"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="py-10 px-6 border-t border-border/40 bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 text-sm">
          <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <Phone className="w-4 h-4 text-primary" />
            <span className="font-medium tracking-wide" dir="ltr">{PHONE_DISPLAY}</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4 text-success" fill="currentColor" />
            <span className="font-medium">וואטסאפ</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <a href="https://www.goldtus.com" className="flex items-center gap-2.5 hover:text-primary transition-colors">
            <Globe className="w-4 h-4 text-primary" />
            <span className="font-medium tracking-wide" dir="ltr">www.goldtus.com</span>
          </a>
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <a
            href="#travel-insurance"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("travel-insurance")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 hover:text-primary transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-medium">ביטוח נסיעות</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
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

      {/* Floating WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שלח הודעת ווטסאפ"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-elegant hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-7 h-7 text-white" fill="currentColor" />
      </a>
    </div>
  );
}

export { heroImage as landingHeroImage };
