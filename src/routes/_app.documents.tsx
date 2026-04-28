import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_app/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const q = useQuery({
    queryKey: ["all-documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents").select("*, customers(id, name)").order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">מסמכים</h1>
      <Card className="p-4 space-y-2">
        {(q.data ?? []).map((d: any) => (
          <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between border border-border rounded p-3 hover:bg-muted/30">
            <div>
              <div className="font-medium">{d.file_name}</div>
              {d.customers && <Link to="/customers/$id" params={{ id: d.customers.id }} className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{d.customers.name}</Link>}
              <div className="text-xs text-muted-foreground">{formatDateTime(d.uploaded_at)}</div>
            </div>
            <Badge variant="secondary">{d.category}</Badge>
          </a>
        ))}
        {(q.data ?? []).length === 0 && <div className="text-muted-foreground text-center py-8">אין מסמכים</div>}
      </Card>
    </div>
  );
}