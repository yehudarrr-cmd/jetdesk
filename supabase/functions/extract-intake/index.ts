import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `אתה עוזר חילוץ נתונים עבור סוכן נסיעות ישראלי. קלט: טקסט חופשי בעברית (יתכן עם אנגלית) שיכול להיות שיחת ווטסאפ, הזמנה, מייל, או הערה.
חלץ את הנתונים הזמינים בלבד. אל תמציא. אם שדה לא ידוע - השאר null.
החזר את הנתונים על ידי קריאה לפונקציה extract_travel_data.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "missing text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_travel_data",
              description: "Extract structured travel CRM data from free text",
              parameters: {
                type: "object",
                properties: {
                  customer_name: { type: ["string", "null"] },
                  phone: { type: ["string", "null"], description: "phone in international format if possible" },
                  email: { type: ["string", "null"] },
                  destination: { type: ["string", "null"] },
                  travel_start_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  travel_end_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                  pnr: { type: ["string", "null"] },
                  number_of_passengers: { type: ["number", "null"] },
                  total_price: { type: ["number", "null"] },
                  amount_paid: { type: ["number", "null"] },
                  flights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        airline: { type: ["string", "null"] },
                        flight_number: { type: ["string", "null"] },
                        departure_airport: { type: ["string", "null"] },
                        arrival_airport: { type: ["string", "null"] },
                        departure_datetime: { type: ["string", "null"], description: "ISO 8601" },
                        arrival_datetime: { type: ["string", "null"], description: "ISO 8601" },
                        pnr: { type: ["string", "null"] },
                      },
                    },
                  },
                  missing_documents: { type: "array", items: { type: "string" } },
                  missing_insurance: { type: ["boolean", "null"] },
                  needs_check_in_reminder: { type: ["boolean", "null"] },
                  follow_up_tasks: { type: "array", items: { type: "string" } },
                  summary: { type: "string", description: "סיכום קצר בעברית של מה שזוהה" },
                },
                required: ["summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_travel_data" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "חרגת ממכסת הבקשות, נסה שוב בעוד דקה" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נגמרו הקרדיטים של Lovable AI. הוסף קרדיטים בהגדרות." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};

    return new Response(JSON.stringify({ extracted: args }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-intake error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});