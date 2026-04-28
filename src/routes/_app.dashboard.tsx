import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, hoursUntil } from "@/lib/format";
import { whatsappLink, WhatsAppTemplates } from "@/lib/whatsapp";
import { Plane, Wallet, AlertTriangle, CheckCircle2, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const stats = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [customers, payments, tasks, flights] = await Promise.all([
        supabase.from("customers").select("id,total_price,amount_paid"),
        supabase.from("payments").select("amount"),
        supabase.from("tasks").select("id,priority,status").in("status", ["open", "in_progress"]),
        supabase.from("flights").select("id,check_in_status,insurance_status,ticket_status,departure_datetime").gte("departure_datetime", new Date().toISOString()),
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">לוח בקרה</h1>
        <p className="text-muted-foreground mt-1">תמונת מצב יומית של הסוכנות</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Wallet className="h-5 w-5" />} label="סך הכנסות" value={formatCurrency(stats.data?.totalRevenue ?? 0)} accent="primary" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="יתרות חוב" value={formatCurrency(stats.data?.balances ?? 0)} accent="warning" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="משימות דחופות" value={String(stats.data?.urgentTasks ?? 0)} accent="destructive" />
        <StatCard icon={<Plane className="h-5 w-5" />} label="טיסות עם פערים" value={String(stats.data?.missingDocs ?? 0)} accent="accent" />
      </div>

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

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: "primary" | "warning" | "destructive" | "accent" }) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    accent: "text-accent bg-accent/10",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colors[accent]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
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