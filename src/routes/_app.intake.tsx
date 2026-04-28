import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/intake")({
  component: IntakePage,
});

function IntakePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<any>(null);
  const navigate = useNavigate();

  const extract = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-intake", { body: { text } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setExtracted((data as any).extracted);
      toast.success("המידע חולץ");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!extracted?.customer_name) { toast.error("חסר שם לקוח"); return; }
    const { data, error } = await supabase.from("customers").insert({
      name: extracted.customer_name,
      phone: extracted.phone ?? null,
      email: extracted.email ?? null,
      destination: extracted.destination ?? null,
      travel_start_date: extracted.travel_start_date ?? null,
      travel_end_date: extracted.travel_end_date ?? null,
      pnr: extracted.pnr ?? null,
      total_price: extracted.total_price ?? 0,
      amount_paid: extracted.amount_paid ?? 0,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    if (text) {
      await supabase.from("conversations").insert({ customer_id: data.id, content: text, source: "manual" });
    }
    if (Array.isArray(extracted.flights)) {
      for (const f of extracted.flights) {
        await supabase.from("flights").insert({ customer_id: data.id, ...f } as any);
      }
    }
    if (Array.isArray(extracted.follow_up_tasks)) {
      for (const title of extracted.follow_up_tasks) {
        await supabase.from("tasks").insert({ customer_id: data.id, title });
      }
    }
    toast.success("לקוח נוצר");
    navigate({ to: "/customers/$id", params: { id: data.id } });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">תיבת קליטה</h1>
        <p className="text-muted-foreground mt-1">הדבק שיחת ווטסאפ, מייל או טקסט חופשי — ה-AI יחלץ את הנתונים</p>
      </div>
      <Card className="p-6 space-y-4">
        <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="הדבק כאן שיחת ווטסאפ או טקסט חופשי..." />
        <Button onClick={extract} disabled={loading || !text} className="gap-2">
          <Sparkles className="h-4 w-4" /> {loading ? "מנתח..." : "חלץ נתונים עם AI"}
        </Button>
      </Card>

      {extracted && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">נתונים שחולצו</h2>
            <Button onClick={createCustomer}>צור לקוח חדש</Button>
          </div>
          {extracted.summary && <p className="text-sm text-muted-foreground">{extracted.summary}</p>}
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Field label="שם" value={extracted.customer_name} />
            <Field label="טלפון" value={extracted.phone} />
            <Field label="אימייל" value={extracted.email} />
            <Field label="יעד" value={extracted.destination} />
            <Field label="תאריך התחלה" value={extracted.travel_start_date} />
            <Field label="תאריך סיום" value={extracted.travel_end_date} />
            <Field label="PNR" value={extracted.pnr} />
            <Field label="נוסעים" value={extracted.number_of_passengers} />
            <Field label="מחיר" value={extracted.total_price} />
            <Field label="שולם" value={extracted.amount_paid} />
          </div>
          {extracted.flights?.length > 0 && (
            <div>
              <div className="font-medium mb-2">טיסות שזוהו</div>
              {extracted.flights.map((f: any, i: number) => (
                <div key={i} className="text-sm border border-border rounded p-2 mb-2">
                  {f.airline} <span dir="ltr">{f.flight_number}</span> — <span dir="ltr">{f.departure_airport} → {f.arrival_airport}</span> — {f.departure_datetime}
                </div>
              ))}
            </div>
          )}
          {extracted.follow_up_tasks?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {extracted.follow_up_tasks.map((t: string, i: number) => <Badge key={i} variant="secondary">{t}</Badge>)}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="border border-border rounded p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}