import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You extract structured data from passport / national ID scans. Return ONLY by calling the function extract_passport. If a field is unreadable, set it to null. Dates must be YYYY-MM-DD. Names in Latin letters as printed on the document.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData, error: authErr } = await sb.auth.getUser();
    if (authErr || !userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { image_url, image_base64, mime_type } = await req.json();
    if (!image_url && !image_base64) {
      return new Response(JSON.stringify({ error: "missing image" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imagePart = image_base64
      ? { type: "image_url", image_url: { url: `data:${mime_type ?? "image/jpeg"};base64,${image_base64}` } }
      : { type: "image_url", image_url: { url: image_url } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: [
            { type: "text", text: "Extract all fields from this passport / ID. Use the MRZ if visible for accuracy." },
            imagePart,
          ] },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_passport",
            description: "Structured passport fields",
            parameters: {
              type: "object",
              properties: {
                first_name: { type: ["string", "null"] },
                last_name: { type: ["string", "null"] },
                passport_number: { type: ["string", "null"] },
                date_of_birth: { type: ["string", "null"], description: "YYYY-MM-DD" },
                issue_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                expiry_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                nationality: { type: ["string", "null"] },
                sex: { type: ["string", "null"], description: "M or F" },
                place_of_birth: { type: ["string", "null"] },
                issuing_country: { type: ["string", "null"] },
              },
              required: [],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_passport" } },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) return new Response(JSON.stringify({ error: "חרגת ממכסת הבקשות, נסה שוב בעוד דקה" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "נגמרו הקרדיטים של Lovable AI" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};
    return new Response(JSON.stringify({ extracted: args }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("extract-passport error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});