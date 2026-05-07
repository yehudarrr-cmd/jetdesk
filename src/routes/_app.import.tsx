import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseReservationsFile, type ParsedReservation } from "@/lib/import-reservations";

export const Route = createFileRoute("/_app/import")({
  component: ImportPage,
});

type Row = ParsedReservation & { selected: boolean; status?: "ok" | "skip" | "error"; message?: string };

function ImportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const handleFile = async (file: File) => {
    setParsing(true);
    setFileName(file.name);
    try {
      const parsed = await parseReservationsFile(file);
      setRows(parsed.map((p) => ({ ...p, selected: true })));
      toast.success(`זוהו ${parsed.length} רשומות`);
    } catch (e) {
      toast.error("שגיאה בקריאת הקובץ: " + (e as Error).message);
    } finally {
      setParsing(false);
    }
  };

  const update = (i: number, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const importRows = async () => {
    setImporting(true);
    let ok = 0, fail = 0, skipped = 0;
    const next = [...rows];

    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { toast.error("יש להתחבר"); setImporting(false); return; }

    for (let i = 0; i < next.length; i++) {
      const r = next[i];
      if (!r.selected) continue;

      // Dedup by PNR
      if (r.sabrePnr) {
        const { data: existing } = await supabase.from("customers").select("id").eq("pnr", r.sabrePnr).maybeSingle();
        if (existing) {
          next[i] = { ...r, status: "skip", message: "PNR כבר קיים" };
          skipped++;
          continue;
        }
      }

      const displayName = r.nameHe ? `${r.nameHe} / ${r.nameEn}` : r.nameEn;
      const notesParts = [
        r.type && `סוג: ${r.type}`,
        r.suppliers.length && `ספק: ${r.suppliers.join(" / ")}`,
        r.supplierPnrs.length && `PNR ספק: ${r.supplierPnrs.join(" / ")}`,
        r.agency && `סוכנות: ${r.agency}`,
        r.agent && `סוכן: ${r.agent}`,
        r.status && `סטטוס: ${r.status}`,
        r.pax && `נוסעים: ${r.pax}`,
        r.remarks && `הערות: ${r.remarks}`,
      ].filter(Boolean).join("\n");

      const { data: cust, error: custErr } = await supabase
        .from("customers")
        .insert({
          owner_id: ownerId,
          name: displayName,
          destination: r.destHe || r.destCode || null,
          travel_start_date: r.departDate,
          total_price: r.fare ?? 0,
          pnr: r.sabrePnr || null,
          notes: notesParts || null,
        })
        .select()
        .single();

      if (custErr || !cust) {
        next[i] = { ...r, status: "error", message: custErr?.message ?? "שגיאה" };
        fail++;
        continue;
      }

      const departIso = r.departDate ? `${r.departDate}T00:00:00` : null;
      await supabase.from("flights").insert({
        owner_id: ownerId,
        customer_id: cust.id,
        pnr: r.sabrePnr || null,
        airline: r.suppliers[0] || null,
        arrival_airport: r.destCode || null,
        departure_airport: "TLV",
        departure_datetime: departIso,
        notes: r.supplierPnrs.length ? `PNR ספק: ${r.supplierPnrs.join(" / ")}` : null,
      });

      await supabase.from("timeline_events").insert({
        owner_id: ownerId,
        customer_id: cust.id,
        type: "import",
        title: "יובא מקובץ הזמנות",
        description: fileName,
      });

      next[i] = { ...r, status: "ok" };
      ok++;
    }

    setRows(next);
    setImporting(false);
    qc.invalidateQueries();
    toast.success(`הסתיים: ${ok} נוצרו, ${skipped} דולגו, ${fail} נכשלו`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ייבוא הזמנות</h1>
        <p className="text-muted-foreground mt-1">העלה קובץ Excel/CSV כדי ליצור כרטיסיות לקוח אוטומטית</p>
      </div>

      <Card className="p-6">
        <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:bg-muted/30 transition">
          {parsing ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
          <div className="text-center">
            <div className="font-medium">{fileName || "בחר קובץ Excel / CSV"}</div>
            <div className="text-xs text-muted-foreground mt-1">.xlsx, .xls, .csv</div>
          </div>
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </Card>

      {rows.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span className="font-medium">{rows.length} רשומות זוהו</span>
              <Badge variant="secondary">{rows.filter((r) => r.selected).length} נבחרו</Badge>
            </div>
            <Button onClick={importRows} disabled={importing || !rows.some((r) => r.selected)}>
              {importing && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              צור לקוחות
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-right text-muted-foreground">
                  <th className="px-3 py-2 w-10"></th>
                  <th className="px-3 py-2 font-medium">שם (עברית)</th>
                  <th className="px-3 py-2 font-medium">שם (אנגלית)</th>
                  <th className="px-3 py-2 font-medium">יעד</th>
                  <th className="px-3 py-2 font-medium">תאריך</th>
                  <th className="px-3 py-2 font-medium">PNR</th>
                  <th className="px-3 py-2 font-medium">ספק</th>
                  <th className="px-3 py-2 font-medium">מחיר</th>
                  <th className="px-3 py-2 font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <Checkbox checked={r.selected} onCheckedChange={(v) => update(i, { selected: !!v })} />
                    </td>
                    <td className="px-3 py-2">
                      <Input value={r.nameHe} onChange={(e) => update(i, { nameHe: e.target.value })} className="h-8" />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground" dir="ltr">{r.nameEn}</td>
                    <td className="px-3 py-2">
                      {r.destHe} <span className="text-xs text-muted-foreground">({r.destCode})</span>
                    </td>
                    <td className="px-3 py-2 text-xs">{r.departDate ?? "—"}</td>
                    <td className="px-3 py-2 text-xs" dir="ltr">{r.sabrePnr}</td>
                    <td className="px-3 py-2 text-xs">{r.suppliers.join(" / ")}</td>
                    <td className="px-3 py-2">{r.fare ?? "—"}</td>
                    <td className="px-3 py-2">
                      {r.status === "ok" && <Badge className="bg-green-600">נוצר</Badge>}
                      {r.status === "skip" && <Badge variant="secondary">דולג</Badge>}
                      {r.status === "error" && <Badge variant="destructive" title={r.message}>שגיאה</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.some((r) => r.status === "ok") && (
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => navigate({ to: "/customers" })}>
                לצפייה בלקוחות
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}