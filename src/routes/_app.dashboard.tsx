import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, hoursUntil } from "@/lib/format";
import { whatsappLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { Plane, Wallet, AlertTriangle, CheckCircle2, MessageCircle, Clock, ChevronDown, Sprout, Phone, Mail, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [openPanel, setOpenPanel] = useState<null | "flights" | "balances" | "leads">(null);
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [customers, payments, tasks, flights, newLeads] = await Promise.all([
        supabase.from("customers").select("id,total_price,amount_paid"),
        supabase.from("payments").select("amount"),
        supabase.from("tasks").select("id,priority,status").in("status", ["open", "in_progress"]),
        supabase.from("flights").select("id,check_in_status,insurance_status,ticket_status,departure_datetime").gte("departure_datetime", new Date().toISOString()),
        supabase.from("landing_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      const totalRevenue = (customers.data ?? []).reduce((s, c) => s + Number(c.total_price ?? 0), 0);
      const totalPaid = (customers.data ?? []).reduce((s, c) => s + Number(c.amount_paid ?? 0), 0);
      const balances = totalRevenue - totalPaid;
      const urgentTasks = (tasks.data ?? []).filter((t) => t.priority === "urgent" || t.priority === "high").length;
      const missingDocs = (flights.data ?? []).filter(
        (f) => f.check_in_status === "pending" || f.insurance_status === "pending" || f.ticket_status === "pending"
      ).length;
      return {
        totalRevenue, balances,
        customers: customers.data?.length ?? 0,
        urgentTasks, missingDocs,
        newLeads: newLeads.count ?? 0,
      };
    },
  });

  const flights48 = useQuery({
    queryKey: ["flights-48h"],
    queryFn: async () => {
      const now = new Date();
      const in48 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      const { data, error } = await supabase
        .from("flights")
        .select("*, customers(id, name, phone, destination)")
        .gte("departure_datetime", now.toISOString())
        .lte("departure_datetime", in48.toISOString())
        .order("departure_datetime", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const openFlights = useQuery({
    queryKey: ["dashboard-open-flights"],
    enabled: openPanel === "flights",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*, customers(id, name, phone, destination)")
        .gte("departure_datetime", new Date().toISOString())
        .or("check_in_status.eq.pending,insurance_status.eq.pending,ticket_status.eq.pending")
        .order("departure_datetime", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const debtors = useQuery({
    queryKey: ["dashboard-debtors"],
    enabled: openPanel === "balances",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id,name,phone,destination,total_price,amount_paid")
        .order("name");
      if (error) throw error;
      return (data ?? [])
        .map((c) => ({ ...c, balance: Number(c.total_price ?? 0) - Number(c.amount_paid ?? 0) }))
        .filter((c) => c.balance > 0)
        .sort((a, b) => b.balance - a.balance);
    },
  });

  const newLeadsList = useQuery({
    queryKey: ["dashboard-new-leads"],
    enabled: openPanel === "leads",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_leads")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
        <p className="text-muted-foreground mt-1">תמונת מצב יומית של הסוכנות</p>
      </div>

      <LeadsHighlightCard
        count={stats.data?.newLeads ?? 0}
        active={openPanel === "leads"}
        onClick={() => setOpenPanel(openPanel === "leads" ? null : "leads")}
      />

      {openPanel === "leads" && (
        <Card className="overflow-hidden border-2 border-red-900/60 shadow-[0_10px_40px_-10px_rgba(220,38,38,0.35)]">
          <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-red-900/20 via-red-800/20 to-red-950/20">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold">לידים חדשים מהאתר</h2>
            </div>
            <Badge className="bg-gradient-to-r from-red-900 to-red-700 text-white border-0">{newLeadsList.data?.length ?? 0}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">אימייל</th>
                <th className="px-4 py-3 font-medium">יעד</th>
                <th className="px-4 py-3 font-medium">תאריכים</th>
                <th className="px-4 py-3 font-medium">נוסעים</th>
                <th className="px-4 py-3 font-medium">הודעה</th>
                <th className="px-4 py-3 font-medium">מקור</th>
                <th className="px-4 py-3 font-medium">נוצר</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody>
                {(newLeadsList.data ?? []).map((l: any) => {
                  const wa = whatsappLink(l.phone, `שלום ${l.name ?? ""}, פנית אלינו דרך האתר ואני שמח לחזור אליך`);
                  return (
                    <tr key={l.id} className="border-t border-border hover:bg-red-500/5">
                      <td className="px-4 py-3 font-medium">{l.name}</td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{l.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{l.email ?? "—"}</td>
                      <td className="px-4 py-3">{l.destination ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {l.travel_start_date ?? "—"}{l.travel_end_date ? ` → ${l.travel_end_date}` : ""}
                      </td>
                      <td className="px-4 py-3">{l.number_of_travelers ?? "—"}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground" title={l.message ?? ""}>{l.message ?? "—"}</td>
                      <td className="px-4 py-3 text-xs"><Badge variant="secondary">{l.source ?? "אתר"}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDateTime(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {wa && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a>
                            </Button>
                          )}
                          {l.phone && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${l.phone}`}><Phone className="h-4 w-4" /></a>
                            </Button>
                          )}
                          {l.email && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`mailto:${l.email}`}><Mail className="h-4 w-4" /></a>
                            </Button>
                          )}
                          <Button size="sm" variant="default" asChild>
                            <Link to="/leads" className="gap-1"><ExternalLink className="h-3 w-3" />פתח</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(newLeadsList.data ?? []).length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">{newLeadsList.isLoading ? "טוען..." : "אין לידים חדשים"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Wallet className="h-5 w-5" />} label="סך הכנסות" value={formatCurrency(stats.data?.totalRevenue ?? 0)} accent="primary" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="יתרות חוב" value={formatCurrency(stats.data?.balances ?? 0)} accent="warning"
          active={openPanel === "balances"} onClick={() => setOpenPanel(openPanel === "balances" ? null : "balances")} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="משימות דחופות" value={String(stats.data?.urgentTasks ?? 0)} accent="destructive" />
        <StatCard icon={<Plane className="h-5 w-5" />} label="טיסות עם פעולות פתוחות" value={String(stats.data?.missingDocs ?? 0)} accent="accent"
          hint="טיסות שיש בהן צ׳ק-אין / ביטוח / כרטיס במצב 'ממתין'"
          active={openPanel === "flights"} onClick={() => setOpenPanel(openPanel === "flights" ? null : "flights")} />
      </div>

      {openPanel === "balances" && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /><h2 className="text-lg font-semibold">לקוחות עם יתרת חוב</h2></div>
            <Badge variant="secondary">{debtors.data?.length ?? 0}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">לקוח</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">יעד</th>
                <th className="px-4 py-3 font-medium">מחיר כולל</th>
                <th className="px-4 py-3 font-medium">שולם</th>
                <th className="px-4 py-3 font-medium">יתרה</th>
              </tr></thead>
              <tbody>
                {(debtors.data ?? []).map((c: any) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3"><Link to="/customers/$id" params={{ id: c.id }} className="text-primary hover:underline font-medium">{c.name}</Link></td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">{c.destination ?? "—"}</td>
                    <td className="px-4 py-3">{formatCurrency(c.total_price)}</td>
                    <td className="px-4 py-3">{formatCurrency(c.amount_paid)}</td>
                    <td className="px-4 py-3 font-semibold text-warning">{formatCurrency(c.balance)}</td>
                  </tr>
                ))}
                {(debtors.data ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">{debtors.isLoading ? "טוען..." : "אין יתרות חוב פתוחות"}</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {openPanel === "flights" && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2"><Plane className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold">טיסות עם פעולות פתוחות</h2></div>
            <Badge variant="secondary">{openFlights.data?.length ?? 0}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40"><tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">לקוח</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">חברה / טיסה</th>
                <th className="px-4 py-3 font-medium">מסלול</th>
                <th className="px-4 py-3 font-medium">המראה</th>
                <th className="px-4 py-3 font-medium">PNR</th>
                <th className="px-4 py-3 font-medium">צ׳ק-אין</th>
                <th className="px-4 py-3 font-medium">ביטוח</th>
                <th className="px-4 py-3 font-medium">כרטיס</th>
              </tr></thead>
              <tbody>
                {(openFlights.data ?? []).map((f: any) => {
                  const c = f.customers;
                  return (
                    <tr key={f.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3"><Link to="/customers/$id" params={{ id: c?.id }} className="text-primary hover:underline font-medium">{c?.name}</Link></td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{c?.phone ?? "—"}</td>
                      <td className="px-4 py-3">{f.airline ?? "—"} {f.flight_number ?? ""}</td>
                      <td className="px-4 py-3 text-muted-foreground" dir="ltr">{f.departure_airport ?? "?"} → {f.arrival_airport ?? "?"}</td>
                      <td className="px-4 py-3">{formatDateTime(f.departure_datetime)}</td>
                      <td className="px-4 py-3" dir="ltr">{f.pnr ?? "—"}</td>
                      <td className="px-4 py-3"><StatusDot status={f.check_in_status} /></td>
                      <td className="px-4 py-3"><StatusDot status={f.insurance_status} /></td>
                      <td className="px-4 py-3"><StatusDot status={f.ticket_status} /></td>
                    </tr>
                  );
                })}
                {(openFlights.data ?? []).length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">{openFlights.isLoading ? "טוען..." : "אין טיסות עם פעולות פתוחות"}</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">טיסות ב-48 השעות הקרובות</h2>
          </div>
          <Badge variant="secondary">{flights48.data?.length ?? 0}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">לקוח</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">יעד</th>
                <th className="px-4 py-3 font-medium">חברה / טיסה</th>
                <th className="px-4 py-3 font-medium">מסלול</th>
                <th className="px-4 py-3 font-medium">המראה</th>
                <th className="px-4 py-3 font-medium">צ׳ק-אין</th>
                <th className="px-4 py-3 font-medium">ביטוח</th>
                <th className="px-4 py-3 font-medium">כרטיס</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(flights48.data ?? []).map((f: any) => {
                const c = f.customers;
                const wa = whatsappLink(c?.phone, WhatsAppTemplates.flightUpdate(c?.name ?? "", f.flight_number ?? ""));
                const hrs = hoursUntil(f.departure_datetime);
                return (
                  <tr key={f.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link to="/customers/$id" params={{ id: c?.id }} className="text-primary hover:underline font-medium">
                        {c?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{c?.phone ?? "—"}</td>
                    <td className="px-4 py-3">{c?.destination ?? f.arrival_airport ?? "—"}</td>
                    <td className="px-4 py-3">{f.airline ?? "—"} {f.flight_number ?? ""}</td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                      {f.departure_airport ?? "?"} → {f.arrival_airport ?? "?"}
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatDateTime(f.departure_datetime)}</div>
                      {hrs !== null && hrs >= 0 && <div className="text-xs text-warning">בעוד {Math.round(hrs)} שעות</div>}
                    </td>
                    <td className="px-4 py-3"><StatusDot status={f.check_in_status} /></td>
                    <td className="px-4 py-3"><StatusDot status={f.insurance_status} /></td>
                    <td className="px-4 py-3"><StatusDot status={f.ticket_status} /></td>
                    <td className="px-4 py-3">
                      {wa && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={wa} target="_blank" rel="noreferrer" className="gap-1">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(flights48.data ?? []).length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">אין טיסות ב-48 השעות הקרובות</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, accent, hint, onClick, active }: { icon: React.ReactNode; label: string; value: string; accent: "primary" | "warning" | "destructive" | "accent"; hint?: string; onClick?: () => void; active?: boolean }) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    accent: "text-accent bg-accent/10",
  };
  const clickable = !!onClick;
  return (
    <Card className={`p-5 ${clickable ? "cursor-pointer transition-all hover:shadow-elegant hover:-translate-y-0.5" : ""} ${active ? "ring-2 ring-primary/50" : ""}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colors[accent]}`}>{icon}</div>
        {clickable && <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${active ? "rotate-180" : ""}`} />}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1" title={hint}>{label}</div>
      {hint && <div className="text-[10px] text-muted-foreground/70 mt-1 leading-tight">{hint}</div>}
    </Card>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    done: { color: "bg-success", label: "בוצע" },
    pending: { color: "bg-warning", label: "ממתין" },
    not_required: { color: "bg-muted-foreground", label: "לא נדרש" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${s.color}`} />
      <span className="text-muted-foreground">{s.label}</span>
    </span>
  );
}

function LeadsHighlightCard({ count, active, onClick }: { count: number; active: boolean; onClick: () => void }) {
  const has = count > 0;
  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-2xl border-0 ${
        has
          ? "bg-gradient-to-l from-red-900 via-red-800 to-red-950 text-white shadow-[0_15px_50px_-12px_rgba(185,28,28,0.55)]"
          : "bg-gradient-to-l from-red-900/80 via-red-800/80 to-red-950/80 text-white"
      } ${active ? "ring-4 ring-red-500/60" : "ring-2 ring-red-800/30"}`}
    >
      {has && (
        <span className="absolute inset-0 pointer-events-none animate-pulse bg-gradient-to-l from-white/0 via-white/10 to-white/0" />
      )}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
            <Sprout className={`h-7 w-7 ${has ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium opacity-90">לידים חדשים מהאתר</div>
              {has && (
                <span className="text-[10px] font-bold bg-white text-red-700 px-2 py-0.5 rounded-full animate-bounce">
                  חדש!
                </span>
              )}
            </div>
            <div className="text-4xl font-extrabold leading-tight mt-1">{count}</div>
            <div className="text-xs opacity-80 mt-1">
              {has ? "לחץ לצפייה וטיפול בלידים" : "אין כרגע לידים חדשים"}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 opacity-80 transition-transform ${active ? "rotate-180" : ""}`} />
      </div>
    </Card>
  );
}