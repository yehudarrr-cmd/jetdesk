import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { ArrowRight, Phone, MessageCircle, Plus, Trash2, Pencil, Copy, Upload, Loader2, FileText, ScanLine, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { whatsappLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/$id")({
  component: CustomerCardPage,
});

function CustomerCardPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState("");

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
      const passports = await supabase.from("passports").select("*").eq("customer_id", id).order("created_at", { ascending: false });
      return {
        flights: flights.data ?? [], hotels: hotels.data ?? [], cars: cars.data ?? [],
        transfers: transfers.data ?? [], docs: docs.data ?? [], payments: payments.data ?? [],
        tasks: tasks.data ?? [], notes: notes.data ?? [], timeline: timeline.data ?? [],
        passports: passports.data ?? [],
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

  const deleteCustomer = async () => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("הלקוח נמחק");
    qc.invalidateQueries({ queryKey: ["customers"] });
    navigate({ to: "/customers" });
  };

  const renameCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const { error } = await supabase.from("customers").update({ name: newName.trim() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("השם עודכן");
    qc.invalidateQueries({ queryKey: ["customer", id] });
    qc.invalidateQueries({ queryKey: ["customers"] });
    setRenameOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> חזרה לרשימת הלקוחות
      </Link>

      <Card className="p-6 gradient-surface shadow-elegant">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{c.name}</h1>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setNewName(c.name); setRenameOpen(true); }} title="שנה שם">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4" /> מחק לקוח</Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>למחוק את {c.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק את הלקוח לצמיתות. נתונים מקושרים (טיסות, מלונות, תשלומים וכו׳) עלולים להישאר ללא לקוח.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteCustomer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
          <HotelsTab customerId={id} items={related.data?.hotels ?? []} />
        </TabsContent>

        <TabsContent value="cars" className="mt-4">
          <CarsTab customerId={id} items={related.data?.cars ?? []} />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <TransfersTab customerId={id} items={related.data?.transfers ?? []} />
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
          <TimelineTab customerId={id} items={related.data?.timeline ?? []} />
        </TabsContent>
      </Tabs>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>שינוי שם לקוח</DialogTitle></DialogHeader>
          <form onSubmit={renameCustomer} className="space-y-4">
            <Field label="שם מלא"><Input required value={newName} onChange={(e) => setNewName(e.target.value)} /></Field>
            <DialogFooter><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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

