import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";
import logoImage from "@/assets/goldtus-logo.png";

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

const services = [
  { icon: Hotel, title: "טיסות + מלונות יוקרה", description: "חבילות מתוזמרות עד הפרט האחרון - בוטיק ויוקרה בלבד." },
  { icon: Car, title: "השכרת רכב והעברות", description: "רכבי פרימיום והעברות פרטיות בכל יעד בעולם." },
  { icon: Briefcase, title: "טיסות עסקיות", description: "ניהול נסיעות Corporate מקצה לקצה, בכל שעה ביממה." },
  { icon: BookOpen, title: "מגזר דתי", description: "פתרונות כשרות, קהילות יהודיות ומומחיות בצרכי המטייל הדתי." },
  { icon: Crown, title: "שירותי VIP בנתב\"ג", description: "מעבר מהיר, טרקלינים וליווי אישי - ללא תורים." },
  { icon: Umbrella, title: "ביטוח נסיעות", description: "פוליסות מותאמות אישית לשקט נפשי מלא בכל יעד." },
];

const whyUs = [
  { icon: Heart, title: "שירות אישי" },
  { icon: Award, title: "גב של אמירים טורס" },
  { icon: Sparkles, title: "מחירים בלעדיים" },
  { icon: ShieldCheck, title: "ביטחון מלא" },
];

export function LandingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("שלום, אני מעוניין/ת לקבל הצעה לחופשה")}`;
  const scrollToForm = () => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="מטוס פרטי יוקרתי טס מעל עננים בשקיעת זהב"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for contrast - lighter so the image shines through */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </div>

        {/* Logo top center */}
        <div className="absolute top-6 sm:top-10 inset-x-0 flex justify-center z-10">
          <img
            src={logoImage}
            alt="גולדטוס - GoldTus"
            width={400}
            height={400}
            className="w-32 sm:w-40 lg:w-48 h-auto drop-shadow-[0_8px_24px_rgba(212,175,55,0.35)]"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-7 mt-40 sm:mt-44 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-background/50 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary/90 tracking-wider">מבית אמירים טורס</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <span className="block text-foreground">טסים</span>
            <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              ברמה אחרת
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-foreground/85 leading-relaxed max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
            טיסות וחופשות פרימיום עם שירות אישי ודילים נבחרים בלבד
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              onClick={scrollToForm}
              className="gradient-primary shadow-glow text-primary-foreground font-semibold h-12 px-8 text-base hover:scale-105 transition-transform w-full sm:w-auto"
            >
              קבלו הצעה עכשיו
            </Button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:border-primary hover:bg-primary/10 h-12 px-8 gap-2 backdrop-blur-sm w-full"
              >
                <MessageCircle className="w-5 h-5" />
                וואטסאפ
              </Button>
            </a>
          </div>
        </div>

        {/* Subtle gold glow at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-32 gradient-radial-gold opacity-50 pointer-events-none" />
      </section>

      {/* ABOUT */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">מי אנחנו</span>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-light leading-relaxed text-foreground/90">
            <span className="text-primary font-medium">גולדטוס</span> לוקחת את המורכבות של עולם התעופה והופכת אותה
            לחוויה <span className="text-primary font-medium">חלקה, יוקרתית ובטוחה</span>.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            אנחנו לא רק מזמינים כרטיס – אנחנו מנהלים לכם את הדרך.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 lg:py-28 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">השירותים שלנו</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              המעטפת המלאה
              <span className="block text-primary mt-2">תחת גג אחד</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {services.map((service, i) => (
              <Card
                key={i}
                className="group p-8 bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-gold-soft hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-center mb-6 group-hover:border-primary/60 group-hover:bg-primary/10 transition-all">
                  <service.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 lg:py-28 px-6 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-radial-gold opacity-40 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">למה גולדטוס</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              היתרון <span className="text-primary">שלכם</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {whyUs.map((item, i) => (
              <div key={i} className="text-center space-y-4 group">
                <div className="w-16 h-16 mx-auto rounded-full border border-primary/40 flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all duration-500 bg-background/60 backdrop-blur-sm">
                  <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 px-6 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            תנו לנו לבנות לכם את
            <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-2">
              הנסיעה הבאה
            </span>
          </h2>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="gradient-primary shadow-glow text-primary-foreground font-semibold h-14 px-10 text-base hover:scale-105 transition-transform"
          >
            אני רוצה הצעה מנצחת עכשיו
          </Button>
        </div>
      </section>

      {/* LEAD FORM */}
      <section id="lead-form" className="py-20 lg:py-28 px-6 border-t border-border/40">
        <div className="max-w-xl mx-auto">
          <Card className="p-8 lg:p-10 bg-card/60 backdrop-blur-xl border border-primary/20 shadow-elegant">
            {submitted ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 mx-auto rounded-full border border-primary/40 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">תודה רבה!</h3>
                <p className="text-muted-foreground">
                  קיבלנו את פרטיכם, נחזור אליכם בהקדם.
                </p>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button className="gradient-primary text-primary-foreground gap-2">
                    <MessageCircle className="w-4 h-4" />
                    שיחה בוואטסאפ
                  </Button>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="block mx-auto text-sm text-muted-foreground hover:text-primary mt-4 transition-colors"
                >
                  שליחת פנייה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-center space-y-2 mb-2">
                  <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">צרו קשר</span>
                  <h3 className="text-2xl font-bold">הצעה אישית בדרך אליכם</h3>
                </div>

                <div className="space-y-4">
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
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-primary shadow-glow text-primary-foreground font-semibold h-12 text-base hover:scale-[1.02] transition-transform"
                >
                  {submitting ? "שולח..." : "קבלו הצעה אישית"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  <ShieldCheck className="w-3 h-3 inline ml-1" />
                  הפרטים שלכם מאובטחים ולא יועברו לצד שלישי
                </p>
              </form>
            )}
          </Card>
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="py-12 px-6 border-t border-border/40 bg-card/30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm">
          <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-2.5 hover:text-primary transition-colors group">
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
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-border/40">
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
