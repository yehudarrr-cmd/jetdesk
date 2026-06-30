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
import { ArrowRight, Phone, MessageCircle, Plus, Trash2, Pencil, Copy, Upload, Loader2, FileText, ScanLine, User, Plane, Users, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { whatsappLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { displayNameHebrew } from "@/lib/he-translit";
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
      const [flights, hotels, cars, transfers, docs, payments, tasks, notes, timeline, bookings, ffp, companions] = await Promise.all([
        supabase.from("flights").select("*").eq("customer_id", id).order("departure_datetime"),
        supabase.from("hotels").select("*").eq("customer_id", id).order("check_in_date"),
        supabase.from("car_rentals").select("*").eq("customer_id", id).order("pickup_datetime"),
        supabase.from("transfers").select("*").eq("customer_id", id).order("datetime"),
        supabase.from("documents").select("*").eq("customer_id", id).order("uploaded_at", { ascending: false }),
        supabase.from("payments").select("*").eq("customer_id", id).order("payment_date", { ascending: false }),
        supabase.from("tasks").select("*").eq("customer_id", id).order("due_date"),
        supabase.from("conversations").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
        supabase.from("timeline_events").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").eq("customer_id", id).order("departure_date", { ascending: false, nullsFirst: false }),
        supabase.from("frequent_flyer_programs").select("*").eq("customer_id", id).order("airline"),
        supabase.from("companion_travelers").select("*").eq("customer_id", id).order("full_name"),
      ]);
      const passports = await supabase.from("passports").select("*").eq("customer_id", id).order("created_at", { ascending: false });
      return {
        flights: flights.data ?? [], hotels: hotels.data ?? [], cars: cars.data ?? [],
        transfers: transfers.data ?? [], docs: docs.data ?? [], payments: payments.data ?? [],
        tasks: tasks.data ?? [], notes: notes.data ?? [], timeline: timeline.data ?? [],
        passports: passports.data ?? [],
        bookings: bookings.data ?? [], ffp: ffp.data ?? [], companions: companions.data ?? [],
      };
    },
  });

  if (customer.isLoading) return <div className="p-6 text-muted-foreground">טוען...</div>;
  if (!customer.data) return <div className="p-6">לקוח לא נמצא</div>;
  const c = customer.data;
  const balance = Number(c.total_price ?? 0) - Number(c.amount_paid ?? 0);
  const totalPaid = (related.data?.payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const bookings = (related.data?.bookings ?? []) as any[];
  const totalProfit = bookings.reduce((s, b) => s + Number(b.profit ?? 0), 0);
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.departure_date && b.departure_date >= todayIso)
    .sort((a, b) => String(a.departure_date).localeCompare(String(b.departure_date)))[0];
  const lastDest = bookings.find((b) => b.destination)?.destination ?? c.destination ?? "—";

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
          <Stat label="הזמנות" value={String(bookings.length)} />
          <Stat label="סה״כ רווחים" value={formatCurrency(totalProfit)} accent="success" />
          <Stat label="יעד אחרון" value={lastDest} />
          <Stat label="הזמנה קרובה" value={upcoming ? `${upcoming.destination ?? ""} • ${formatDate(upcoming.departure_date)}` : "—"} />
          <Stat label="מחיר כולל" value={formatCurrency(c.total_price)} />
          <Stat label="שולם" value={formatCurrency(c.amount_paid)} />
          <Stat label="יתרה" value={formatCurrency(balance)} accent={balance > 0 ? "warning" : "success"} />
          <Stat label="יצירת קשר אחרון" value={c.last_contact_at ? formatDateTime(c.last_contact_at) : formatDate(c.created_at)} />
        </div>
      </Card>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">סקירה</TabsTrigger>
          <TabsTrigger value="bookings">הזמנות</TabsTrigger>
          <TabsTrigger value="ffp">מועדוני נוסע</TabsTrigger>
          <TabsTrigger value="companions">נוסעים נלווים</TabsTrigger>
          <TabsTrigger value="conversations">שיחות</TabsTrigger>
          <TabsTrigger value="passports">דרכונים</TabsTrigger>
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
              <Field label="תעודת זהות"><Input dir="ltr" defaultValue={(c as any).id_number ?? ""} onBlur={(e) => updateField({ id_number: e.target.value })} /></Field>
              <Field label="תאריך לידה"><Input type="date" defaultValue={(c as any).date_of_birth ?? ""} onBlur={(e) => updateField({ date_of_birth: e.target.value || null })} /></Field>
              <div className="md:col-span-2"><Field label="כתובת"><Input defaultValue={(c as any).address ?? ""} onBlur={(e) => updateField({ address: e.target.value })} /></Field></div>
              <Field label="סטטוס"><Input defaultValue={c.status ?? ""} onBlur={(e) => updateField({ status: e.target.value })} /></Field>
              <Field label="יעד"><Input defaultValue={c.destination ?? ""} onBlur={(e) => updateField({ destination: e.target.value })} /></Field>
              <Field label="PNR"><Input dir="ltr" defaultValue={c.pnr ?? ""} onBlur={(e) => updateField({ pnr: e.target.value })} /></Field>
              <Field label="תאריך התחלה"><Input type="date" defaultValue={c.travel_start_date ?? ""} onBlur={(e) => updateField({ travel_start_date: e.target.value || null })} /></Field>
              <Field label="תאריך סיום"><Input type="date" defaultValue={c.travel_end_date ?? ""} onBlur={(e) => updateField({ travel_end_date: e.target.value || null })} /></Field>
              <Field label="מחיר כולל"><Input type="number" step="0.01" defaultValue={c.total_price ?? 0} onBlur={(e) => updateField({ total_price: Number(e.target.value) })} /></Field>
              <Field label="שולם"><Input type="number" step="0.01" defaultValue={c.amount_paid ?? 0} onBlur={(e) => updateField({ amount_paid: Number(e.target.value) })} /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <BookingsTab customerId={id} items={bookings} />
        </TabsContent>

        <TabsContent value="ffp" className="mt-4">
          <FrequentFlyerTab customerId={id} items={related.data?.ffp ?? []} />
        </TabsContent>

        <TabsContent value="companions" className="mt-4">
          <CompanionsTab customerId={id} items={related.data?.companions ?? []} />
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <ConversationsTab customerId={id} items={related.data?.notes ?? []} />
        </TabsContent>

        <TabsContent value="passports" className="mt-4">
          <PassportsTab customerId={id} items={related.data?.passports ?? []} />
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

function BookingsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { title: "", booking_number: "", destination: "", departure_date: "", return_date: "", status: "draft", total_price: 0, amount_paid: 0, profit: 0, notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      title: b.title ?? "", booking_number: b.booking_number ?? "",
      destination: b.destination ?? "",
      departure_date: b.departure_date ?? "", return_date: b.return_date ?? "",
      status: b.status ?? "draft",
      total_price: b.total_price ?? 0, amount_paid: b.amount_paid ?? 0, profit: b.profit ?? 0,
      notes: b.notes ?? "",
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("bookings").update(payload).eq("id", editingId)
      : supabase.from("bookings").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "ההזמנה עודכנה" : "הזמנה נוספה");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("ההזמנה נמחקה");
    refresh();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      draft: { label: "טיוטה", variant: "outline" },
      quoted: { label: "הצעת מחיר", variant: "secondary" },
      confirmed: { label: "מאושר", variant: "default" },
      completed: { label: "הושלם", variant: "secondary" },
      cancelled: { label: "בוטל", variant: "destructive" },
    };
    const m = map[s] ?? { label: s, variant: "outline" as const };
    return <Badge variant={m.variant}>{m.label}</Badge>;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Plane className="h-4 w-4" /> היסטוריית נסיעות והזמנות ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף הזמנה חדשה</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת הזמנה" : "הזמנה חדשה"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="כותרת"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="למשל: חופשה בפראג ספטמבר 2026" /></Field></div>
            <Field label="מספר הזמנה"><Input dir="ltr" value={form.booking_number} onChange={(e) => setForm({ ...form, booking_number: e.target.value })} /></Field>
            <Field label="יעד"><Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
            <Field label="תאריך יציאה"><Input type="date" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} /></Field>
            <Field label="תאריך חזרה"><Input type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} /></Field>
            <Field label="סטטוס">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">טיוטה</SelectItem>
                  <SelectItem value="quoted">הצעת מחיר</SelectItem>
                  <SelectItem value="confirmed">מאושר</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="מחיר כולל"><Input type="number" step="0.01" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: Number(e.target.value) })} /></Field>
            <Field label="שולם"><Input type="number" step="0.01" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: Number(e.target.value) })} /></Field>
            <Field label="רווח"><Input type="number" step="0.01" value={form.profit} onChange={(e) => setForm({ ...form, profit: Number(e.target.value) })} /></Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-3">
        {items.map((b) => {
          const bal = Number(b.total_price ?? 0) - Number(b.amount_paid ?? 0);
          return (
            <div key={b.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {b.title || "(ללא כותרת)"}
                    {statusBadge(b.status)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                    {b.destination && <span>📍 {b.destination}</span>}
                    {b.departure_date && <span>🛫 {formatDate(b.departure_date)}</span>}
                    {b.return_date && <span>🛬 {formatDate(b.return_date)}</span>}
                    {b.booking_number && <span dir="ltr">#{b.booking_number}</span>}
                  </div>
                </div>
                <RowActions onEdit={() => openEdit(b)} onDelete={() => remove(b.id)} confirmText={`למחוק את "${b.title ?? "ההזמנה"}"?`} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border text-sm">
                <div><span className="text-muted-foreground">מחיר: </span>{formatCurrency(b.total_price)}</div>
                <div><span className="text-muted-foreground">שולם: </span>{formatCurrency(b.amount_paid)}</div>
                <div className={bal > 0 ? "text-warning" : "text-success"}><span className="text-muted-foreground">יתרה: </span>{formatCurrency(bal)}</div>
                <div className="text-success font-medium"><span className="text-muted-foreground">רווח: </span>{formatCurrency(b.profit)}</div>
              </div>
              {b.notes && <div className="text-sm text-muted-foreground pt-2 border-t border-border whitespace-pre-wrap">{b.notes}</div>}
            </div>
          );
        })}
        {items.length === 0 && <div className="text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">אין הזמנות עדיין. לחץ "הוסף הזמנה חדשה" כדי להתחיל.</div>}
      </div>
    </Card>
  );
}

function FrequentFlyerTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { airline: "", program_name: "", member_number: "", tier: "", notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({ airline: r.airline ?? "", program_name: r.program_name ?? "", member_number: r.member_number ?? "", tier: r.tier ?? "", notes: r.notes ?? "" });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("frequent_flyer_programs").update(payload).eq("id", editingId)
      : supabase.from("frequent_flyer_programs").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "המועדון עודכן" : "מועדון נוסע נוסף");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("frequent_flyer_programs").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("המועדון נמחק");
    refresh();
  };
  const copy = async (v: string | null) => {
    if (!v) return;
    try { await navigator.clipboard.writeText(v); toast.success("הועתק"); } catch { toast.error("שגיאה"); }
  };

  const suggestions = ["EL AL Matmid", "Lufthansa Miles & More", "Air France/KLM Flying Blue", "Turkish Airlines Miles&Smiles", "Emirates Skywards", "Aegean Miles+Bonus", "British Airways Executive Club", "United MileagePlus"];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Award className="h-4 w-4" /> מועדוני נוסע מתמיד ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף מועדון</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת מועדון" : "מועדון נוסע חדש"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="חברת תעופה / מועדון">
                <Input required value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} list="ffp-airlines" placeholder="EL AL" />
                <datalist id="ffp-airlines">
                  {suggestions.map((s) => <option key={s} value={s} />)}
                </datalist>
              </Field>
            </div>
            <Field label="שם תוכנית"><Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} placeholder="Matmid / Miles & More" /></Field>
            <Field label="מספר נוסע מתמיד"><Input dir="ltr" value={form.member_number} onChange={(e) => setForm({ ...form, member_number: e.target.value })} /></Field>
            <Field label="סטטוס / Tier"><Input value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} placeholder="Silver / Gold / Platinum" /></Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 space-y-1">
              <div className="font-semibold">{r.airline}{r.program_name ? ` — ${r.program_name}` : ""}</div>
              <div className="flex items-center gap-2 flex-wrap text-sm">
                {r.member_number && (
                  <button onClick={() => copy(r.member_number)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted hover:bg-muted/70" dir="ltr" title="העתק">
                    <Copy className="h-3 w-3" /> {r.member_number}
                  </button>
                )}
                {r.tier && <Badge variant="secondary">{r.tier}</Badge>}
              </div>
              {r.notes && <div className="text-xs text-muted-foreground">{r.notes}</div>}
            </div>
            <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r.id)} confirmText={`למחוק את המועדון ${r.airline}?`} />
          </div>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">אין מועדוני נוסע. הוסף את חברות התעופה שהלקוח חבר בהן.</div>}
      </div>
    </Card>
  );
}

function CompanionsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const empty = { full_name: "", relation: "", date_of_birth: "", passport_number: "", passport_expiry: "", nationality: "", notes: "" };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });
  const openAdd = () => { setEditingId(null); setForm(empty); setOpen(true); };
  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({
      full_name: r.full_name ?? "", relation: r.relation ?? "",
      date_of_birth: r.date_of_birth ?? "",
      passport_number: r.passport_number ?? "", passport_expiry: r.passport_expiry ?? "",
      nationality: r.nationality ?? "", notes: r.notes ?? "",
    });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = editingId ? {} : { customer_id: customerId };
    Object.entries(form).forEach(([k, v]) => { payload[k] = v === "" ? null : v; });
    const op = editingId
      ? supabase.from("companion_travelers").update(payload).eq("id", editingId)
      : supabase.from("companion_travelers").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "הנוסע עודכן" : "נוסע נלווה נוסף");
    refresh();
    setOpen(false);
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("companion_travelers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("הנוסע נמחק");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> נוסעים קבועים נלווים ({items.length})</h3>
        <Button size="sm" className="gap-1" onClick={openAdd}><Plus className="h-4 w-4" /> הוסף נוסע</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "עריכת נוסע" : "נוסע נלווה חדש"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="grid grid-cols-2 gap-3">
            <Field label="שם מלא"><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="קרבה / יחס">
              <Input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} list="comp-relations" placeholder="בן/בת זוג / ילד / הורה" />
              <datalist id="comp-relations">
                <option value="בן/בת זוג" />
                <option value="ילד/ה" />
                <option value="הורה" />
                <option value="אח/אחות" />
                <option value="שותף לנסיעה" />
              </datalist>
            </Field>
            <Field label="תאריך לידה"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
            <Field label="לאום"><Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></Field>
            <Field label="מספר דרכון"><Input dir="ltr" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} /></Field>
            <Field label="תוקף דרכון"><Input type="date" value={form.passport_expiry} onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })} /></Field>
            <div className="col-span-2"><Field label="הערות"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field></div>
            <DialogFooter className="col-span-2"><Button type="submit">שמור</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((r) => (
          <div key={r.id} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{r.full_name}</div>
                {r.relation && <div className="text-xs text-muted-foreground">{r.relation}</div>}
              </div>
              <RowActions onEdit={() => openEdit(r)} onDelete={() => remove(r.id)} confirmText={`למחוק את ${r.full_name}?`} />
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              {r.date_of_birth && <div>🎂 {formatDate(r.date_of_birth)}</div>}
              {r.passport_number && <div dir="ltr">📄 {r.passport_number}{r.passport_expiry ? ` (תוקף: ${formatDate(r.passport_expiry)})` : ""}</div>}
              {r.nationality && <div>🌍 {r.nationality}</div>}
              {r.notes && <div className="pt-1 border-t border-border whitespace-pre-wrap">{r.notes}</div>}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="md:col-span-2 text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">אין נוסעים נלווים. הוסף בני משפחה או שותפים לנסיעות כדי לחסוך הקלדה חוזרת.</div>}
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
  const [category, setCategory] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ file_name: "", file_url: "", category: "other" });

  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("יש להתחבר"); return; }
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${customerId}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase.storage.from("customer-files").upload(path, file, { contentType: file.type });
        if (upErr) { toast.error(upErr.message); continue; }
        const { data: signed } = await supabase.storage.from("customer-files").createSignedUrl(path, 60 * 60 * 24 * 365);
        const { error } = await supabase.from("documents").insert({
          customer_id: customerId, file_name: file.name,
          file_url: signed?.signedUrl ?? path, file_type: file.type,
          category: category as any,
        });
        if (error) toast.error(error.message);
      }
      toast.success("הקבצים הועלו");
      refresh();
    } finally { setUploading(false); }
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
      <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <Label className="mb-1.5 block">קטגוריה</Label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>
          <div>
            <Label className="mb-1.5 block">קובץ (PDF, תמונה וכו׳)</Label>
            <Input type="file" multiple accept="image/*,application/pdf,.doc,.docx" disabled={uploading}
              onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
          </div>
        </div>
        {uploading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> מעלה...</div>}
      </div>
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

