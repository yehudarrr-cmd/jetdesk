import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const q = useQuery({
    queryKey: ["all-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, customers(id, name)").order("payment_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const total = (q.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">תשלומים</h1>
        <div className="text-muted-foreground">סה״כ: <span className="font-bold text-foreground">{formatCurrency(total)}</span></div>
      </div>
      <Card className="p-4 space-y-2">
        {(q.data ?? []).map((p: any) => (
          <div key={p.id} className="flex items-center justify-between border border-border rounded p-3">
            <div>
              {p.customers && <Link to="/customers/$id" params={{ id: p.customers.id }} className="font-medium text-primary hover:underline">{p.customers.name}</Link>}
              <div className="text-xs text-muted-foreground">{formatDate(p.payment_date)} • {p.method}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{p.payment_type}</Badge>
              <span className="font-bold">{formatCurrency(p.amount)}</span>
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && <div className="text-muted-foreground text-center py-8">אין תשלומים</div>}
      </Card>
    </div>
  );
}