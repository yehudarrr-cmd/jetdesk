import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, RefreshCw, Star, Eye, EyeOff, Save, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { generatedDestinationImageUrl, safeDealImageUrl } from "@/lib/deal-image";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];

export const Route = createFileRoute("/_app/manage-deals")({
  component: AdminDealsPage,
});

const EMPTY: DealInsert = {
  destination: "",
  country: "",
  title: "",
  hotel: "",
  airline: "",
  price_from: null,
  currency: "ILS",
  start_date: null,
  end_date: null,
  nights: null,
  image_url: "",
  external_url: "",
  quote_url: "",
  featured: false,
  active: true,
  sort_order: 0,
};

function AdminDealsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<DealInsert>(EMPTY);
  const [scrapeUrl, setScrapeUrl] = useState("");

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals").select("*")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const scrapeMut = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/public/parse-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "פענוח נכשל");
      return json as { deal: Partial<DealInsert>; quote_url: string };
    },
    onSuccess: ({ deal, quote_url }) => {
      setForm((prev) => ({
        ...prev,
        ...deal,
        quote_url,
        external_url: prev.external_url || quote_url,
        gallery: (deal as any).gallery ?? prev.gallery,
      }));
      toast.success("הנתונים נשאבו בהצלחה — בדקו ושמרו");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async (payload: DealInsert) => {
      const clean: DealInsert = { ...payload };
      // upsert on quote_url when present, else insert
      if (clean.quote_url) {
        const { error } = await supabase.from("deals")
          .upsert(clean, { onConflict: "quote_url" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("deals").insert(clean);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("הדיל נשמר");
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["public-deals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("נמחק");
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["public-deals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Deal> }) => {
      const { error } = await supabase.from("deals").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["public-deals"] });
    },
  });

  const refreshAllMut = useMutation({
    mutationFn: async () => {
      const withUrls = deals.filter((d) => d.quote_url);
      let ok = 0, fail = 0;
      for (const d of withUrls) {
        try {
          const res = await fetch("/api/public/parse-deal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: d.quote_url }),
          });
          const j = await res.json();
          if (!res.ok) { fail++; continue; }
          const parsed = j.deal as Partial<DealInsert>;
          const patch: Partial<Deal> = {
            destination: parsed.destination ?? d.destination,
            country: parsed.country ?? d.country,
            title: parsed.title ?? d.title,
            hotel: parsed.hotel ?? d.hotel,
            airline: parsed.airline ?? d.airline,
            price_from: parsed.price_from ?? d.price_from,
            start_date: parsed.start_date ?? d.start_date,
            end_date: parsed.end_date ?? d.end_date,
            nights: parsed.nights ?? d.nights,
            image_url: parsed.image_url ?? d.image_url,
            last_synced_at: new Date().toISOString(),
          };
          await supabase.from("deals").update(patch).eq("id", d.id);
          ok++;
        } catch { fail++; }
      }
      return { ok, fail };
    },
    onSuccess: ({ ok, fail }) => {
      toast.success(`עודכנו ${ok} דילים${fail ? `, נכשלו ${fail}` : ""}`);
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["public-deals"] });
    },
  });

  const seedUrls = useMemo(() => [
    "https://quotes.goldtus.com/q/163e44870a0b",
    "https://quotes.goldtus.com/q/95fdd5d90ade",
    "https://quotes.goldtus.com/q/4bfa9e41401f",
    "https://quotes.goldtus.com/q/6a9bc983aff7",
    "https://quotes.goldtus.com/q/82c039f45ba5",
    "https://quotes.goldtus.com/q/6c7aa5a0adfe",
    "https://quotes.goldtus.com/q/aa7c2fba80e4",
    "https://quotes.goldtus.com/q/aedaa7d797a0",
    "https://quotes.goldtus.com/q/62186487ba2d",
    "https://quotes.goldtus.com/q/0c17920f67d4",
    "https://quotes.goldtus.com/q/eb0c499d9c5c",
    "https://quotes.goldtus.com/q/9fbf235c4f68",
    "https://quotes.goldtus.com/q/220a1ffb0799",
  ], []);

  const bulkImportMut = useMutation({
    mutationFn: async () => {
      let ok = 0, fail = 0;
      for (const url of seedUrls) {
        try {
          const res = await fetch("/api/public/parse-deal", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const j = await res.json();
          if (!res.ok) { fail++; continue; }
          const parsed = j.deal as Partial<DealInsert>;
          const payload: DealInsert = {
            ...EMPTY,
            ...parsed,
            destination: parsed.destination || "יעד",
            quote_url: j.quote_url,
            external_url: j.quote_url,
            last_synced_at: new Date().toISOString(),
          };
          const { error } = await supabase.from("deals")
            .upsert(payload, { onConflict: "quote_url" });
          if (error) fail++; else ok++;
        } catch { fail++; }
      }
      return { ok, fail };
    },
    onSuccess: ({ ok, fail }) => {
      toast.success(`ייבוא ראשוני הושלם: ${ok} הצליחו, ${fail} נכשלו`);
      qc.invalidateQueries({ queryKey: ["admin-deals"] });
      qc.invalidateQueries({ queryKey: ["public-deals"] });
    },
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ניהול דילים</h1>
          <p className="text-sm text-muted-foreground">הוסיפו דיל דרך קישור להצעה, או ידנית. כל שינוי מתעדכן מיד בעמוד /deals הציבורי.</p>
          <p className="text-xs text-muted-foreground mt-1">🔄 סנכרון אוטומטי מ-quotes.goldtus.com פועל כל 3 שעות. אפשר גם להריץ ידנית עכשיו.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshAllMut.mutate()} disabled={refreshAllMut.isPending}>
            <RefreshCw className={`w-4 h-4 ml-1 ${refreshAllMut.isPending ? "animate-spin" : ""}`} /> רענן את כל הדילים
          </Button>
          <Button variant="outline" size="sm" onClick={() => bulkImportMut.mutate()} disabled={bulkImportMut.isPending}>
            <Download className="w-4 h-4 ml-1" /> ייבוא ראשוני (13)
          </Button>
        </div>
      </div>

      {/* Scrape + form */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="https://quotes.goldtus.com/q/..."
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            dir="ltr"
          />
          <Button
            onClick={() => scrapeUrl && scrapeMut.mutate(scrapeUrl)}
            disabled={scrapeMut.isPending || !scrapeUrl}
          >
            {scrapeMut.isPending ? "שואב…" : "משוך מההצעה"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="יעד *"><Input value={form.destination ?? ""} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
          <Field label="מדינה"><Input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="כותרת"><Input value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="מלון"><Input value={form.hotel ?? ""} onChange={(e) => setForm({ ...form, hotel: e.target.value })} /></Field>
          <Field label="חברת תעופה"><Input value={form.airline ?? ""} onChange={(e) => setForm({ ...form, airline: e.target.value })} /></Field>
          <Field label="מחיר החל מ- (₪)"><Input type="number" value={form.price_from ?? ""} onChange={(e) => setForm({ ...form, price_from: e.target.value ? parseInt(e.target.value, 10) : null })} /></Field>
          <Field label="תאריך יציאה"><Input type="date" value={form.start_date ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value || null })} /></Field>
          <Field label="תאריך חזרה"><Input type="date" value={form.end_date ?? ""} onChange={(e) => setForm({ ...form, end_date: e.target.value || null })} /></Field>
          <Field label="מספר לילות"><Input type="number" value={form.nights ?? ""} onChange={(e) => setForm({ ...form, nights: e.target.value ? parseInt(e.target.value, 10) : null })} /></Field>
          <Field label="סדר תצוגה (גבוה = ראשון)"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value || "0", 10) })} /></Field>
          <Field label="URL תמונה"><Input dir="ltr" value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
          <Field label="URL להזמנה (חיצוני)"><Input dir="ltr" value={form.external_url ?? ""} onChange={(e) => setForm({ ...form, external_url: e.target.value })} /></Field>
          <Field label="URL הצעה (quotes.goldtus.com)"><Input dir="ltr" value={form.quote_url ?? ""} onChange={(e) => setForm({ ...form, quote_url: e.target.value })} /></Field>
          <Field label="תגיות (מופרדות בפסיק — לעתיד: last-minute, holiday)">
            <Input value={(form.tags ?? []).join(",")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> מומלץ (מוצג בבולט)</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> פעיל (מוצג באתר)</label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setForm(EMPTY)}>נקה</Button>
          <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending || !form.destination}>
            <Save className="w-4 h-4 ml-1" /> שמור דיל
          </Button>
        </div>
      </Card>

      {/* List */}
      <Card className="p-5">
        <h2 className="text-lg font-bold mb-4">כל הדילים ({deals.length})</h2>
        {isLoading ? <div className="text-sm text-muted-foreground">טוען…</div> : (
          <div className="grid gap-3">
            {deals.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border">
                <AdminDealImage deal={d} />
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold">{d.destination}{d.country ? ` · ${d.country}` : ""}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.title || d.hotel || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.price_from ? `₪${d.price_from.toLocaleString("he-IL")}` : "—"}
                    {d.nights ? ` · ${d.nights} לילות` : ""}
                    {d.airline ? ` · ${d.airline}` : ""}
                  </div>
                </div>
                <Button variant="ghost" size="icon" title={d.featured ? "בטל מומלץ" : "סמן כמומלץ"}
                  onClick={() => toggleMut.mutate({ id: d.id, patch: { featured: !d.featured } })}>
                  <Star className={`w-4 h-4 ${d.featured ? "fill-yellow-400 text-yellow-500" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" title={d.active ? "השבת" : "הפעל"}
                  onClick={() => toggleMut.mutate({ id: d.id, patch: { active: !d.active } })}>
                  {d.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" title="ערוך"
                  onClick={() => setForm({
                    ...EMPTY, ...d,
                    gallery: (d.gallery as any) ?? [],
                  } as DealInsert)}>
                  <Plus className="w-4 h-4 rotate-45" />
                </Button>
                <Button variant="ghost" size="icon" title="מחק"
                  onClick={() => confirm(`למחוק את הדיל ל${d.destination}?`) && delMut.mutate(d.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            {deals.length === 0 && (
              <div className="text-sm text-muted-foreground">אין דילים עדיין. לחצו "ייבוא ראשוני" או הוסיפו ידנית.</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function AdminDealImage({ deal }: { deal: Deal }) {
  const generated = generatedDestinationImageUrl(deal.destination, deal.country);
  return (
    <img
      src={safeDealImageUrl(deal.image_url, deal.destination, deal.country)}
      data-generated-src={generated}
      alt=""
      className="w-20 h-14 rounded object-cover bg-muted"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        const img = e.currentTarget;
        const fallback = img.dataset.generatedSrc;
        if (fallback && img.src !== new URL(fallback, window.location.origin).href) {
          img.src = fallback;
        } else {
          img.style.visibility = "hidden";
        }
      }}
    />
  );
}