function CopyField({ label, value, icon, dir = "ltr" }: { label: string; value: string | null | undefined; icon?: React.ReactNode; dir?: "ltr" | "rtl" }) {
  const v = value ?? "";
  const copy = async () => {
    if (!v) return;
    try { await navigator.clipboard.writeText(v); toast.success("הועתק"); } catch { toast.error("שגיאה בהעתקה"); }
  };
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
        {label}
        {icon}
      </Label>
      <div className="flex items-stretch gap-1">
        <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copy} disabled={!v} title="העתק">
          <Copy className="h-4 w-4" />
        </Button>
        <Input dir={dir} readOnly value={v} className="bg-muted/40 text-center font-medium" />
      </div>
    </div>
  );
}

function PassportsTab({ customerId, items }: { customerId: string; items: any[] }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["customer-related", customerId] });

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("יש להתחבר"); return; }
      // 1. upload to storage
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const path = `${user.id}/${customerId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from("passports").upload(path, file, { contentType: file.type });
      if (upErr) { toast.error(upErr.message); return; }
      const { data: signed } = await supabase.storage.from("passports").createSignedUrl(path, 60 * 60 * 24 * 365);
      const imageUrl = signed?.signedUrl ?? null;

      // 2. read as base64 and call extract function
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          const s = String(r.result);
          const idx = s.indexOf(",");
          resolve(idx >= 0 ? s.slice(idx + 1) : s);
        };
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });

      toast.info("מנתח את הדרכון...");
      const { data, error } = await supabase.functions.invoke("extract-passport", {
        body: { image_base64: base64, mime_type: file.type },
      });
      if (error) { toast.error(error.message); return; }
      const ex = (data as any)?.extracted ?? {};

      const { error: insErr } = await supabase.from("passports").insert({
        customer_id: customerId,
        image_url: imageUrl,
        first_name: ex.first_name ?? null,
        last_name: ex.last_name ?? null,
        passport_number: ex.passport_number ?? null,
        date_of_birth: ex.date_of_birth ?? null,
        issue_date: ex.issue_date ?? null,
        expiry_date: ex.expiry_date ?? null,
        nationality: ex.nationality ?? null,
        sex: ex.sex ?? null,
        place_of_birth: ex.place_of_birth ?? null,
        issuing_country: ex.issuing_country ?? null,
        raw_extracted: ex,
      });
      if (insErr) { toast.error(insErr.message); return; }
      toast.success("הדרכון נוסף וחולץ");
      refresh();
    } finally { setUploading(false); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("passports").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("הדרכון נמחק");
    refresh();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><ScanLine className="h-4 w-4" /> דרכונים ({items.length})</h3>
          <p className="text-xs text-muted-foreground mt-1">העלה תמונה / סריקה של דרכון או ת״ז — הנתונים יחולצו אוטומטית</p>
        </div>
        <label className="inline-flex">
          <input type="file" className="hidden" accept="image/*,application/pdf" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.currentTarget.value = ""; }} />
          <Button asChild size="sm" className="gap-1" disabled={uploading}>
            <span>{uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> מעבד...</> : <><Upload className="h-4 w-4" /> העלה דרכון</>}</span>
          </Button>
        </label>
      </div>

      <div className="space-y-4">
        {items.map((p) => (
          <Card key={p.id} className="p-5 bg-muted/20" dir="rtl">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="font-bold text-lg">{[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap" dir="ltr">
                  {p.passport_number && <span>📄 {p.passport_number}</span>}
                  {p.date_of_birth && <span>🎂 {p.date_of_birth}</span>}
                  {p.expiry_date && <span>⏳ {p.expiry_date}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.image_url && (
                  <a href={p.image_url} target="_blank" rel="noreferrer" className="shrink-0">
                    <img src={p.image_url} alt="passport" className="h-16 w-24 object-cover rounded border border-border" />
                  </a>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>מחיקת דרכון</AlertDialogTitle>
                      <AlertDialogDescription>למחוק את הדרכון של {[p.first_name, p.last_name].filter(Boolean).join(" ") || "הלקוח"}?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove(p.id)} className="bg-destructive text-destructive-foreground">מחק</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CopyField label="שם פרטי" value={p.first_name} icon={<User className="h-3 w-3" />} />
              <CopyField label="שם משפחה" value={p.last_name} icon={<User className="h-3 w-3" />} />
              <CopyField label="ת. לידה" value={p.date_of_birth} />
              <CopyField label="מס׳ דרכון" value={p.passport_number} />
              <CopyField label="תוקף" value={p.expiry_date} />
              <CopyField label="הנפקה" value={p.issue_date} />
              <CopyField label="לאום" value={p.nationality} />
              <CopyField label="מין" value={p.sex} />
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">אין דרכונים. העלה תמונה כדי להתחיל.</div>}
      </div>
    </Card>
  );
}
