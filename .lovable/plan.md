## הוספת סקשן "ביטוח נסיעות לחו"ל"

עריכה של קובץ יחיד: `src/components/LandingPage.tsx`. ללא תלויות חדשות וללא נכסים חדשים.

### 1. מיקום הסקשן
ממוקם בין סקשן "WHY US" לסקשן "DETAILED LEAD FORM" (אחרי השירותים והערך המוסף, לפני יצירת הקשר). `id="travel-insurance"` כדי לתמוך בעוגן.

### 2. עיצוב
משתלב בשפה הקיימת:
- מבנה: `section` עם `border-t border-border/40`, padding `py-14 sm:py-20 px-6`.
- כרטיס יחיד `Card` ממורכז `max-w-3xl mx-auto`, רקע `bg-card/40 backdrop-blur-sm`, גבול `border-primary/30`, פינות `rounded-2xl`, צל `shadow-gold-soft`, padding `p-8 sm:p-10`.
- אייקון מרכזי: `ShieldCheck` בתוך עיגול זהב רך (`w-14 h-14 rounded-full border border-primary/40 bg-primary/10`) עם `Plane` קטן כמיני-אקסנט.
- עיניים-קץ: כותרת זהב קטנה עם אותיות מפוזרות `text-xs tracking-[0.3em] text-primary uppercase` — "שירות נוסף".
- כותרת H2: `text-2xl sm:text-3xl lg:text-4xl font-bold` — "ביטוח נסיעות לחו"ל — סוגרים את זה לפני הטיסה" (מילה "סוגרים את זה לפני הטיסה" בגרדיאנט זהב).
- פסקה: `text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto`.
- CTA: `Button` ב-`gradient-primary text-primary-foreground shadow-glow h-12 px-8 text-base` עם אייקון `ShieldCheck` — "לרכישת ביטוח נסיעות". פותח את `https://bit.ly/4fW6B98` ב-`target="_blank" rel="noopener noreferrer"`.
- שורת אמון מתחת: שלושה פריטים קטנים (`Plane` "מותאם לטיסה", `Briefcase` "פוליסה דיגיטלית", `ShieldCheck` "מאובטח") — `text-xs text-muted-foreground` עם פייספלייט זהב.
- כל הטקסטים RTL, יישור מרכז, רספונסיבי. במובייל: padding מצומצם, כפתור `w-full sm:w-auto`.

### 3. ניווט
ל-Hero אין כיום ניווט עליון, ולכן אין מה לעדכן שם. שורת CONTACT הקיימת תקבל קישור נוסף "ביטוח נסיעות" עם אייקון `ShieldCheck` שגולל אל `#travel-insurance` (smooth scroll), כדי לתת חשיפה גם בלי ניווט מלא.

### 4. שינויי import
שימוש באייקונים קיימים בלבד (`ShieldCheck`, `Plane`, `Briefcase`) — כולם כבר מיובאים. ללא שינויי import.

### מחוץ לתחום
לא נוגעים ב-Hero, בטופסים, ב-routing או ב-backend.
