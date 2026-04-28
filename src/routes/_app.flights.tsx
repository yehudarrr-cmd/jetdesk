import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_app/flights")({
  component: FlightsPage,
});

function FlightsPage() {
  const flights = useQuery({
    queryKey: ["all-flights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flights")
        .select("*, customers(id, name, phone)")
        .order("departure_datetime", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">טיסות</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-right text-muted-foreground">
            <tr>
              <th className="px-4 py-3">לקוח</th><th className="px-4 py-3">חברה / טיסה</th>
              <th className="px-4 py-3">מסלול</th><th className="px-4 py-3">המראה</th>
            </tr>
          </thead>
          <tbody>
            {(flights.data ?? []).map((f: any) => (
              <tr key={f.id} className="border-t border-border hover:bg-muted/20">
                <td className="px-4 py-3">
                  <Link to="/customers/$id" params={{ id: f.customers?.id }} className="text-primary hover:underline">{f.customers?.name}</Link>
                </td>
                <td className="px-4 py-3">{f.airline} <span dir="ltr">{f.flight_number}</span></td>
                <td className="px-4 py-3" dir="ltr">{f.departure_airport} → {f.arrival_airport}</td>
                <td className="px-4 py-3">{formatDateTime(f.departure_datetime)}</td>
              </tr>
            ))}
            {(flights.data ?? []).length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">אין טיסות</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}