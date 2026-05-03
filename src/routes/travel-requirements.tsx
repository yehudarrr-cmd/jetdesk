import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import TravelSearchForm from "@/components/TravelSearchForm";
import RequirementsResults from "@/components/RequirementsResults";
import { countries, type TravelRequirements } from "@/data/travelRequirements";

export const Route = createFileRoute("/travel-requirements")({
  head: () => ({
    meta: [
      { title: "בדיקת דרישות נסיעה ויזה ומסמכים | גולדטוס" },
      { name: "description", content: "בדקו תוך שניות את דרישות הויזה, תוקף הדרכון, חיסונים ומסמכים נדרשים לכל יעד בעולם. מנוע חיפוש חכם המבוסס על מקורות רשמיים." },
      { property: "og:title", content: "בדיקת דרישות נסיעה - גולדטוס" },
      { property: "og:description", content: "מנוע חכם לבדיקת ויזה, דרכון, חיסונים ומסמכים לכל יעד בעולם." },
    ],
  }),
  component: TravelRequirementsPage,
});

function TravelRequirementsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TravelRequirements | null>(null);

  const handleSearch = async (nationality: string, destination: string) => {
    const nationalityLabel = countries.find((c) => c.value === nationality)?.label || nationality;
    const destinationLabel = countries.find((c) => c.value === destination)?.label || destination;

    setLoading(true);
    setData(null);

    try {
      const { data: result, error } = await supabase.functions.invoke("get-travel-requirements", {
        body: { nationality, destination, nationalityLabel, destinationLabel },
      });

      if (error) {
        const ctx = (error as { context?: { status?: number } }).context;
        if (ctx?.status === 429) {
          toast.error("יותר מדי בקשות, נסה שוב בעוד רגע");
        } else if (ctx?.status === 402) {
          toast.error("שירות הבדיקה זמנית לא זמין, נסה שוב מאוחר יותר");
        } else {
          toast.error("שגיאה בקבלת הדרישות, נסה שוב");
        }
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setData(result as TravelRequirements);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בקבלת הדרישות, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <section className="relative px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 gradient-radial-gold opacity-20 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה לעמוד הבית
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto rounded-full border border-primary/40 bg-primary/10">
            <Globe className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            דרישות נסיעה
            <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-1">
              לכל יעד בעולם
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            בחרו לאום ויעד וקבלו תוך שניות את כל מה שצריך לדעת: ויזה, דרכון, חיסונים ומסמכים — מבוסס מקורות רשמיים ומעודכן ל-2026.
          </p>
        </div>
      </section>

      <section className="px-4 -mt-10 relative z-10">
        <TravelSearchForm onSearch={handleSearch} loading={loading} />
      </section>

      {loading && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="inline-block w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-muted-foreground">בודק דרישות עדכניות...</p>
        </div>
      )}

      {data && !loading && <RequirementsResults data={data} />}
    </div>
  );
}