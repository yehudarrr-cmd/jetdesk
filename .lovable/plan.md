## המטרה
בכל לשונית בכרטיס הלקוח (טיסות, מלונות, רכב, העברות, מסמכים, תשלומים, משימות, שיחות) — לאפשר **עריכה** ו**מחיקה** של כל פריט קיים, לא רק הוספה.

היום: רק הוספה ועדכון שדה בודד (למשל סטטוסים בטיסה). אין כפתור עריכה/מחיקה לכל רשומה.

## מה ייווסף לכל פריט

לכל שורה בכל לשונית — שני כפתורי איקון בפינה:
- ✏️ **עריכה** → פותח דיאלוג זהה לדיאלוג ההוספה, אבל ממולא בערכים הקיימים. שמירה → `update` באותה טבלה.
- 🗑️ **מחיקה** → `AlertDialog` לאישור → `delete` באותה טבלה.

לאחר כל פעולה: `toast` + `invalidateQueries(["customer-related", customerId])`. בתשלום שנמחק/עודכן — לעדכן גם את `amount_paid` בלקוח ולרענן `["customer", id]`.

## טבלאות וטפסים

| לשונית | טבלה | שדות לעריכה (זהים לטופס ההוספה) |
|---|---|---|
| טיסות | `flights` | airline, flight_number, departure/arrival_airport, departure/arrival_datetime, pnr |
| מלונות | `hotels` | hotel_name, city, check_in/out_date, room_type, number_of_guests, booking_status, notes |
| רכב | `car_rentals` | company_name, car_type, pickup/return_location, pickup/return_datetime, booking_status, notes |
| העברות | `transfers` | (לפי הטופס הקיים ב־TransfersTab) |
| מסמכים | `documents` | file_name, file_url, category |
| תשלומים | `payments` | amount, payment_type, method (ובמחיקה/שינוי סכום — לעדכן `customers.amount_paid`) |
| משימות | `tasks` | title, due_date, priority, status |
| שיחות | `conversations` | content, source |

## ארכיטקטורה
- כדי לא לשכפל קוד, הופכים את כל טפסי ה־Dialog הקיימים לקבל `initialValues` ו־`mode: "add" \| "edit"`. אם `edit` — קוראים `update().eq("id", item.id)` במקום `insert`.
- מוסיפים `<ItemActions onEdit onDelete />` קטן — שני כפתורי `ghost`/`icon` שמופיעים בכל שורה (תואם לסגנון `Pencil` ו־`Trash2` שכבר בשימוש בכותרת הכרטיס).

## קובץ שישתנה
- `src/routes/_app.customers.$id.tsx` בלבד.

## מחוץ לטווח
- שינויי סכמה.
- עריכת רשומות מתוך לשוניות גלובליות אחרות (למשל `/flights`, `/payments`) — הבקשה היא לכרטיס הלקוח.
