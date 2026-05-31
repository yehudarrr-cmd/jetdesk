## מטרה
לאחד כל לקוח לכרטיס יחיד וקבוע, ולהכניס מבנה היררכי של **הזמנות** (Bookings) שמתחתיהן הטיסות/מלונות/רכב/העברות, פלוס מועדוני נוסע מתמיד ונוסעים נלווים קבועים.

---

## 1. שינויי DB (מיגרציה אחת)

### עדכון `customers` – הוספת שדות לקוח קבוע
- `id_number` (text) – תעודת זהות
- `date_of_birth` (date)
- `address` (text)
- `last_contact_at` (timestamptz) – יתעדכן אוטומטית בכל יצירת שיחה/הזמנה
- שדות הטיול הישנים (`destination`, `travel_start_date`, `travel_end_date`, `pnr`, `total_price`, `amount_paid`) נשארים לתאימות אחורנית אך **לא יוצגו יותר ב-overview** – הופכים למחושבים מההזמנות.

### טבלה חדשה: `bookings`
- `id`, `owner_id`, `customer_id`
- `booking_number` (text) – מספר הזמנה פנימי/חיצוני
- `title` (text) – למשל "חופשה בפראג ספטמבר 2026"
- `destination` (text)
- `departure_date` (date), `return_date` (date)
- `status` (enum: `draft`, `quoted`, `confirmed`, `completed`, `cancelled`)
- `total_price` (numeric), `amount_paid` (numeric), `profit` (numeric)
- `notes` (text)
- `created_at`, `updated_at`
- GRANTs + RLS לפי `owner_id = auth.uid()` כמו שאר הטבלאות

### עדכון טבלאות קיימות – הוספת `booking_id` (nullable, ל-backfill הדרגתי)
- `flights`, `hotels`, `car_rentals`, `transfers`, `payments` → תוספת `booking_id uuid` nullable
- כל אחד מהם ממשיך להחזיק `customer_id` (לתאימות + לטיסות "תלושות" שמגיעות מ-Gmail לפני שיוך להזמנה)
- אינדקסים על `booking_id`

### טבלה חדשה: `frequent_flyer_programs`
- `id`, `owner_id`, `customer_id`
- `airline` (text) – שם חברת התעופה
- `program_name` (text) – למשל "Matmid", "Miles & More"
- `member_number` (text)
- `tier` (text nullable) – Silver/Gold/Platinum
- `notes`
- GRANTs + RLS לפי owner

### טבלה חדשה: `companion_travelers`
- `id`, `owner_id`, `customer_id`
- `full_name` (text), `relation` (text nullable) – בן זוג/ילד/הורה
- `date_of_birth` (date nullable)
- `passport_number` (text nullable), `passport_expiry` (date nullable)
- `nationality` (text nullable)
- `notes`
- GRANTs + RLS לפי owner

### Storage
- ה-bucket `customer-files` כבר קיים, ישמש למסמכים כללים (קיים גם זרימת העלאה).

---

## 2. שינויי UI

### `src/routes/_app.customers.$id.tsx`
**עליון – כרטיס סיכום מורחב**
- סטטים חדשים: מס׳ הזמנות, סה״כ רווחים (sum של `profit`), יעד אחרון, הזמנה עתידית קרובה, נוצר בתאריך, יצירת קשר אחרון.
- כפתור ראשי **"הוסף הזמנה חדשה"**.

**שדות פרופיל (טאב סקירה)**
- שורה ראשונה: שם, טלפון, מייל, ת.ז., תאריך לידה, כתובת, סטטוס.
- מסירים מהסקירה: יעד/תאריכי טיול/PNR/מחיר/שולם (הם עוברים להזמנות).

**מבנה לשוניות חדש**
```text
סקירה | הזמנות | מועדוני נוסע | נוסעים נלווים | דרכונים | מסמכים | תשלומים | משימות | שיחות | ציר זמן
```
- מסירים את הלשוניות הנפרדות "טיסות / מלונות / רכב / העברות" – הן יוצגו **בתוך כל הזמנה**.

