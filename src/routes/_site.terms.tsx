import { createFileRoute } from "@tanstack/react-router";
import { canonical, ldScript, breadcrumbLd } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/terms")({
  head: () => ({
    meta: [
      { title: "תנאי שימוש | גולדטוס" },
      { name: "description", content: "תנאי השימוש באתר גולדטוס - זכויות, חובות והגבלת אחריות בהתאם לדין הישראלי." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/terms") }],
    scripts: [
      ldScript(breadcrumbLd([
        { name: "בית", path: "/" },
        { name: "תנאי שימוש", path: "/terms" },
      ])),
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">תנאי שימוש</h1>
      <p className="text-sm text-muted-foreground mb-8">עודכן לאחרונה: מאי 2026</p>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">1. כללי</h2>
          <p>השימוש באתר www.goldtus.com (להלן: "האתר") כפוף לתנאים אלה ולהוראות כל דין החל במדינת ישראל. גלישה באתר מהווה הסכמה מלאה לתנאים.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">2. שירותי החברה</h2>
          <p>גולדטוס פועלת כסוכנות נסיעות ומציעה שירותי תיווך בלבד מול חברות תעופה, בתי מלון, חברות השכרת רכב וגופי ביטוח. ההזמנה הסופית כפופה לאישור הספק וזמינותו.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">3. מחירים, תשלומים וביטולים</h2>
          <p>המחירים נקובים בש"ח או במט"ח לפי סוג השירות, וכוללים מע"מ במקרים בהם הדין מחייב. ביטולי עסקה יבוצעו בהתאם לחוק הגנת הצרכן, התשמ"א-1981 ולתקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010, בכפוף למדיניות הביטול של הספק.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">4. הגבלת אחריות</h2>
          <p>החברה אינה אחראית לעיכובים, ביטולים, נזקים או אי-התאמות הנובעים מצדדים שלישיים (מוביל אווירי, בית מלון, ביטוח). מומלץ לרכוש ביטוח נסיעות מקיף.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">5. קניין רוחני</h2>
          <p>כל הזכויות באתר, לרבות עיצוב, לוגו, טקסטים ותמונות, שייכות לגולדטוס או למורשים מטעמה. אין להעתיק, להפיץ או להשתמש ללא רשות מראש ובכתב.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">6. דין ושיפוט</h2>
          <p>על תנאים אלה יחול הדין הישראלי בלבד. סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">7. שינויים</h2>
          <p>החברה רשאית לעדכן תנאים אלה מעת לעת. נוסח עדכני יפורסם בעמוד זה.</p>
        </section>
      </div>
    </article>
  );
}