import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const tasks = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*, customers(id, name)").order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">משימות</h1>
      <Card className="p-4 space-y-2">
        {(tasks.data ?? []).map((t: any) => (
          <div key={t.id} className="flex items-center justify-between border border-border rounded p-3">
            <div>
              <div className={t.status === "done" ? "line-through text-muted-foreground" : "font-medium"}>{t.title}</div>
              {t.customers && <Link to="/customers/$id" params={{ id: t.customers.id }} className="text-xs text-primary hover:underline">{t.customers.name}</Link>}
              {t.due_date && <div className="text-xs text-muted-foreground">{formatDate(t.due_date)}</div>}
            </div>
            <div className="flex gap-2"><Badge variant="outline">{t.priority}</Badge><Badge variant="secondary">{t.status}</Badge></div>
          </div>
        ))}
        {(tasks.data ?? []).length === 0 && <div className="text-muted-foreground text-center py-8">אין משימות</div>}
      </Card>
    </div>
  );
}