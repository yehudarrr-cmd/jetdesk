import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { whatsappUrl } from "@/lib/site-constants";

const leadSchema = z.object({
  name: z.string().trim().min(2, "שם חייב להכיל לפחות 2 תווים").max(100),
  phone: z.string().trim().min(9, "מספר טלפון לא תקין").max(20),
  email: z.string().trim().email("כתובת אימייל לא תקינה").max(255).optional().or(z.literal("")),
  destination: z.string().trim().max(200).optional(),
  travelers: z.string().trim().max(10).optional(),
  message: z.string().trim().max(1000).optional(),
});

export function LeadForm() {
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
        source: "contact_page",
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

  return (
    <Card className="p-6 sm:p-8 bg-card/60 backdrop-blur-xl border border-primary/20 shadow-elegant">
      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full border border-primary/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold">תודה רבה!</h3>
          <p className="text-sm text-muted-foreground">קיבלנו את פרטיכם, נחזור אליכם בהקדם.</p>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-block">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <MessageCircle className="w-4 h-4" />
              שיחה בוואטסאפ
            </Button>
          </a>
          <button onClick={() => setSubmitted(false)} className="block mx-auto text-xs text-muted-foreground hover:text-primary mt-3 transition-colors">
            שליחת פנייה נוספת
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center space-y-1 mb-2">
            <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">צרו קשר</span>
            <h2 className="text-xl font-bold">השאירו פרטים מלאים</h2>
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
            <Textarea id="message" name="message" rows={4} maxLength={1000} placeholder="תאריכים, סגנון נופש, דרישות מיוחדות..." className="mt-1.5 bg-input/60 border-border/60 focus:border-primary resize-none" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full gradient-primary shadow-glow text-primary-foreground font-semibold h-12 text-base hover:scale-[1.02] transition-transform">
            {submitting ? "שולח..." : "שלחו פנייה"}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            בלחיצה על "שלחו פנייה" אני מאשר/ת קריאת ה<a href="/privacy" className="text-primary underline">מדיניות פרטיות</a> ו<a href="/terms" className="text-primary underline">תנאי השימוש</a>, ומסכים/ה לקבלת מענה ועדכונים בוואטסאפ/דוא"ל/SMS לפי חוק הספאם.
          </p>
        </form>
      )}
    </Card>
  );
}