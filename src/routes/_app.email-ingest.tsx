import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, RefreshCw, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/email-ingest")({
  component: EmailIngestPage,
});

type LogRow = {
  id: string;
  gmail_message_id: string;
  subject: string | null;
  from_email: string | null;
  received_at: string | null;
  status: string;
  matched_customer_id: string | null;
  matched_flight_ids: string[] | null;
  passenger_names: string[] | null;
  pnr: string | null;
  error: string | null;
  created_at: string;
};

type CustomerLite = { id: string; name: string };

const STATUS: Record<string, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  matched:   { label: "שויך",        color: "bg-success/15 text-success border-success/30",       Icon: CheckCircle2 },
  unmatched: { label: "ללא התאמה",   color: "bg-amber-500/15 text-amber-600 border-amber-500/30", Icon: HelpCircle },
  failed:    { label: "נכשל",        color: "bg-destructive/15 text-destructive border-destructive/30", Icon: AlertCircle },
  skipped:   { label: "לא רלוונטי",  color: "bg-muted text-muted-foreground border-border",       Icon: AlertCircle },
  pending:   { label: "ממתין",       color: "bg-muted text-muted-foreground border-border",       Icon: Loader2 },
};

function EmailIngestPage() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  const { data: logs } = useQuery({
    queryKey: ["email_ingest_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_ingest_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as LogRow[];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return (data ?? []) as CustomerLite[];
    },
  });

  const { data: state } = useQuery({
    queryKey: ["email_ingest_state"],
    queryFn: async () => {
      const { data } = await supabase.from("email_ingest_state").select("last_synced_at").maybeSingle();
      return data;
    },
  });

  const runSync = async (fullScan: boolean) => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("gmail-ingest", {
        body: { full_scan: fullScan, max_messages: fullScan ? 50 : 20 },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const s = (data as { summary: Record<string, number> }).summary;
      toast.success(`נסרקו ${s.scanned} מיילים · שויכו ${s.matched} · ללא התאמה ${s.unmatched}${s.failed ? ` · ${s.failed} כשלונות` : ""}`);
      qc.invalidateQueries({ queryKey: ["email_ingest_log"] });
      qc.invalidateQueries({ queryKey: ["email_ingest_state"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאת סנכרון");
    } finally {
      setSyncing(false);
    }
  };

  const assignManually = async (log: LogRow, customerId: string) => {
    if (!log.passenger_names) return;
    const extracted = (log as unknown as { extracted_data: { flights?: Array<Record<string, unknown>> } }).extracted_data;
    const flights = extracted?.flights ?? [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rows = flights.map((f) => ({
      customer_id: customerId,
      owner_id: user.id,
      airline: f.airline as string | null,
      flight_number: f.flight_number as string | null,
      departure_airport: f.departure_airport as string | null,
      arrival_airport: f.arrival_airport as string | null,
      departure_datetime: f.departure_datetime as string | null,
      arrival_datetime: f.arrival_datetime as string | null,
      pnr: log.pnr,
      source: "gmail",
      source_email_id: log.gmail_message_id,
    }));
    const { data: inserted, error: insErr } = await supabase.from("flights").insert(rows).select("id");
    if (insErr) { toast.error("שגיאה: " + insErr.message); return; }
    const { error: updErr } = await supabase.from("email_ingest_log").update({
      status: "matched",
      matched_customer_id: customerId,
      matched_flight_ids: (inserted ?? []).map((r) => r.id),
      error: null,
    }).eq("id", log.id);
    if (updErr) { toast.error("שגיאה בעדכון: " + updErr.message); return; }
    toast.success("שויך בהצלחה");
    qc.invalidateQueries({ queryKey: ["email_ingest_log"] });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            סריקת מיילים אוטומטית
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            המערכת סורקת את תיבת ה-Gmail המחוברת, מזהה כרטיסי טיסה, ומשייכת אותם אוטומטית ללקוחות.
            {state?.last_synced_at && (
              <> · סנכרון אחרון: {new Date(state.last_synced_at).toLocaleString("he-IL")}</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => runSync(false)} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <RefreshCw className="w-4 h-4 ml-2" />}
            סנכרן עכשיו
          </Button>
          <Button onClick={() => runSync(true)} disabled={syncing} className="gradient-primary text-primary-foreground">
            סריקה מלאה (30 יום)
          </Button>
        </div>
      </div>

      {!logs?.length ? (
        <Card className="p-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">עדיין לא נסרק שום מייל</h3>
          <p className="text-muted-foreground text-sm">לחץ על "סריקה מלאה" כדי לסרוק את 30 הימים האחרונים בתיבה.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const s = STATUS[log.status] ?? STATUS.pending;
            const Icon = s.Icon;
            return (
              <Card key={log.id} className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <Badge variant="outline" className={`${s.color} gap-1.5`}>
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </Badge>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-medium truncate">{log.subject || "(ללא נושא)"}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      <span>{log.from_email}</span>
                      {log.received_at && <span>· {new Date(log.received_at).toLocaleString("he-IL")}</span>}
                      {log.pnr && <span>· PNR: <code className="font-mono">{log.pnr}</code></span>}
                      {!!log.passenger_names?.length && <span>· נוסעים: {log.passenger_names.join(", ")}</span>}
                      {!!log.matched_flight_ids?.length && <span>· {log.matched_flight_ids.length} טיסות נוספו</span>}
                    </div>
                    {log.error && <div className="text-xs text-destructive mt-1">{log.error}</div>}
                  </div>

                  {log.status === "matched" && log.matched_customer_id && (
                    <Link to="/customers/$id" params={{ id: log.matched_customer_id }}>
                      <Button size="sm" variant="outline">פתח לקוח</Button>
                    </Link>
                  )}

                  {log.status === "unmatched" && (
                    <div className="w-full sm:w-auto">
                      <Select onValueChange={(v) => assignManually(log, v)}>
                        <SelectTrigger className="w-full sm:w-56">
                          <SelectValue placeholder="בחר לקוח לשיוך ידני" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}