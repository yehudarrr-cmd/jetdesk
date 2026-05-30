
## המטרה
להאזין לתיבת Gmail של `yehudar.tus@gmail.com`, לזהות מיילים עם כרטיסי טיסה (PDF/תמונה/HTML), לחלץ נתונים באמצעות AI, ולשייך אוטומטית ללקוח הקיים במערכת — תוך הוספת רשומת `flights` חדשה ושמירת הקובץ ב-`documents`.

## שלב 1 — חיבור Gmail (מחבר Lovable)
- חיבור Gmail דרך `standard_connectors--connect` (connector_id: `google_mail`).
- המשתמש יבחר את החשבון `yehudar.tus@gmail.com` במסך הסנכרון.
- הסקופים הנדרשים: `gmail.readonly` (לקריאת מיילים והורדת קבצים מצורפים).

## שלב 2 — סכמת DB
טבלה חדשה `email_ingest_state` למעקב אחר ה-`historyId` של Gmail (שלא נסרוק את אותו מייל פעמיים), וטבלה `email_ingest_log` ללוג של מה שעובד/נכשל/דרוש בירור ידני.

```
email_ingest_state: id, owner_id, last_history_id, last_synced_at
email_ingest_log:   id, owner_id, gmail_message_id, subject, from_email,
                    status (matched|unmatched|failed|duplicate),
                    matched_customer_id, matched_flight_id,
                    extracted_data jsonb, error, created_at
```
שתיהן עם RLS לפי `owner_id = auth.uid()`.

## שלב 3 — חילוץ נתוני טיסה (Server Function עם Lovable AI)
`src/lib/flight-extract.functions.ts`:
- מקבל את גוף המייל + קבצים מצורפים (PDF/תמונה).
- שולח ל-Gemini 2.5 Pro (תומך multimodal) עם prompt מובנה שמחזיר JSON:
  `{ passengers: [{first_name,last_name}], pnr, flights: [{airline, flight_number, dep_airport, arr_airport, dep_datetime, arr_datetime}] }`.
- מטפל ב-multi-leg (כל leg → רשומת flights נפרדת).

## שלב 4 — לוגיקת התאמת לקוח
פונקציה `matchCustomer(extracted, ownerId)`:
1. אם PNR מהמייל = `customers.pnr` או `flights.pnr` קיים → התאמה ישירה.
2. אחרת — נורמליזציה של שם הנוסע + טרנסליטרציה עברית↔אנגלית (בעזרת `src/lib/he-translit.ts` הקיים), השוואה fuzzy מול `customers.name` של אותו owner.
3. אם נמצא לקוח אחד → שיוך אוטומטי. אם 0 או >1 → נשמר ב-`email_ingest_log` עם `status='unmatched'` לטיפול ידני.

## שלב 5 — סורק המיילים (Server Function)
`src/lib/gmail-ingest.functions.ts` עם `requireSupabaseAuth`:
- מסנן Gmail: `newer_than:30d (has:attachment OR subject:(ticket OR טיסה OR booking OR confirmation OR e-ticket))`.
- שימוש ב-`historyId` ל-incremental sync בריצות הבאות (לא לסרוק שוב מה שכבר עובד).
- לכל הודעה רלוונטית: הורדת קבצים → חילוץ → התאמה → INSERT ל-`flights` + העלאת הקובץ ל-bucket `customer-files` ויצירת `documents` (category: `flight_ticket`).
- אידמפוטנטי: בדיקה ב-`email_ingest_log` ש-`gmail_message_id` לא נסרק כבר.

## שלב 6 — הפעלות
1. **כפתור ידני** במסך CRM ("סרוק מיילים עכשיו") שמפעיל את הפונקציה ומציג תוצאות.
2. **Cron אוטומטי** דרך `pg_cron` כל 15 דקות שקורא ל-server route ציבורי `src/routes/api/public/hooks/gmail-ingest.ts` (עם `apikey` header).
3. **סריקה ראשונית** של 30 הימים האחרונים בלחיצה אחת מתוך הדף.

## שלב 7 — UI חדש
דף חדש `/email-ingest` עם:
- סטטוס חיבור Gmail.
- כפתורי "סנכרון מלא (30 יום)" ו"סנכרן עכשיו".
- טבלת לוג: 50 המיילים האחרונים שעובדו, סטטוס, ולכל `unmatched` — דרופדאון לבחירת לקוח ידנית + כפתור "שייך".
- בכרטיס לקוח (טאב טיסות) — אינדיקציה ויזואלית קטנה ✉️ לטיסות שמקורן מסריקת מייל.

## טכני
- **קבצים חדשים**: `src/lib/gmail-client.server.ts` (wrapper ל-Gmail API דרך connector gateway), `src/lib/flight-extract.functions.ts`, `src/lib/gmail-ingest.functions.ts`, `src/routes/_app.email-ingest.tsx`, `src/routes/api/public/hooks/gmail-ingest.ts`, migration לטבלאות החדשות.
- **קבצים שיתעדכנו**: `src/components/AppLayout.tsx` (פריט תפריט חדש), `src/routes/_app.customers.$id.tsx` (אינדיקציית מקור בטאב טיסות).
- שימוש בקליינט Gmail דרך gateway: `https://connector-gateway.lovable.dev/google_mail/gmail/v1/...` עם הדרים `Authorization: Bearer LOVABLE_API_KEY` ו-`X-Connection-Api-Key: GOOGLE_MAIL_API_KEY`.

## מחוץ לטווח
- שליחת מיילים יוצאים.
- חילוץ אוטומטי של מלונות/רכב/העברות (רק טיסות בשלב זה — אפשר להרחיב בהמשך באותה תשתית).
- יצירת לקוח חדש אוטומטית כש-`unmatched` (תמיד דורש אישור ידני).
