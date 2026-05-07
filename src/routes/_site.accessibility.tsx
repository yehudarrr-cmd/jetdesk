import { createFileRoute } from "@tanstack/react-router";
import { canonical, ldScript, breadcrumbLd } from "@/lib/site-constants";

export const Route = createFileRoute("/_site/accessibility")({
  head: () => ({
    meta: [
      { title: "הצהרת נגישות | גולדטוס" },
      { name: "description", content: "הצהרת נגישות אתר גולדטוס לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע\"ג-2013 ותקן ישראלי 5568." },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/accessibility") }],
    scripts: [
      ldScript(breadcrumbLd([
        { name: "בית", path: "/" },
        { name: "הצהרת נגישות", path: "/accessibility" },
      ])),
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-14 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">הצהרת נגישות</h1>
      <p className="text-sm text-muted-foreground mb-8">עודכן לאחרונה: מאי 2026</p>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-xl font-bold text-primary mb-2">מחויבות לנגישות</h2>
          <p>
            גולדטוס רואה בהנגשת האתר ערך עליון, ופועלת לאפשר לאנשים עם מוגבלות שימוש מלא ושוויוני בשירותיה — בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, ותקן ישראלי 5568 (המבוסס על WCAG 2.0 ברמה AA).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-2">אמצעי הנגשה באתר</h2>
          <ul className="list-disc pr-5 space-y-1">
            <li>תפריט נגישות צף בפינה השמאלית-תחתונה (אייקון <span aria-label="נגישות">♿</span>).</li>
            <li>הגדלה והקטנה של גודל הטקסט עד 150%.</li>
            <li>שלוש רמות ניגודיות: רגילה, גבוהה והפוכה.</li>
            <li>הדגשת קישורים והוספת קווים תחתונים.</li>
            <li>עצירת אנימציות ותנועה.</li>
            <li>החלפה לגופן קריא יותר.</li>
            <li>תמיכה בניווט מקלדת מלאה (Tab/Shift+Tab/Enter) וב-Skip to content.</li>
            <li>תיוג סמנטי (HTML5), שימוש ב-ARIA ותגי alt לתמונות משמעותיות.</li>
            <li>יחס ניגודיות מינימלי 4.5:1 לטקסט רגיל.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-2">חלקים שטרם הונגשו</h2>
          <p>חרף מאמצינו, ייתכנו דפים, רכיבים או מסמכי PDF חיצוניים שטרם הונגשו במלואם. אנו פועלים באופן שוטף לתיקון.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-2">דרכי פנייה ורכז נגישות</h2>
          <p>נתקלתם בבעיית נגישות? נשמח לסייע ולתקן. ניתן לפנות לרכז הנגישות:</p>
          <ul className="list-disc pr-5 space-y-1 mt-2">
            <li>טלפון: <span dir="ltr">055-775-6660</span></li>
            <li>וואטסאפ: <span dir="ltr">055-775-6660</span></li>
            <li>אתר: <a className="text-primary underline" href="/contact">טופס יצירת קשר</a></li>
          </ul>
          <p className="mt-2">זמן מענה לפניות נגישות: עד 7 ימי עבודה.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-2">תאריך עדכון</h2>
          <p>הצהרה זו עודכנה לאחרונה במאי 2026 ונבדקת אחת לשנה לפחות.</p>
        </section>
      </div>
    </article>
  );
}