import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sprout, Phone, Mail, MapPin, Users, Calendar, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads")({
  component: LeadsPage,
});

type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  destination: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  number_of_travelers: number | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "חדש", color: "bg-primary/15 text-primary border-primary/30" },
  contacted: { label: "נוצר קשר", color: "bg-accent/15 text-accent border-accent/30" },
  converted: { label: "הומר ללקוח", color: "bg-success/15 text-success border-success/30" },
  closed: { label: "סגור", color: "bg-muted text-muted-foreground border-border" },
};

function LeadsPage() {
  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["landing_leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("landing_leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("שגיאה בעדכון סטטוס");
      return;
    }
    toast.success("הסטטוס עודכן");
    refetch();
  };

  const convertToCustomer = async (lead: Lead) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("יש להתחבר כדי להמיר ליד ללקוח");
      return;
    }

    const { error: insertError } = await supabase.from("customers").insert({
      owner_id: user.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      destination: lead.destination,
      travel_start_date: lead.travel_start_date,
      travel_end_date: lead.travel_end_date,
      notes: lead.message,
      status: "active",
    });

    if (insertError) {
      toast.error("שגיאה בהמרה ללקוח");
      return;
    }

    await supabase.from("landing_leads").update({ status: "converted" }).eq("id", lead.id);
    toast.success("הליד הומר ללקוח בהצלחה!");
    refetch();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            לידים מדף הנחיתה
          </h1>
          <p className="text-muted-foreground mt-2">
            פניות שהתקבלו דרך טופס יצירת הקשר באתר
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            לדף הנחיתה
          </Button>
        </a>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">טוען...</div>
      ) : !leads?.length ? (
        <Card className="p-12 text-center">
          <Sprout className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">אין לידים עדיין</h3>
          <p className="text-muted-foreground text-sm">
            כשמישהו ימלא את הטופס בדף הנחיתה, הוא יופיע כאן בזמן אמת
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => {
            const statusInfo = STATUS_LABELS[lead.status || "new"] || STATUS_LABELS.new;
            return (
              <Card key={lead.id} className="p-5 hover:shadow-elegant transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold">{lead.name}</h3>
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleString("he-IL")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:text-primary">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:text-primary truncate">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {lead.email}
                        </a>
                      )}
                      {lead.destination && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {lead.destination}
                        </div>
                      )}
                      {lead.number_of_travelers && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {lead.number_of_travelers} נוסעים
                        </div>
                      )}
                      {(lead.travel_start_date || lead.travel_end_date) && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {lead.travel_start_date} {lead.travel_end_date && `- ${lead.travel_end_date}`}
                        </div>
                      )}
                    </div>

                    {lead.message && (
                      <div className="flex gap-2 text-sm bg-muted/30 rounded-md p-3">
                        <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-foreground/80 whitespace-pre-wrap">{lead.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="w-full gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          ווטסאפ
                        </Button>
                      </a>
                    )}
                    {lead.status !== "converted" && (
                      <Button
                        size="sm"
                        onClick={() => convertToCustomer(lead)}
                        className="gradient-primary text-primary-foreground"
                      >
                        המר ללקוח
                      </Button>
                    )}
                    {lead.status === "new" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateStatus(lead.id, "contacted")}
                      >
                        סמן כ"נוצר קשר"
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
