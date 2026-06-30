import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WHATSAPP_NUMBER } from "@/lib/site-constants";

const quickQuoteSchema = z.object({
  destination: z.string().trim().min(2, "אנא מלאו יעד").max(120),
  phone: z
    .string()
    .trim()
    .min(9, "אנא הזינו מספר טלפון תקין")
    .max(20, "מספר טלפון ארוך מדי")
    .regex(/^[0-9+\-\s()]+$/, "מספר טלפון לא תקין"),
  name: z.string().trim().max(80).optional(),
  departDate: z.string().trim().max(20).optional(),
  returnDate: z.string().trim().max(20).optional(),
  travelers: z.string().trim().min(1).max(3),
  level: z.enum(["regular", "premium", "luxury"]),
});

const levelLabel: Record<string, string> = {
  regular: "רגילה",
  premium: "פרימיום",
  luxury: "יוקרה",
};

export function QuickQuoteForm() {
  const [quickLevel, setQuickLevel] = useState<"regular" | "premium" | "luxury">("premium");

  const handleQuickQuote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      destination: String(formData.get("destination") || ""),
      phone: String(formData.get("phone") || ""),
      name: String(formData.get("name") || ""),
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
      d.name ? `שם: ${d.name}` : null,
      `טלפון: ${d.phone}`,
      `יעד: ${d.destination}`,
      d.departDate ? `תאריך יציאה: ${d.departDate}` : null,
      d.returnDate ? `תאריך חזרה: ${d.returnDate}` : null,
      `מספר נוסעים: ${d.travelers}`,
      `רמת חופשה: ${levelLabel[d.level]}`,
    ].filter(Boolean).join("\n");

    supabase.from("landing_leads").insert({
      name: d.name || "פנייה מהירה (וואטסאפ)",
      phone: d.phone,
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

  return (
    <Card className="p-6 sm:p-7 lg:p-8 bg-black/55 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
      <form onSubmit={handleQuickQuote} className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold">קבלו הצעה מותאמת אישית</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            מלאו פרטים — נחזור עם הצעה בהקדם
          </p>
        </div>

        <div>
          <Label htmlFor="q-destination" className="text-xs">יעד *</Label>
          <Input id="q-destination" name="destination" required maxLength={120} placeholder="מלדיביים, דובאי, יוון..." className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="q-name" className="text-xs">שם</Label>
            <Input id="q-name" name="name" maxLength={80} placeholder="ישראל ישראלי" className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
          </div>
          <div>
            <Label htmlFor="q-phone" className="text-xs">טלפון *</Label>
            <Input id="q-phone" name="phone" type="tel" required maxLength={20} placeholder="050-0000000" dir="ltr" className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="q-depart" className="text-xs">תאריך יציאה</Label>
            <Input id="q-depart" name="departDate" type="date" className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
          </div>
          <div>
            <Label htmlFor="q-return" className="text-xs">תאריך חזרה</Label>
            <Input id="q-return" name="returnDate" type="date" className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="q-travelers" className="text-xs">מס' נוסעים</Label>
            <Input id="q-travelers" name="travelers" type="number" min={1} max={20} defaultValue={2} required className="mt-1.5 h-11 bg-input/60 border-border/60 focus:border-primary" />
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

        <Button type="submit" className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold gap-2 shadow-glow text-base hover:scale-[1.02] transition-transform">
          <MessageCircle className="w-5 h-5" fill="currentColor" />
          קבלו הצעה בוואטסאפ
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="w-3 h-3 inline ml-1" />
          בלחיצה על "קבלו הצעה" אתם מסכימים ל<a href="/privacy" className="text-primary underline">מדיניות הפרטיות</a> ולקבלת מענה בוואטסאפ/טלפון.
        </p>
      </form>
    </Card>
  );
}