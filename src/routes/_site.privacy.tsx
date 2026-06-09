import { createFileRoute } from "@tanstack/react-router";
import { canonical, ldScript, breadcrumbLd } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/privacy")({
  head: () => ({
    meta: [
      { title: "מדיניות פרטיות | גולדטוס" },
      { name: "description", content: "מדיניות הפרטיות של גולדטוס - איסוף, שימוש ושמירת מידע אישי בהתאם לחוק הגנת הפרטיות, התשמ\"א-1981." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/privacy") }],
    scripts: [
      ldScript(breadcrumbLd([
        { name: "בית", path: "/" },
        { name: "מדיניות פרטיות", path: "/privacy" },
      ])),
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-14 sm:py-20 prose-invert">
      <h1 className="font-display text-4xl sm:text-5xl font-medium mb-2">מדיניות פרטיות</h1>
      <p className="text-sm text-muted-foreground mb-8">עודכן לאחרונה: מאי 2026</p>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">1. כללי</h2>
          <p>
            גולדטוס (להלן: "החברה" או "אנו") מכבדת את פרטיות המשתמשים באתר www.goldtus.com. מדיניות זו מסבירה איזה מידע נאסף, כיצד הוא משמש, ומהן זכויותיכם — והכל בהתאם לחוק הגנת הפרטיות, התשמ"א-1981 ולתקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">2. איזה מידע אנו אוספים</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>מידע שאתם מוסרים מרצון בטפסים: שם, טלפון, דוא"ל, יעד וטווח תאריכים.</li>
            <li>מידע טכני שנאסף אוטומטית: כתובת IP, סוג דפדפן, תאריכי גלישה ועוגיות.</li>
            <li>תכתובת בוואטסאפ או בטלפון לאחר יצירת קשר יזומה מצדכם.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">3. שימוש במידע</h2>
          <p>המידע משמש למתן הצעות מחיר, ניהול הזמנה, מענה לפניות, שיפור השירות ועמידה בחובות חוקיות. לא יועבר לצד שלישי אלא לצורך ביצוע השירות (חברות תעופה, בתי מלון, חברת ביטוח) או לפי דרישת חוק.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">4. דיוור ישיר</h2>
          <p>בכפוף להסכמתכם המפורשת ובהתאם לסעיף 30א לחוק התקשורת (בזק ושידורים), התשמ"ב-1982, נוכל לשלוח עדכונים ודילים. ניתן להסיר עצמכם מרשימת הדיוור בכל עת באמצעות לחיצה על קישור ההסרה או יצירת קשר עמנו.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">5. עוגיות (Cookies)</h2>
          <p>האתר משתמש בעוגיות הכרחיות לתפעול ובעוגיות לא הכרחיות (אנליטיקה ושיווק) רק לאחר קבלת הסכמתכם. ניתן לשנות העדפות בכל עת דרך באנר העוגיות או הגדרות הדפדפן.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">6. אבטחת מידע</h2>
          <p>אנו נוקטים אמצעי אבטחה סבירים — הצפנת תעבורה ב-HTTPS, הגבלת גישה לעובדים מורשים בלבד וניהול מאגר מידע בהתאם לתקנות. עם זאת, אין הגנה מוחלטת מפני חדירה לא מורשית.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">7. זכויות עיון, תיקון ומחיקה</h2>
          <p>בהתאם לסעיפים 13-14 לחוק הגנת הפרטיות, יש לכם זכות לעיין במידע השמור אודותיכם, לתקנו או לבקש את מחיקתו. ניתן לפנות אלינו בדוא"ל או בטלפון 055-775-6660.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">8. יצירת קשר</h2>
          <p>בכל שאלה ניתן לפנות לממונה על הגנת הפרטיות בחברה דרך עמוד <a href="/contact" className="text-primary underline">צור קשר</a> או בטלפון 055-775-6660.</p>
        </section>
      </div>
    </article>
  );
}