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
import { Plus, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers/")({
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
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
        <NewCustomerDialog />
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