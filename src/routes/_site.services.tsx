import { createFileRoute, Link } from "@tanstack/react-router";
import { Hotel, Car, Briefcase, BookOpen, Crown, Umbrella, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_site/services")({
  head: () => ({
    meta: [
      { title: "שירותי פרימיום | גולדטוס - טיסות, מלונות, VIP בנתב\"ג" },
      { name: "description", content: "שירותי הקונסיירז' של גולדטוס: טיסות פרימיום ועסקיות, מלונות יוקרה, השכרת רכב, VIP בנתב\"ג, נסיעות למגזר הדתי וביטוח נסיעות." },
      { property: "og:title", content: "שירותי פרימיום | גולדטוס" },
      { property: "og:description", content: "כל מה שצריך לנסיעת פרימיום — תחת קורת גג אחת." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Hotel, title: "טיסות + מלונות יוקרה", desc: "חבילות בוטיק עם מלונות נבחרים בעולם, מתואמות לסגנון הנסיעה שלכם." },
  { icon: Car, title: "השכרת רכב והעברות", desc: "רכבים מתקדמים והעברות פרטיות מהשדה למלון ובחזרה — ללא טעויות." },
  { icon: Briefcase, title: "טיסות עסקיות", desc: "מושבי Business ו-First, סלוני המתנה ושירות שמתאים לאיש עסקים תובעני." },
  { icon: BookOpen, title: "מגזר דתי", desc: "פתרונות נסיעה רגישים — אוכל כשר, יעדים מותאמים, מלונות בקרבת בתי כנסת." },
  { icon: Crown, title: "VIP בנתב\"ג", desc: "מסלול ירוק, ליווי אישי, סלון VIP — הנסיעה מתחילה ברגע שיוצאים מהבית." },
  { icon: Umbrella, title: "ביטוח נסיעות", desc: "פוליסה דיגיטלית מקיפה דרך פספורט קארד — בלי טפסים, בלי כאב ראש." },
];

function ServicesPage() {
  return (
    <div className="px-6 pt-12 pb-20 sm:pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="inline-block text-xs tracking-[0.3em] text-primary uppercase">השירותים</span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            שירותי פרימיום
            <span className="block bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent mt-1">
              הכל תחת גג אחד
            </span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            סוכנות הנסיעות שמנהלת לכם את הדרך — מהזמנת הטיסה ועד הרגע שאתם חוזרים הביתה.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <Card key={i} className="p-6 bg-card/40 backdrop-blur-sm border border-border/40 hover:border-primary/50 transition-colors space-y-3">
              <div className="w-11 h-11 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full gradient-primary text-primary-foreground px-7 py-3 font-bold shadow-glow hover:scale-[1.04] transition-transform"
          >
            <span>לקבלת הצעה אישית</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}