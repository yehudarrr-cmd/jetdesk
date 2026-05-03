const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body {
  nationality: string;
  destination: string;
  nationalityLabel: string;
  destinationLabel: string;
}

const schema = {
  type: "object",
  properties: {
    passportValidity: { type: "string" },
    visaType: { type: "string" },
    visaSummary: { type: "string" },
    documents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["passport", "visa", "vaccination", "insurance", "document"] },
          title: { type: "string" },
          description: { type: "string" },
          required: { type: "boolean" },
          source: { type: "string" },
          sourceUrl: { type: "string" }
        },
        required: ["type", "title", "description", "required"]
      }
    }
  },
  required: ["passportValidity", "visaType", "visaSummary", "documents"]
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const body: Body = await req.json();
    const { nationalityLabel, destinationLabel } = body;
    if (!nationalityLabel || !destinationLabel) {
      return new Response(JSON.stringify({ error: 'missing params' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `אתה מומחה לדרישות נסיעה בינלאומיות. אתה מספק מידע עדכני ומדויק נכון לשנת 2025-2026, המבוסס על מקורות רשמיים (משרדי חוץ, שגרירויות, רשויות הגירה, IATA, WHO, CDC). תמיד החזר תשובה בעברית בפורמט JSON בלבד, ללא טקסט נוסף.`;

    const userPrompt = `אזרח של ${nationalityLabel} שנוסע ל${destinationLabel}.

החזר JSON עם השדות הבאים:
- passportValidity: תוקף נדרש לדרכון (לדוגמה "6 חודשים מעבר לתאריך הכניסה")
- visaType: סוג הויזה הנדרשת (למשל "ESTA - פטור מויזה", "ETA", "ויזה רגילה", "פטור מויזה עד 90 יום", וכו')
- visaSummary: סיכום קצר ומדויק של דרישות הכניסה (2-4 משפטים). חשוב מאוד לציין הסדרים עדכניים כמו ESTA לארה"ב, ETA לבריטניה (חובה לישראלים מ-2025), ETIAS לאירופה (כשייכנס לתוקף), eVisa להודו/קניה וכו'.
- documents: מערך מסמכים נדרשים (5-8 פריטים). כל פריט עם:
  - type: passport | visa | vaccination | insurance | document
  - title: שם המסמך בעברית
  - description: תיאור קצר
  - required: true/false
  - source: שם הרשות הרשמית (למשל "UK Home Office", "U.S. CBP")
  - sourceUrl: קישור רשמי

חשוב: וודא שהמידע משקף את המצב הנוכחי בשנת 2026, כולל הסדרים חדשים כמו UK ETA לישראלים.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'return_travel_requirements',
            description: 'Return structured travel requirements',
            parameters: schema
          }
        }],
        tool_choice: { type: 'function', function: { name: 'return_travel_requirements' } }
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('AI gateway error', response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'יותר מדי בקשות, נסה שוב בעוד רגע' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'נגמרו הקרדיטים של Lovable AI' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI ${response.status}: ${text}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error('no tool call returned');

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({
      nationality: nationalityLabel,
      destination: destinationLabel,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('error', err);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});