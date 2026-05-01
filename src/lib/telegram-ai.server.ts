// AI-powered intent extraction for Telegram messages

const SYSTEM_PROMPT = `אתה עוזר וירטואלי של סוכן נסיעות ישראלי. המשתמש שולח לך הודעות בטלגרם בעברית (יתכן עם אנגלית).
המטרה שלך: לזהות את הכוונה ואת הלקוח שאליו ההודעה מתייחסת, ולהחזיר פעולה מובנית.

סוגי פעולות אפשריות:
- create_or_update_customer: יצירת לקוח חדש או עדכון פרטי לקוח קיים (טיסות, יעד, תאריכים, מחיר וכו')
- record_payment: רישום תשלום שהתקבל
- create_task: יצירת משימת תזכורת
- query_info: שאלה על מידע קיים (יתרה, פרטי טיסה, סטטוס וכו')
- unknown: לא הצלחת להבין

חובה לזהות את הלקוח לפי השם/טלפון/PNR אם קיים ברשימת הלקוחות שאספק לך.
אם זה לקוח חדש, customer_id=null וצריך customer_name.
אם זה לקוח קיים, החזר את ה-customer_id המדויק מהרשימה.

החזר תמיד תגובה קצרה וידידותית בעברית בשדה reply.`;

type Customer = { id: string; name: string; phone: string | null; pnr: string | null; destination: string | null };

export async function processMessage(text: string, customers: Customer[]) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const customerList = customers.length
    ? customers.map((c) => `- ${c.name}${c.phone ? ` (${c.phone})` : ""}${c.pnr ? ` PNR:${c.pnr}` : ""}${c.destination ? ` יעד:${c.destination}` : ""} | id:${c.id}`).join("\n")
    : "(אין לקוחות עדיין)";

  const userPrompt = `רשימת לקוחות קיימים:\n${customerList}\n\nההודעה:\n${text}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      tools: [{
        type: "function",
        function: {
          name: "execute_action",
          description: "Execute the identified action on the CRM",
          parameters: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["create_or_update_customer", "record_payment", "create_task", "query_info", "unknown"] },
              customer_id: { type: ["string", "null"], description: "המזהה המדויק של לקוח קיים, או null אם חדש" },
              customer_name: { type: ["string", "null"] },
              customer_updates: {
                type: ["object", "null"],
                description: "שדות לעדכון בלקוח (רק שדות שהוזכרו)",
                properties: {
                  phone: { type: ["string", "null"] },
                  email: { type: ["string", "null"] },
                  destination: { type: ["string", "null"] },
                  travel_start_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  travel_end_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  pnr: { type: ["string", "null"] },
                  total_price: { type: ["number", "null"] },
                  notes: { type: ["string", "null"] },
                },
              },
              payment: {
                type: ["object", "null"],
                properties: {
                  amount: { type: "number" },
                  method: { type: "string", enum: ["cash", "credit_card", "bank_transfer", "other"] },
                  notes: { type: ["string", "null"] },
                },
              },
              task: {
                type: ["object", "null"],
                properties: {
                  title: { type: "string" },
                  due_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                },
              },
              query_answer: { type: ["string", "null"], description: "אם action=query_info, התשובה למשתמש על בסיס נתוני הלקוח" },
              reply: { type: "string", description: "תגובה ידידותית קצרה למשתמש בעברית" },
            },
            required: ["action", "reply"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "execute_action" } },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI gateway ${response.status}: ${t}`);
  }
  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No tool call returned");
  return JSON.parse(toolCall.function.arguments);
}