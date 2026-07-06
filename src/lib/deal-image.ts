import dealsAthensImage from "@/assets/deals-athens.jpg";
import dealsBatumiImage from "@/assets/deals-batumi.jpg";
import dealsBulgariaImage from "@/assets/deals-bulgaria.jpg";
import dealsCyprusImage from "@/assets/deals-cyprus.jpg";
import dealsGreeceIslandsImage from "@/assets/deals-greece-islands.jpg";
import dealsTbilisiImage from "@/assets/deals-tbilisi.jpg";

const DEAL_IMAGE_PROXY = "/api/public/deal-image";

export const dealImageUrl = (url?: string | null) => {
  const clean = url?.trim();
  if (!clean || clean.startsWith("data:")) return clean || "";
  if (clean.startsWith(DEAL_IMAGE_PROXY)) return clean;
  return `${DEAL_IMAGE_PROXY}?url=${encodeURIComponent(clean)}`;
};

// Hebrew destination → English prompt for pollinations image generation.
const DEST_TO_PROMPT: Record<string, string> = {
  "רומא": "Rome Italy Colosseum sunset",
  "מילאנו": "Milan Italy Duomo cathedral",
  "ונציה": "Venice Italy canal gondola",
  "נאפולי": "Naples Italy coastline",
  "פראג": "Prague Czech old town Charles bridge",
  "בודפשט": "Budapest Hungary parliament Danube",
  "וינה": "Vienna Austria palace",
  "ברלין": "Berlin Germany skyline",
  "מינכן": "Munich Germany bavaria",
  "פריז": "Paris France Eiffel tower",
  "ניס": "Nice France French riviera beach",
  "ברצלונה": "Barcelona Spain Sagrada Familia",
  "מדריד": "Madrid Spain plaza",
  "מיורקה": "Mallorca Spain beach cove",
  "לונדון": "London England Tower Bridge",
  "אמסטרדם": "Amsterdam Netherlands canals",
  "איסטנבול": "Istanbul Turkey Bosphorus mosque",
  "אנטליה": "Antalya Turkey beach resort",
  "דובאי": "Dubai UAE skyline Burj Khalifa",
  "בנגקוק": "Bangkok Thailand temple",
  "פוקט": "Phuket Thailand tropical beach",
  "באלי": "Bali Indonesia rice terraces beach",
  "בוקרשט": "Bucharest Romania old town",
  "סופיה": "Sofia Bulgaria cathedral",
  "ורנה": "Varna Bulgaria black sea beach",
  "ורשה": "Warsaw Poland old town",
  "קרקוב": "Krakow Poland square",
  "פאפוס": "Paphos Cyprus beach mediterranean",
  "לרנקה": "Larnaca Cyprus seaside",
  "לימסול": "Limassol Cyprus marina",
  "איה נאפה": "Ayia Napa Cyprus beach",
  "סלוניקי": "Thessaloniki Greece waterfront",
  "רודוס": "Rhodes Greece old town beach",
  "כרתים": "Crete Greece beach village",
  "הרקליון": "Heraklion Crete Greece harbor",
  "מיקונוס": "Mykonos Greece white houses windmill",
  "סנטוריני": "Santorini Greece blue domes sunset",
  "קורפו": "Corfu Greece coastline",
  "בטומי": "Batumi Georgia black sea skyline",
  "טביליסי": "Tbilisi Georgia old town",
  "קוטאיסי": "Kutaisi Georgia",
};

const pollinationsImageUrl = (prompt: string) => {
  const seed = Array.from(prompt).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const q = encodeURIComponent(`${prompt}, travel photography, vibrant, cinematic, no text`);
  return `https://image.pollinations.ai/prompt/${q}?width=1200&height=750&nologo=true&seed=${seed}`;
};

export const generatedDestinationImageUrl = (destination?: string | null, country?: string | null) => {
  const text = `${destination ?? ""} ${country ?? ""}`;
  if (/באטומי/.test(text)) return dealsBatumiImage;
  if (/טביליסי/.test(text)) return dealsTbilisiImage;
  if (/בורגס|בולגריה/.test(text)) return dealsBulgariaImage;
  if (/אתונה/.test(text)) return dealsAthensImage;
  if (/פאפוס|איה נאפה|לימסול|לרנקה|קפריסין/.test(text)) return dealsCyprusImage;
  if (/כרתים|הרסוניסוס|רודוס/.test(text)) return dealsGreeceIslandsImage;
  const dest = (destination ?? "").trim();
  const prompt = DEST_TO_PROMPT[dest] ?? (dest ? `${dest} ${country ?? ""} travel destination` : null);
  if (prompt) return pollinationsImageUrl(prompt);
  return dealsGreeceIslandsImage;
};

export const safeDealImageUrl = (
  url?: string | null,
  destination?: string | null,
  country?: string | null,
) => {
  const clean = url?.trim();
  const localFallback = generatedDestinationImageUrl(destination, country);
  if (!clean) return localFallback;
  try {
    const host = new URL(clean).hostname.toLowerCase();
    if (host.endsWith("bstatic.com") || host === "image.pollinations.ai") return localFallback;
  } catch {
    return localFallback;
  }
  return dealImageUrl(clean);
};