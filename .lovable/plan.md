## מטרה
עמוד `/deals` איכותי ל-SEO, בעיצוב Dark Luxury קיים, עם מערכת דילים גמישה שנשאבת אוטומטית מ-quotes.goldtus.com.

## 1. מקור נתונים — Supabase + סקרייפ אוטומטי

טבלה חדשה `public.deals`:
- `id`, `slug`, `quote_url` (unique)
- `destination`, `country`, `title`, `hotel`, `airline`
- `price_from` (integer), `currency`
- `start_date`, `end_date`, `nights`
- `image_url`, `gallery` (jsonb)
- `featured` (bool), `active` (bool), `sort_order`
- `tags` (text[]) — לעתיד: חג/חודש/רגע-אחרון
- `last_synced_at`, `created_at`, `updated_at`
- RLS: קריאה ל-anon (רק `active=true`), כתיבה לאדמינים.

מדוע Supabase ולא JSON: מאפשר הוספה מהדשבורד, סנכרון אוטומטי, ועמודי יעד עתידיים (`/deals/batumi`) ללא deploy.

## 2. סקרייפ אוטומטי מ-quotes.goldtus.com

בדקתי דוגמה — הדף מכיל מבנה קבוע (יעד, מלון, מחיר ₪, תאריכי יציאה/חזרה, לילות, חברת תעופה, תמונה). סקרייפ אפשרי.

Server function `syncDealFromQuote(quoteUrl)`:
- fetch לדף → פארס HTML (regex/cheerio-lite) לחילוץ השדות.
- upsert ל-`deals` לפי `quote_url`.
- `syncAllDeals()` — לולאה על כל הרשומות הקיימות (ריענון מחירים).

ממשק ניהול `/_app/deals`:
- שדה URL להדבקה → כפתור "משוך מההצעה" → תצוגה מקדימה → שמור.
- טבלת דילים עם toggle Active/Featured, עריכה ידנית של שדות שהחילוץ פספס, מחיקה, כפתור "רענן כל הדילים".
- ייבוא ראשוני של 13 ה-URLs שסופקו.

## 3. עמוד `/deals` (ציבורי)

- **Hero**: כותרת "דילים חמים לחו״ל" בזהב על נייבי, כפתור וואטסאפ.
- **Info Box** אלגנטי: הודעת "חשוב לדעת" (מחירים דינמיים / ט.ל.ח).
- **Grid דילים**: כרטיסים מוארי-זהב על נייבי (עקבי לעיצוב הקיים) — תמונה WebP + Lazy, יעד, כותרת, "החל מ-₪X", תאריכים, לילות, מלון, חברת תעופה, כפתור זהב "לפרטים ולהזמנה" → `externalUrl`.
- **Featured** למעלה, השאר לפי `sort_order`.
- **CTA תחתון**: "לא מצאתם את הדיל?" + כפתור וואטסאפ גדול.

## 4. SEO

`head()` על `/deals`:
- Title: `דילים חמים לחו"ל | טיסות וחבילות נופש - GoldTus`
- Meta description כמבוקש
- Canonical `https://goldtus.com/deals`
- OG title/description/type/url + og:image (תמונת דיל ראשי)
- JSON-LD: `BreadcrumbList` + `CollectionPage` עם `hasPart` של `Offer`/`TouristTrip` לכל דיל (עוזר לגוגל להבין מבצעים).
- הוספת `/deals` ל-`public/sitemap.xml` (וארכיטקטורה שתומכת בעתיד ב-`/deals/:slug`).
- קישור "🔥 דילים חמים" ב-`SiteHeader` בתפריט הראשי.

## 5. HTML Sitemap

עמוד `/sitemap` פשוט (רשימת קישורים מקובצת: ראשי, שירותים, דילים) — כרגע קטן, יגדל אוטומטית כשנוסיף `/deals/:slug`. קישור בפוטר.

## 6. ארכיטקטורה עתידית (ללא שינוי מבנה)

- `/deals/:destination` — route דינמי שסונן `deals` לפי `country`/`destination`/`tags`.
- `/deals/last-minute`, `/deals/holidays/:holiday` — פילטרים מעל אותה טבלה.
- שדות `tags[]` + `country` כבר יאפשרו את זה בלי מיגרציה נוספת.

## 7. ביצועים

- `loading="lazy"` + `decoding="async"` + `sizes` על כל תמונה.
- Loader משתמש ב-`ensureQueryData` (SSR-friendly).
- אין תלות חיצונית כבדה בעמוד הציבורי.

## פרטים טכניים
- Route: `src/routes/_site.deals.tsx` (leaf תחת site layout).
- Admin: `src/routes/_app.deals.tsx`.
- Server fns: `src/lib/deals.functions.ts` — `listPublicDeals`, `listAdminDeals`, `syncDealFromQuote`, `syncAllDeals`, `upsertDealManual`, `deleteDeal`, `toggleDealFlag`.
- Parser: `src/lib/deals-parser.server.ts` — פונקציות regex ייעודיות על ה-HTML של quotes.goldtus.com (יעד, מלון, מחיר, תאריכים, לילות, חברת תעופה, תמונה ראשית). fallback: אם שדה חסר — נשמר null וניתן לעריכה ידנית.
- מיגרציה יוצרת טבלה + GRANT + RLS + policies (anon SELECT WHERE active, authenticated admins full).

## שאלה אחת לפני build
מי נחשב "אדמין" לכתיבה? כרגע לפי הקוד יש `has_role(auth.uid(), 'admin')` — אשתמש בזה. אם צריך לפתוח לכל משתמש מחובר, אעדכן.
