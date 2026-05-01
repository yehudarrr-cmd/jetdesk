// Server-only Telegram gateway helpers
const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

function getKeys() {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY not configured");
  return { LOVABLE_API_KEY, TELEGRAM_API_KEY };
}

export async function tgCall(method: string, body: Record<string, unknown>) {
  const { LOVABLE_API_KEY, TELEGRAM_API_KEY } = getKeys();
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Telegram ${method} failed [${res.status}]: ${JSON.stringify(data)}`);
  return data;
}

export async function sendMessage(chatId: number, text: string) {
  return tgCall("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

export async function getUpdates(offset: number, timeout = 0) {
  return tgCall("getUpdates", { offset, timeout, allowed_updates: ["message"] });
}