**לשונית "הזמנות" (חדשה)**
- רשימת כרטיסיות הזמנה: כותרת, יעד, תאריכים, מס׳ הזמנה, סטטוס (Badge צבעוני), מחיר/שולם/רווח.
- כל כרטיסייה ניתנת להרחבה (Accordion) ובתוכה תתי-לשוניות: טיסות / מלונות / רכב / העברות / תשלומים / הערות.
- כפתור "עריכה" + "מחיקה" בכל הזמנה.
- בהוספת רכיב (טיסה/מלון/וכו') – `booking_id` ו-`customer_id` מתמלאים אוטומטית.

**לשונית "מועדוני נוסע מתמיד" (חדשה)**
- טבלה עם הוספה/עריכה/מחיקה: חברת תעופה, שם תוכנית, מספר נוסע, סטטוס/Tier, הערות.
- כפתור "העתק מספר" לכל שורה.

**לשונית "נוסעים נלווים" (חדשה)**
- כרטיסיות לכל בן משפחה/שותף לנסיעות עם פרטי דרכון.
- כפתור "צור הזמנה חדשה הכוללת נוסעים אלו" (אופציונלי לעתיד – פשוט סימון בעת הוספת טיסה).

### עדכון `_app.dashboard.tsx`
- "טיסות פתוחות" ו"יתרות חוב" יעברו להתבסס על `bookings` במקום על `customers` (סכימה חדשה).

### עדכון מסכים אחרים שמשתמשים ב-`flights`/`hotels` כיום
- `_app.flights.tsx` ו-`_app.payments.tsx` ימשיכו לעבוד (השדות לא נמחקים); נוסיף ל-`flights` הצגת הזמנה מקושרת כשקיימת.

### עדכון `_app.customers.index.tsx`
- במקום להציג יעד/תאריכי טיול בכרטיס לקוח – להציג: מס׳ הזמנות, הזמנה הבאה, יתרת חוב מצטברת.

### עדכון `gmail-ingest` (edge function קיים)
- טיסות שמגיעות מ-Gmail ייכנסו עם `booking_id = NULL` תחת הלקוח. בלשונית ההזמנות תופיע מקטע "טיסות לא משויכות" עם כפתור "שייך להזמנה" / "צור הזמנה חדשה מטיסה זו".

---

## 3. סדר ביצוע
1. מיגרציה: עמודות חדשות ב-`customers`, טבלת `bookings`, `frequent_flyer_programs`, `companion_travelers`, עמודות `booking_id` בטבלאות בנים. GRANTs + RLS.
2. עדכון `_app.customers.$id.tsx`: כותרת מורחבת, שדות פרופיל מורחבים, רה-ארגון לשוניות.
3. בניית לשונית "הזמנות" עם Accordion ותתי-טפסים.
4. בניית לשוניות "מועדוני נוסע" + "נוסעים נלווים".
5. עדכון dashboard ורשימת לקוחות לחישובים החדשים.
6. עדכון gmail-ingest להציג טיסות לא משויכות.

---

## פרטים טכניים
- כל הטבלאות החדשות עם `owner_id default auth.uid()` + 4 פוליסות RLS owner-only (כמו הקיימות).
- שאילתות הקיימות ל-`flights`/`hotels`/etc. **אינן נשברות** – פשוט מצטרפת עמודה nullable.
- ב-React: queries חדשות `["customer-bookings", id]`, `["customer-ff", id]`, `["customer-companions", id]`.
- לא נמחקות עמודות ישנות מ-`customers` ב-step זה (backfill עתידי אופציונלי).

---

## מחוץ ל-scope
- מיגרציה אוטומטית של נתונים קיימים (טיסות ללא booking יישארו "תלושות" עד שיוך ידני / יצירת הזמנה).
- הצעות מחיר כיישות נפרדת (תופיע כרגע כסטטוס `quoted` בהזמנה).
- שיתוף הזמנות עם הלקוח (קישור חיצוני) – לעתיד.