function RowActions({ onEdit, onDelete, confirmText }: { onEdit: () => void; onDelete: () => void | Promise<void>; confirmText: string }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="ערוך">
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="מחק">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקה</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FlightsTab({ customerId, customer, items }: { customerId: string; customer: any; items: any[] }) {
  const qc = useQueryClient();
  const empty = { airline: "", flight_number: "", departure_airport: "", arrival_airport: "", departure_datetime: "", arrival_datetime: "", pnr: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (f: any) => {
    setEditingId(f.id);
    setForm({
      airline: f.airline ?? "",
      flight_number: f.flight_number ?? "",
      departure_airport: f.departure_airport ?? "",
      arrival_airport: f.arrival_airport ?? "",
      departure_datetime: f.departure_datetime ? String(f.departure_datetime).slice(0, 16) : "",
      arrival_datetime: f.arrival_datetime ? String(f.arrival_datetime).slice(0, 16) : "",
      pnr: f.pnr ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("flights").update(payload).eq("id", editingId)
      : supabase.from("flights").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "טיסה עודכנה" : "טיסה נוספה");
    refresh();
    setOpen(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("flights").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("טיסה נמחקה");
    refresh();
  };

  const updateStatus = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from("flights").update({ [field]: value } as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">טיסות ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף טיסה</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת טיסה" : "טיסה חדשה"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
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
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium">{f.airline} <span dir="ltr">{f.flight_number}</span></div>
                <div className="text-sm text-muted-foreground" dir="ltr">{f.departure_airport} → {f.arrival_airport}</div>
                <div className="text-sm text-muted-foreground">{formatDateTime(f.departure_datetime)}</div>
              </div>
              <div className="flex items-center gap-2">
                {customer.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={whatsappLink(customer.phone, WhatsAppTemplates.flightUpdate(customer.name, f.flight_number ?? ""))!} target="_blank" rel="noreferrer" className="gap-1">
                      <MessageCircle className="h-4 w-4" /> עדכון
                    </a>
                  </Button>
                )}
                <RowActions onEdit={() => openEdit(f)} onDelete={() => remove(f.id)} confirmText={`למחוק את הטיסה ${f.flight_number ?? ""}?`} />
              </div>
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

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ amount: "", payment_type: "deposit", method: "cash" });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
    qc.invalidateQueries({ queryKey: ["customer", customerId] });
  };

  const bumpAmountPaid = async (delta: number) => {
    if (!delta) return;
    const { data: cust } = await supabase.from("customers").select("amount_paid").eq("id", customerId).single();
    await supabase.from("customers").update({ amount_paid: Number(cust?.amount_paid ?? 0) + delta }).eq("id", customerId);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    const { error } = await supabase.from("payments").insert({
      customer_id: customerId, amount: amt, payment_type: type as any, method: method as any,
    });
    if (error) { toast.error(error.message); return; }
    await bumpAmountPaid(amt);
    toast.success("תשלום נרשם");
    refresh();
    setAmount("");
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setEditForm({ amount: String(p.amount), payment_type: p.payment_type ?? "deposit", method: p.method ?? "cash" });
    setEditOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const newAmt = Number(editForm.amount);
    const delta = newAmt - Number(editing.amount);
    const { error } = await supabase.from("payments").update({
      amount: newAmt, payment_type: editForm.payment_type as any, method: editForm.method as any,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    await bumpAmountPaid(delta);
    toast.success("התשלום עודכן");
    refresh();
    setEditOpen(false);
  };

  const remove = async (p: any) => {
    const { error } = await supabase.from("payments").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    await bumpAmountPaid(-Number(p.amount));
    toast.success("התשלום נמחק");
    refresh();
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
            <RowActions onEdit={() => openEdit(p)} onDelete={() => remove(p)} confirmText={`למחוק תשלום על סך ${formatCurrency(p.amount)}? "שולם" יעודכן בהתאם.`} />
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין תשלומים עדיין</div>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>עריכת תשלום</DialogTitle></DialogHeader>
          <form onSubmit={submitEdit} className="grid grid-cols-2 gap-3">
            <Field label="סכום"><Input type="number" step="0.01" required value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} /></Field>
            <Field label="סוג">
              <Select value={editForm.payment_type} onValueChange={(v) => setEditForm({ ...editForm, payment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">מקדמה</SelectItem>
                  <SelectItem value="full">מלא</SelectItem>
                  <SelectItem value="refund">החזר</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="אמצעי">
              <Select value={editForm.method} onValueChange={(v) => setEditForm({ ...editForm, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">מזומן</SelectItem>
                  <SelectItem value="bank_transfer">העברה בנקאית</SelectItem>
                  <SelectItem value="credit_card">כרטיס אשראי</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TasksTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", due_date: "", priority: "medium", status: "open" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tasks").insert({ customer_id: customerId, title });
    if (error) { toast.error(error.message); return; }
    refresh();
    setTitle("");
  };
  const toggle = async (id: string, status: string) => {
    const next = status === "done" ? "open" : "done";
    await supabase.from("tasks").update({ status: next as any }).eq("id", id);
    refresh();
  };
  const openEdit = (t: any) => {
    setEditing(t);
    setEditForm({ title: t.title ?? "", due_date: t.due_date ?? "", priority: t.priority ?? "medium", status: t.status ?? "open" });
    setEditOpen(true);
  };
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { error } = await supabase.from("tasks").update({
      title: editForm.title,
      due_date: editForm.due_date || null,
      priority: editForm.priority as any,
      status: editForm.status as any,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("המשימה עודכנה");
    refresh();
    setEditOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("המשימה נמחקה");
    refresh();
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
            <RowActions onEdit={() => openEdit(t)} onDelete={() => remove(t.id)} confirmText={`למחוק את "${t.title}"?`} />
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין משימות</div>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>עריכת משימה</DialogTitle></DialogHeader>
          <form onSubmit={submitEdit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="כותרת"><Input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></Field></div>
            <Field label="תאריך יעד"><Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} /></Field>
            <Field label="עדיפות">
              <Select value={editForm.priority} onValueChange={(v) => setEditForm({ ...editForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="סטטוס">
              <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">פתוחה</SelectItem>
                  <SelectItem value="in_progress">בעבודה</SelectItem>
                  <SelectItem value="done">הושלמה</SelectItem>
                </SelectContent>
              </Select>
            </Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ConversationsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ content: "", source: "manual" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("conversations").insert({ customer_id: customerId, content, source: source as any });
    if (error) { toast.error(error.message); return; }
    refresh();
    setContent("");
  };
  const openEdit = (m: any) => {
    setEditing(m);
    setEditForm({ content: m.content ?? "", source: m.source ?? "manual" });
    setEditOpen(true);
  };
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { error } = await supabase.from("conversations").update({ content: editForm.content, source: editForm.source as any }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("השיחה עודכנה");
    refresh();
    setEditOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("השיחה נמחקה");
    refresh();
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
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</span>
                <RowActions onEdit={() => openEdit(m)} onDelete={() => remove(m.id)} confirmText="למחוק את השיחה?" />
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין שיחות</div>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>עריכת שיחה</DialogTitle></DialogHeader>
          <form onSubmit={submitEdit} className="space-y-3">
            <Field label="מקור">
              <Select value={editForm.source} onValueChange={(v) => setEditForm({ ...editForm, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">ידני</SelectItem>
                  <SelectItem value="whatsapp">ווטסאפ</SelectItem>
                  <SelectItem value="telegram">טלגרם</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="תוכן"><Textarea rows={5} required value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} /></Field>
            <DialogFooter><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DocumentsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ file_name: "", file_url: "", category: "other" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("documents").insert({ customer_id: customerId, file_name: name, file_url: url, category: category as any });
    if (error) { toast.error(error.message); return; }
    refresh();
    setName(""); setUrl("");
  };
  const openEdit = (d: any) => {
    setEditing(d);
    setEditForm({ file_name: d.file_name ?? "", file_url: d.file_url ?? "", category: d.category ?? "other" });
    setEditOpen(true);
  };
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const { error } = await supabase.from("documents").update({
      file_name: editForm.file_name, file_url: editForm.file_url, category: editForm.category as any,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("המסמך עודכן");
    refresh();
    setEditOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("המסמך נמחק");
    refresh();
  };

  const CategorySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={onChange}>
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
  );

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={add} className="grid md:grid-cols-4 gap-2">
        <Input placeholder="שם קובץ" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required dir="ltr" />
        <CategorySelect value={category} onChange={setCategory} />
        <Button type="submit">הוסף</Button>
      </form>
      <div className="space-y-2">
        {items.map((d) => (
          <div key={d.id} className="flex items-center justify-between border border-border rounded p-3 hover:bg-muted/30">
            <a href={d.file_url} target="_blank" rel="noreferrer" className="flex-1 min-w-0">
              <div className="font-medium truncate">{d.file_name}</div>
              <div className="text-xs text-muted-foreground">{formatDateTime(d.uploaded_at)}</div>
            </a>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{d.category}</Badge>
              <RowActions onEdit={() => openEdit(d)} onDelete={() => remove(d.id)} confirmText={`למחוק את "${d.file_name}"?`} />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין מסמכים</div>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>עריכת מסמך</DialogTitle></DialogHeader>
          <form onSubmit={submitEdit} className="space-y-3">
            <Field label="שם קובץ"><Input required value={editForm.file_name} onChange={(e) => setEditForm({ ...editForm, file_name: e.target.value })} /></Field>
            <Field label="URL"><Input dir="ltr" required value={editForm.file_url} onChange={(e) => setEditForm({ ...editForm, file_url: e.target.value })} /></Field>
            <Field label="קטגוריה"><CategorySelect value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} /></Field>
            <DialogFooter><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function HotelsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { hotel_name: "", city: "", check_in_date: "", check_out_date: "", room_type: "", number_of_guests: 1, booking_status: "pending", notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (h: any) => {
    setEditingId(h.id);
    setForm({
      hotel_name: h.hotel_name ?? "", city: h.city ?? "",
      check_in_date: h.check_in_date ?? "", check_out_date: h.check_out_date ?? "",
      room_type: h.room_type ?? "", number_of_guests: h.number_of_guests ?? 1,
      booking_status: h.booking_status ?? "pending", notes: h.notes ?? "",
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("hotels").update(payload).eq("id", editingId)
      : supabase.from("hotels").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "המלון עודכן" : "מלון נוסף");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("hotels").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("המלון נמחק");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">מלונות ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף מלון</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת מלון" : "מלון חדש"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <Field label="שם המלון"><Input required value={form.hotel_name} onChange={(e) => setForm({ ...form, hotel_name: e.target.value })} /></Field>
            <Field label="עיר"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="צ׳ק-אין"><Input type="date" value={form.check_in_date} onChange={(e) => setForm({ ...form, check_in_date: e.target.value })} /></Field>
            <Field label="צ׳ק-אאוט"><Input type="date" value={form.check_out_date} onChange={(e) => setForm({ ...form, check_out_date: e.target.value })} /></Field>
            <Field label="סוג חדר"><Input value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })} /></Field>
            <Field label="מספר אורחים"><Input type="number" min={1} value={form.number_of_guests} onChange={(e) => setForm({ ...form, number_of_guests: Number(e.target.value) })} /></Field>
            <Field label="סטטוס">
              <Select value={form.booking_status} onValueChange={(v) => setForm({ ...form, booking_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-2">
        {items.map((h) => (
          <div key={h.id} className="border border-border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{h.hotel_name ?? "—"}</div>
              <div className="text-sm text-muted-foreground">{h.city ?? ""} • {formatDate(h.check_in_date)} – {formatDate(h.check_out_date)}</div>
            </div>
            <div className="flex items-center gap-2">
              {h.booking_status && <Badge variant="secondary">{h.booking_status}</Badge>}
              <RowActions onEdit={() => openEdit(h)} onDelete={() => remove(h.id)} confirmText={`למחוק את ${h.hotel_name ?? "המלון"}?`} />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין מלונות עדיין</div>}
      </div>
    </Card>
  );
}

function CarsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { company_name: "", car_type: "", pickup_location: "", return_location: "", pickup_datetime: "", return_datetime: "", booking_status: "pending", notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({
      company_name: r.company_name ?? "", car_type: r.car_type ?? "",
      pickup_location: r.pickup_location ?? "", return_location: r.return_location ?? "",
      pickup_datetime: r.pickup_datetime ? String(r.pickup_datetime).slice(0, 16) : "",
      return_datetime: r.return_datetime ? String(r.return_datetime).slice(0, 16) : "",
      booking_status: r.booking_status ?? "pending", notes: r.notes ?? "",
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("car_rentals").update(payload).eq("id", editingId)
      : supabase.from("car_rentals").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "ההשכרה עודכנה" : "השכרת רכב נוספה");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("car_rentals").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("ההשכרה נמחקה");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">השכרות רכב ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף רכב</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת השכרה" : "השכרת רכב חדשה"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <Field label="חברה"><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></Field>
            <Field label="סוג רכב"><Input value={form.car_type} onChange={(e) => setForm({ ...form, car_type: e.target.value })} /></Field>
            <Field label="מקום איסוף"><Input value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} /></Field>
            <Field label="מקום החזרה"><Input value={form.return_location} onChange={(e) => setForm({ ...form, return_location: e.target.value })} /></Field>
            <Field label="איסוף"><Input type="datetime-local" value={form.pickup_datetime} onChange={(e) => setForm({ ...form, pickup_datetime: e.target.value })} /></Field>
            <Field label="החזרה"><Input type="datetime-local" value={form.return_datetime} onChange={(e) => setForm({ ...form, return_datetime: e.target.value })} /></Field>
            <Field label="סטטוס">
              <Select value={form.booking_status} onValueChange={(v) => setForm({ ...form, booking_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="border border-border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.company_name ?? "—"} • {r.car_type ?? ""}</div>
              <div className="text-sm text-muted-foreground">{formatDateTime(r.pickup_datetime)} → {formatDateTime(r.return_datetime)}</div>
            </div>
            <div className="flex items-center gap-2">
              {r.booking_status && <Badge variant="secondary">{r.booking_status}</Badge>}
              <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r.id)} confirmText="למחוק את ההשכרה?" />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין השכרות עדיין</div>}
      </div>
    </Card>
  );
}

function TransfersTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { transfer_type: "", pickup_location: "", destination: "", datetime: "", number_of_passengers: 1, supplier: "", status: "pending", notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (t: any) => {
    setEditingId(t.id);
    setForm({
      transfer_type: t.transfer_type ?? "", pickup_location: t.pickup_location ?? "",
      destination: t.destination ?? "",
      datetime: t.datetime ? String(t.datetime).slice(0, 16) : "",
      number_of_passengers: t.number_of_passengers ?? 1, supplier: t.supplier ?? "",
      status: t.status ?? "pending", notes: t.notes ?? "",
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("transfers").update(payload).eq("id", editingId)
      : supabase.from("transfers").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "ההעברה עודכנה" : "העברה נוספה");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("transfers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("ההעברה נמחקה");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">העברות ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף העברה</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת העברה" : "העברה חדשה"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <Field label="סוג"><Input placeholder="VIP / מונית / שאטל" value={form.transfer_type} onChange={(e) => setForm({ ...form, transfer_type: e.target.value })} /></Field>
            <Field label="ספק"><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            <Field label="מקום איסוף"><Input value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} /></Field>
            <Field label="יעד"><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
            <Field label="תאריך / שעה"><Input type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} /></Field>
            <Field label="מספר נוסעים"><Input type="number" min={1} value={form.number_of_passengers} onChange={(e) => setForm({ ...form, number_of_passengers: Number(e.target.value) })} /></Field>
            <Field label="סטטוס">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="border border-border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{t.transfer_type ?? "—"}: {t.pickup_location ?? ""} → {t.destination ?? ""}</div>
              <div className="text-sm text-muted-foreground">{formatDateTime(t.datetime)}</div>
            </div>
            <div className="flex items-center gap-2">
              {t.status && <Badge variant="secondary">{t.status}</Badge>}
              <RowActions onEdit={() => openEdit(t)} onDelete={() => remove(t.id)} confirmText="למחוק את ההעברה?" />
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין העברות עדיין</div>}
      </div>
    </Card>
  );
}

function TimelineTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { title: "", description: "", type: "note" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ title: t.title ?? "", description: t.description ?? "", type: t.type ?? "note" });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const op = editingId
      ? supabase.from("timeline_events").update(form).eq("id", editingId)
      : supabase.from("timeline_events").insert({ customer_id: customerId, ...form });
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "האירוע עודכן" : "נוסף לציר זמן");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("timeline_events").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("האירוע נמחק");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">ציר זמן ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף אירוע</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת אירוע" : "אירוע חדש"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Field label="כותרת"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="סוג"><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="note / call / meeting" /></Field>
            <Field label="תיאור"><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <DialogFooter><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
            <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
            <div className="flex-1">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="text-sm text-muted-foreground mt-0.5">{t.description}</div>}
              <div className="text-xs text-muted-foreground mt-1">{formatDateTime(t.created_at)}</div>
            </div>
            <RowActions onEdit={() => openEdit(t)} onDelete={() => remove(t.id)} confirmText={`למחוק את "${t.title}"?`} />
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-6">אין אירועים בציר הזמן</div>}
      </div>
    </Card>
  );
}
