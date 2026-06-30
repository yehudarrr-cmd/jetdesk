import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, LayoutGrid, Table as TableIcon, PlaneTakeoff, Calendar, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { displayNameHebrew } from "@/lib/he-translit";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const customers = useQuery({
    queryKey: ["customers", q],
    queryFn: async () => {
      let query = supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (q) {
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,destination.ilike.%${q}%,pnr.ilike.%${q}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">לקוחות</h1>
          <p className="text-muted-foreground mt-1">{customers.data?.length ?? 0} לקוחות במערכת</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-border bg-card/40 p-1">
            <Button
              size="sm"
              variant={view === "cards" ? "default" : "ghost"}
              onClick={() => setView("cards")}
              className="gap-1.5 h-8"
            >
              <LayoutGrid className="h-4 w-4" /> כרטיסים
            </Button>
            <Button
              size="sm"
              variant={view === "table" ? "default" : "ghost"}
              onClick={() => setView("table")}
              className="gap-1.5 h-8"
            >
              <TableIcon className="h-4 w-4" /> טבלה
            </Button>
          </div>
          <NewCustomerDialog />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי שם, טלפון, יעד או PNR..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pr-10"
        />
      </div>

      {view === "cards" ? (
        <>
          {(customers.data ?? []).length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">אין לקוחות עדיין. צור את הראשון!</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(customers.data ?? []).map((c) => {
                const balance = Number(c.total_price ?? 0) - Number(c.amount_paid ?? 0);
                const status = c.status ?? "active";
                const statusClass =
                  status === "active"
                    ? "bg-success/15 text-success border-success/30"
                    : status === "closed"
                    ? "bg-muted/40 text-muted-foreground border-border"
                    : "bg-primary/15 text-primary border-primary/30";
                return (
                  <Link
                    key={c.id}
                    to="/customers/$id"
                    params={{ id: c.id }}
                    className="group block"
                  >
                    <Card className="h-full p-5 bg-gradient-to-br from-card to-card/60 border-border/60 transition-all duration-300 hover:scale-[1.02] hover:border-primary/60 hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)] cursor-pointer flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 grid place-items-center text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-foreground break-words leading-tight group-hover:text-primary transition-colors">
                            {displayNameHebrew(c.name)}
                          </div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${statusClass}`}>{status}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-foreground/90">
                          <PlaneTakeoff className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-medium truncate">{c.destination ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {c.travel_start_date ? `${formatDate(c.travel_start_date)} – ${formatDate(c.travel_end_date)}` : "ללא תאריך"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 border-t border-border/60 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">סכום</div>
                          <div className="text-sm font-semibold text-foreground">{formatCurrency(c.total_price)}</div>
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">יתרה</div>
                          <div className={`text-base font-bold ${balance > 0 ? "text-primary" : "text-success/80"}`}>
                            {formatCurrency(balance)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-right text-muted-foreground">
                <th className="px-4 py-3 font-medium">שם</th>
                <th className="px-4 py-3 font-medium">טלפון</th>
                <th className="px-4 py-3 font-medium">יעד</th>
                <th className="px-4 py-3 font-medium">תאריכים</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
                <th className="px-4 py-3 font-medium">סכום</th>
                <th className="px-4 py-3 font-medium">יתרה</th>
              </tr>
            </thead>
            <tbody>
              {(customers.data ?? []).map((c) => {
                const balance = Number(c.total_price ?? 0) - Number(c.amount_paid ?? 0);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link to="/customers/$id" params={{ id: c.id }} className="text-primary font-medium hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">{c.destination ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.travel_start_date ? `${formatDate(c.travel_start_date)} – ${formatDate(c.travel_end_date)}` : "—"}
                    </td>
                    <td className="px-4 py-3"><Badge variant="secondary">{c.status ?? "active"}</Badge></td>
                    <td className="px-4 py-3">{formatCurrency(c.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={balance > 0 ? "text-warning font-medium" : "text-success"}>
                        {formatCurrency(balance)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(customers.data ?? []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">אין לקוחות עדיין. צור את הראשון!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}

function NewCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("customers")
      .insert({ name, phone: phone || null, destination: destination || null })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success("לקוח נוצר");
    qc.invalidateQueries({ queryKey: ["customers"] });
    setOpen(false);
    navigate({ to: "/customers/$id", params: { id: data.id } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> לקוח חדש</Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>לקוח חדש</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label>שם מלא *</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>טלפון</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" /></div>
          <div><Label>יעד</Label><Input value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
          <DialogFooter><Button type="submit">שמירה</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}