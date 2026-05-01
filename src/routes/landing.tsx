import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plane, MapPin, Headphones, Sparkles, MessageCircle, Phone, Mail, ShieldCheck, Clock, Star } from "lucide-react";
import heroImage from "@/assets/landing-hero.jpg";

const WHATSAPP_NUMBER = "972500000000"; // לעדכון - מספר ווטסאפ של גולדטוס

const leadSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100),
  phone: z.string().trim().min(9, "מספר טלפון לא תקין").max(20),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255).optional().or(z.literal("")),
  destination: z.string().trim().max(200).optional(),
  travelers: z.string().trim().max(10).optional(),
  message: z.string().trim().max(1000).optional(),
});

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "Goldtus — חופשת היוקרה הבאה שלכם מתחילה כאן" },
      { name: "description", content: "סוכנות נסיעות פרימיום: טיסות, מלונות וחבילות יוקרה מותאמות אישית. השאירו פרטים וקבלו הצעה תוך 24 שעות." },
      { property: "og:title", content: "Goldtus — חופשת היוקרה הבאה שלכם" },
      { property: "og:description", content: "תכנון נסיעות יוקרה אישי, ליווי 24/7, יעדים אקסקלוסיביים ברחבי העולם." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: heroImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 py-5 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Plane className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">Goldtus</span>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            ווטסאפ
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="טיסה יוקרתית מעל איי המלדיביים בשקיעה"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-32 lg:py-0 grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Right side - text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">סוכנות נסיעות פרימיום</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              החופשה
              <br />
              <span className="bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent">
                שתמיד חלמתם עליה
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              חבילות יוקרה מותאמות אישית, יעדים אקסקלוסיביים, וליווי 24/7 לאורך כל הדרך.
              השאירו פרטים וקבלו הצעה מותאמת תוך 24 שעות.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Button
                size="lg"
                onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                className="gradient-primary shadow-glow text-primary-foreground font-semibold text-base h-12 px-8"
              >
                קבלו הצעה אישית
              </Button>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 h-12 px-8 gap-2">
                  <MessageCircle className="w-5 h-5" />
                  שיחה בווטסאפ
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span>+500 לקוחות מרוצים</span>
              </div>
            </div>
          </div>

          {/* Left side - lead form */}
          <div id="lead-form" className="lg:pr-8">
            <Card className="p-6 lg:p-8 bg-card/80 backdrop-blur-xl border-border/50 shadow-elegant">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-glow">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">תודה רבה!</h3>
                  <p className="text-muted-foreground">
                    קיבלנו את פרטיך ונחזור אליך בהקדם האפשרי.
                    <br />
                    בינתיים אפשר ליצור קשר בווטסאפ:
                  </p>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button className="gradient-primary text-primary-foreground gap-2 mt-2">
                      <MessageCircle className="w-4 h-4" />
                      פתחו צ'אט בווטסאפ
                    </Button>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="block mx-auto text-sm text-muted-foreground hover:text-primary mt-4"
                  >
                    שליחת פנייה נוספת
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">קבלו הצעה אישית</h2>
                    <p className="text-sm text-muted-foreground">מלאו פרטים ונחזור אליכם תוך 24 שעות</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-sm">שם מלא *</Label>
                      <Input id="name" name="name" required maxLength={100} placeholder="ישראל ישראלי" className="mt-1.5 bg-input/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone" className="text-sm">טלפון *</Label>
                        <Input id="phone" name="phone" required type="tel" maxLength={20} placeholder="050-1234567" className="mt-1.5 bg-input/50" />
                      </div>
                      <div>
                        <Label htmlFor="travelers" className="text-sm">מס' נוסעים</Label>
                        <Input id="travelers" name="travelers" type="number" min="1" max="20" defaultValue="2" className="mt-1.5 bg-input/50" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm">אימייל</Label>
                      <Input id="email" name="email" type="email" maxLength={255} placeholder="email@example.com" className="mt-1.5 bg-input/50" />
                    </div>
                    <div>
                      <Label htmlFor="destination" className="text-sm">יעד מבוקש</Label>
                      <Input id="destination" name="destination" maxLength={200} placeholder="מלדיביים, יוון, דובאי..." className="mt-1.5 bg-input/50" />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-sm">פרטים נוספים</Label>
                      <Textarea id="message" name="message" rows={3} maxLength={1000} placeholder="תאריכים מועדפים, סגנון נופש, דרישות מיוחדות..." className="mt-1.5 bg-input/50 resize-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full gradient-primary shadow-glow text-primary-foreground font-semibold h-12 text-base"
                  >
                    {submitting ? "שולח..." : "קבלו הצעה אישית"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    הפרטים שלכם מאובטחים ולא יועברו לצד שלישי
                  </p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
              למה <span className="bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent">Goldtus</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              חוויית נסיעה ברמה אחרת לגמרי - מהתכנון הראשוני ועד החזרה הביתה
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "יעדים אקסקלוסיביים",
                description: "מלונות בוטיק, וילות פרטיות וחוויות שלא תמצאו באף סוכנות אחרת",
              },
              {
                icon: Headphones,
                title: "ליווי אישי 24/7",
                description: "סוכן אישי זמין לכם בכל רגע - לפני, במהלך ואחרי החופשה",
              },
              {
                icon: Clock,
                title: "תגובה תוך 24 שעות",
                description: "קבלו הצעה מותאמת אישית במהירות, ללא טפסים מיותרים",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-8 bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all hover:shadow-elegant group"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-glow group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 lg:p-16 bg-gradient-to-br from-card to-card/40 border-primary/20 shadow-elegant text-center relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">מוכנים להתחיל?</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight">
                החופשה הבאה שלכם
                <br />
                במרחק שיחה אחת
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                בחרו את הדרך הנוחה ביותר ליצור קשר - אנחנו כאן בשבילכם
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow h-12 px-8 gap-2 font-semibold">
                    <MessageCircle className="w-5 h-5" />
                    שיחה בווטסאפ
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" })}
                  className="border-primary/30 hover:bg-primary/10 h-12 px-8 gap-2"
                >
                  <Mail className="w-5 h-5" />
                  השאירו פרטים
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            <span>© {new Date().getFullYear()} Goldtus. כל הזכויות שמורות.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              ווטסאפ
            </a>
            <Link to="/auth" className="hover:text-primary transition-colors">
              כניסה למערכת
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
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
