import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Phone, MessageCircle, Plus } from "lucide-react";
import { whatsappLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/$id")({
  component: CustomerCardPage,
});

function CustomerCardPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const customer = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const related = useQuery({
    queryKey: ["customer-related", id],
    queryFn: async () => {
      const [flights, hotels, cars, transfers, docs, payments, tasks, notes, timeline] = await Promise.all([
        supabase.from("flights").select("*").eq("customer_id", id).order("departure_datetime"),
        supabase.from("hotels").select("*").eq("customer_id", id).order("check_in_date"),
        supabase.from("car_rentals").select("*").eq("customer_id", id).order("pickup_datetime"),
        supabase.from("transfers").select("*").eq("customer_id", id).order("datetime"),
        supabase.from("documents").select("*").eq("customer_id", id).order("uploaded_at", { ascending: false }),
        supabase.from("payments").select("*").eq("customer_id", id).order("payment_date", { ascending: false }),
        supabase.from("tasks").select("*").eq("customer_id", id).order("due_date"),
        supabase.from("conversations").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
        supabase.from("timeline_events").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
      ]);
      return {
        flights: flights.data ?? [], hotels: hotels.data ?? [], cars: cars.data ?? [],
        transfers: transfers.data ?? [], docs: docs.data ?? [], payments: payments.data ?? [],
        tasks: tasks.data ?? [], notes: notes.data ?? [], timeline: timeline.data ?? [],
      };
    },
  });

  if (customer.isLoading) return <div className="p-6 text-muted-foreground">טוען...</div>;
  if (!customer.data) return <div className="p-6">לקוח לא נמצא</div>;
  const c = customer.data;
  const balance = Number(c.total_price ?? 0) - Number(c.amount_paid ?? 0);
  const totalPaid = (related.data?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);

  const updateField = async (patch: Record<string, any>) => {
    const { error } = await supabase.from("customers").update(patch as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer", id] });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> חזרה לרשימת הלקוחות
      </Link>

      <Card className="p-6 gradient-surface shadow-elegant">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{c.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {c.phone && <span className="inline-flex items-center gap-1" dir="ltr"><Phone className="h-3.5 w-3.5" />{c.phone}</span>}
              {c.destination && <Badge variant="secondary">{c.destination}</Badge>}
              {c.pnr && <span>PNR: <span dir="ltr">{c.pnr}</span></span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={whatsappLink(c.phone, WhatsAppTemplates.generalReminder(c.name, c.destination ?? ""))!} target="_blank" rel="noreferrer" className="gap-1">
                  <MessageCircle className="h-4 w-4" /> ווטסאפ — תזכורת
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="מחיר כולל" value={formatCurrency(c.total_price)} />
          <Stat label="שולם" value={formatCurrency(c.amount_paid)} />
          <Stat label="יתרה" value={formatCurrency(balance)} accent={balance > 0 ? "warning" : "success"} />
          <Stat label="טיסות" value={String((related.data?.flights ?? []).length)} />
        </div>
      </Card>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">סקירה</TabsTrigger>
          <TabsTrigger value="conversations">שיחות</TabsTrigger>
          <TabsTrigger value="flights">טיסות</TabsTrigger>
          <TabsTrigger value="hotels">מלונות</TabsTrigger>
          <TabsTrigger value="cars">רכב</TabsTrigger>
          <TabsTrigger value="transfers">העברות</TabsTrigger>
          <TabsTrigger value="documents">מסמכים</TabsTrigger>
          <TabsTrigger value="payments">תשלומים</TabsTrigger>
          <TabsTrigger value="tasks">משימות</TabsTrigger>
          <TabsTrigger value="notes">הערות</TabsTrigger>
          <TabsTrigger value="timeline">ציר זמן</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="טלפון"><Input dir="ltr" defaultValue={c.phone ?? ""} onBlur={(e) => updateField({ phone: e.target.value })} /></Field>
              <Field label="אימייל"><Input dir="ltr" defaultValue={c.email ?? ""} onBlur={(e) => updateField({ email: e.target.value })} /></Field>
              <Field label="יעד"><Input defaultValue={c.destination ?? ""} onBlur={(e) => updateField({ destination: e.target.value })} /></Field>
              <Field label="PNR"><Input dir="ltr" defaultValue={c.pnr ?? ""} onBlur={(e) => updateField({ pnr: e.target.value })} /></Field>
              <Field label="תאריך התחלה"><Input type="date" defaultValue={c.travel_start_date ?? ""} onBlur={(e) => updateField({ travel_start_date: e.target.value || null })} /></Field>
              <Field label="תאריך סיום"><Input type="date" defaultValue={c.travel_end_date ?? ""} onBlur={(e) => updateField({ travel_end_date: e.target.value || null })} /></Field>
              <Field label="מחיר כולל"><Input type="number" step="0.01" defaultValue={c.total_price ?? 0} onBlur={(e) => updateField({ total_price: Number(e.target.value) })} /></Field>
              <Field label="שולם"><Input type="number" step="0.01" defaultValue={c.amount_paid ?? 0} onBlur={(e) => updateField({ amount_paid: Number(e.target.value) })} /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <ConversationsTab customerId={id} items={related.data?.notes ?? []} />
        </TabsContent>

        <TabsContent value="flights" className="mt-4">
          <FlightsTab customerId={id} customer={c} items={related.data?.flights ?? []} />
        </TabsContent>

        <TabsContent value="hotels" className="mt-4">
          <SimpleListTab title="מלונות" items={(related.data?.hotels ?? []).map((h) => ({
            id: h.id, primary: h.hotel_name ?? "—",
            secondary: `${h.city ?? ""} • ${formatDate(h.check_in_date)} – ${formatDate(h.check_out_date)}`,
            badge: h.booking_status ?? undefined,
          }))} />
        </TabsContent>

        <TabsContent value="cars" className="mt-4">
          <SimpleListTab title="השכרות רכב" items={(related.data?.cars ?? []).map((r) => ({
            id: r.id, primary: `${r.company_name ?? "—"} • ${r.car_type ?? ""}`,
            secondary: `${formatDateTime(r.pickup_datetime)} → ${formatDateTime(r.return_datetime)}`,
            badge: r.booking_status ?? undefined,
          }))} />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <SimpleListTab title="העברות" items={(related.data?.transfers ?? []).map((t) => ({
            id: t.id, primary: `${t.transfer_type ?? "—"}: ${t.pickup_location ?? ""} → ${t.destination ?? ""}`,
            secondary: formatDateTime(t.datetime),
            badge: t.status ?? undefined,
          }))} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab customerId={id} items={related.data?.docs ?? []} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentsTab customerId={id} items={related.data?.payments ?? []} totalPaid={totalPaid} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TasksTab customerId={id} items={related.data?.tasks ?? []} />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="p-6">
            <Textarea
              defaultValue={c.notes ?? ""}
              onBlur={(e) => updateField({ notes: e.target.value })}
              rows={10}
              placeholder="הערות פנימיות..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="p-6 space-y-3">
            {(related.data?.timeline ?? []).map((t) => (
              <div key={t.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  {t.description && <div className="text-sm text-muted-foreground mt-0.5">{t.description}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{formatDateTime(t.created_at)}</div>
                </div>
              </div>
            ))}
            {(related.data?.timeline ?? []).length === 0 && <div className="text-muted-foreground text-center py-6">אין אירועים בציר הזמן</div>}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "warning" | "success" }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold mt-1 ${accent === "warning" ? "text-warning" : accent === "success" ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}

function FlightsTab({ customerId, customer, items }: { customerId: string; customer: any; items: any[] }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ airline: "", flight_number: "", departure_airport: "", arrival_airport: "", departure_datetime: "", arrival_datetime: "", pnr: "" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { if (v) payload[k] = v; });
    const { error } = await supabase.from("flights").insert(payload as any);
    if (error) { toast.error(error.message); return; }
    toast.success("טיסה נוספה");
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    setOpen(false);
  };

  const updateStatus = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from("flights").update({ [field]: value } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">טיסות ({items.length})</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> הוסף טיסה</Button></DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>טיסה חדשה</DialogTitle></DialogHeader>
            <form onSubmit={add} className="grid grid-cols-2 gap-3">
              <Field label="חברה"><Input value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} /></Field>
              <Field label="מספר טיסה"><Input dir="ltr" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} /></Field>
              <Field label="מ-"><Input dir="ltr" value={form.departure_airport} onChange={(e) => setForm({ ...form, departure_airport: e.target.value })} /></Field>
              <Field label="ל-"><Input dir="ltr" value={form.arrival_airport} onChange={(e) => setForm({ ...form, arrival_airport: e.target.value })} /></Field>
              <Field label="המראה"><Input type="datetime-local" value={form.departure_datetime} onChange={(e) => setForm({ ...form, departure_datetime: e.target.value })} /></Field>
              <Field label="נחיתה"><Input type="datetime-local" value={form.arrival_datetime} onChange={(e) => setForm({ ...form, arrival_datetime: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="PNR"><Input dir="ltr" value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })} /></Field></div>
              <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{f.airline} <span dir="ltr">{f.flight_number}</span></div>
                <div className="text-sm text-muted-foreground" dir="ltr">{f.departure_airport} → {f.arrival_airport}</div>
                <div className="text-sm text-muted-foreground">{formatDateTime(f.departure_datetime)}</div>
              </div>
              {customer.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={whatsappLink(customer.phone, WhatsAppTemplates.flightUpdate(customer.name, f.flight_number ?? ""))!} target="_blank" rel="noreferrer" className="gap-1">
                    <MessageCircle className="h-4 w-4" /> עדכון
                  </a>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["check_in_status", "insurance_status", "ticket_status"] as const).map((k) => (
                <div key={k}>
                  <Label className="text-xs text-muted-foreground">{k === "check_in_status" ? "צ׳ק-אין" : k === "insurance_status" ? "ביטוח" : "כרטיס"}</Label>
                  <Select defaultValue={f[k]} onValueChange={(v) => updateStatus(f.id, k, v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">ממתין</SelectItem>
                      <SelectItem value="done">בוצע</SelectItem>
                      <SelectItem value="not_required">לא נדרש</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין טיסות עדיין</div>}
      </div>
    </Card>
  );
}

function PaymentsTab({ customerId, items, totalPaid }: { customerId: string; items: any[]; totalPaid: number }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");
  const [method, setMethod] = useState("cash");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("payments").insert({
      customer_id: customerId, amount: Number(amount), payment_type: type as any, method: method as any,
    });
    if (error) { toast.error(error.message); return; }
    // bump amount_paid
    const { data: cust } = await supabase.from("customers").select("amount_paid").eq("id", customerId).single();
    await supabase.from("customers").update({ amount_paid: Number(cust?.amount_paid ?? 0) + Number(amount) }).eq("id", customerId);
    toast.success("תשלום נרשם");
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    qc.invalidateQueries({ queryKey: ["customer", customerId] });
    setAmount("");
  };

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3">
        <Field label="סכום"><Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32" /></Field>
        <div>
          <Label className="mb-1.5 block">סוג</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deposit">מקדמה</SelectItem>
              <SelectItem value="full">מלא</SelectItem>
              <SelectItem value="refund">החזר</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">אמצעי</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">מזומן</SelectItem>
              <SelectItem value="bank_transfer">העברה בנקאית</SelectItem>
              <SelectItem value="credit_card">כרטיס אשראי</SelectItem>
              <SelectItem value="other">אחר</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">הוסף תשלום</Button>
      </form>
      <div className="text-sm text-muted-foreground">סה״כ נרשם: {formatCurrency(totalPaid)}</div>
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between border border-border rounded p-3">
            <div>
              <div className="font-medium">{formatCurrency(p.amount)}</div>
              <div className="text-xs text-muted-foreground">{p.payment_type} • {p.method} • {formatDate(p.payment_date)}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין תשלומים עדיין</div>}
      </div>
    </Card>
  );
}

function TasksTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").insert({ customer_id: customerId, title });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    setTitle("");
  };
  const toggle = async (id: string, status: string) => {
    const next = status === "done" ? "open" : "done";
    await supabase.from("tasks").update({ status: next }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  };
  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <Input placeholder="משימה חדשה..." value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Button type="submit">הוסף</Button>
      </form>
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-3 border border-border rounded p-3">
            <input type="checkbox" checked={t.status === "done"} onChange={() => toggle(t.id, t.status)} />
            <div className="flex-1">
              <div className={t.status === "done" ? "line-through text-muted-foreground" : ""}>{t.title}</div>
              {t.due_date && <div className="text-xs text-muted-foreground">{formatDate(t.due_date)}</div>}
            </div>
            <Badge variant="outline">{t.priority}</Badge>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין משימות</div>}
      </div>
    </Card>
  );
}

function ConversationsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("conversations").insert({ customer_id: customerId, content, source: source as any });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    setContent("");
  };
  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={add} className="space-y-2">
        <div className="flex gap-2">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">ידני</SelectItem>
              <SelectItem value="whatsapp">ווטסאפ</SelectItem>
              <SelectItem value="telegram">טלגרם</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">הוסף שיחה</Button>
        </div>
        <Textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="תוכן השיחה..." required />
      </form>
      <div className="space-y-2">
        {items.map((m) => (
          <div key={m.id} className="border border-border rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary">{m.source}</Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין שיחות</div>}
      </div>
    </Card>
  );
}

function DocumentsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("other");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("documents").insert({ customer_id: customerId, file_name: name, file_url: url, category: category as any });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    setName(""); setUrl("");
  };
  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={add} className="grid md:grid-cols-4 gap-2">
        <Input placeholder="שם קובץ" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required dir="ltr" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">דרכון</SelectItem>
            <SelectItem value="flight_ticket">כרטיס טיסה</SelectItem>
            <SelectItem value="hotel_voucher">ואוצ׳ר מלון</SelectItem>
            <SelectItem value="visa">ויזה</SelectItem>
            <SelectItem value="insurance">ביטוח</SelectItem>
            <SelectItem value="invoice">חשבונית</SelectItem>
            <SelectItem value="supplier_document">מסמך ספק</SelectItem>
            <SelectItem value="other">אחר</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">הוסף</Button>
      </form>
      <div className="space-y-2">
        {items.map((d) => (
          <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border rounded p-3 hover:bg-muted/30">
            <div>
              <div className="font-medium">{d.file_name}</div>
              <div className="text-xs text-muted-foreground">{formatDateTime(d.uploaded_at)}</div>
            </div>
            <Badge variant="secondary">{d.category}</Badge>
          </a>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין מסמכים</div>}
      </div>
    </Card>
  );
}

function SimpleListTab({ title, items }: { title: string; items: { id: string; primary: string; secondary: string; badge?: string }[] }) {
  return (
    <Card className="p-6 space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {items.map((it) => (
        <div key={it.id} className="border border-border rounded p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{it.primary}</div>
            <div className="text-sm text-muted-foreground">{it.secondary}</div>
          </div>
          {it.badge && <Badge variant="secondary">{it.badge}</Badge>}
        </div>
      ))}
      {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין רשומות</div>}
    </Card>
  );
}