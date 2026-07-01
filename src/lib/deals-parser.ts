// Parses a quote HTML page from quotes.goldtus.com into a structured deal.
// Runs on the server (fetched via /api/public/parse-deal) — pure regex, no DOM.

export type ParsedDeal = {
  destination: string | null;
  country: string | null;
  hotel: string | null;
  airline: string | null;
  price_from: number | null;
  currency: string;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null;
  nights: number | null;
  image_url: string | null;
  gallery: string[];
  title: string | null;
};

// Common city (Hebrew) → country (Hebrew) map for the destinations Goldtus sells most.
const CITY_TO_COUNTRY: Record<string, string> = {
  "פאפוס": "קפריסין",
  "לרנקה": "קפריסין",
  "אתונה": "יוון",
  "סלוניקי": "יוון",
  "רודוס": "יוון",
  "כרתים": "יוון",
  "הרקליון": "יוון",
  "מיקונוס": "יוון",
  "סנטוריני": "יוון",
  "קורפו": "יוון",
  "בטומי": "גאורגיה",
  "טביליסי": "גאורגיה",
  "קוטאיסי": "גאורגיה",
  "בוקרשט": "רומניה",
  "סופיה": "בולגריה",
  "ורנה": "בולגריה",
  "בורגס": "בולגריה",
  "פראג": "צ'כיה",
  "בודפשט": "הונגריה",
  "וינה": "אוסטריה",
  "ברלין": "גרמניה",
  "מינכן": "גרמניה",
  "פרנקפורט": "גרמניה",
  "פריז": "צרפת",
  "ניס": "צרפת",
  "רומא": "איטליה",
  "מילאנו": "איטליה",
  "ונציה": "איטליה",
  "נאפולי": "איטליה",
  "ברצלונה": "ספרד",
  "מדריד": "ספרד",
  "מיורקה": "ספרד",
  "איביזה": "ספרד",
  "לונדון": "בריטניה",
  "אמסטרדם": "הולנד",
  "בריסל": "בלגיה",
  "קופנהגן": "דנמרק",
  "סטוקהולם": "שוודיה",
  "אוסלו": "נורווגיה",
  "ורשה": "פולין",
  "קרקוב": "פולין",
  "איסטנבול": "טורקיה",
  "אנטליה": "טורקיה",
  "דובאי": "איחוד האמירויות",
  "אבו דאבי": "איחוד האמירויות",
  "בנגקוק": "תאילנד",
  "פוקט": "תאילנד",
  "באלי": "אינדונזיה",
  "טוקיו": "יפן",
  "ניו יורק": "ארה\"ב",
  "לוס אנג'לס": "ארה\"ב",
  "מיאמי": "ארה\"ב",
};

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(s: string): string {
  return decode(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function normalizeImageUrl(raw: string): string | null {
  const clean = decode(raw);
  try {
    const url = new URL(clean, "https://quotes.goldtus.com");
    if (url.protocol !== "https:") return null;
    const href = url.toString();
    if (/\/branding\//i.test(href) || /logo/i.test(href)) return null;
    if (!/(bstatic\.com|tripcdn\.com|image\.pollinations\.ai|quotes\.goldtus\.com|goldtus\.com)/i.test(url.hostname)) return null;
    return href;
  } catch {
    return null;
  }
}

const HEBREW_MONTHS: Record<string, number> = {
  "ינואר": 1, "פברואר": 2, "מרץ": 3, "מרס": 3, "אפריל": 4, "מאי": 5,
  "יוני": 6, "יולי": 7, "אוגוסט": 8, "ספטמבר": 9, "אוקטובר": 10,
  "נובמבר": 11, "דצמבר": 12,
};

function parseHebrewDate(s: string): string | null {
  // Matches "17 ביולי 2026" / "3 באוגוסט 2026"
  const m = s.match(/(\d{1,2})\s+ב?([\u0590-\u05FF]+)\s+(\d{4})/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = HEBREW_MONTHS[m[2]];
  const year = parseInt(m[3], 10);
  if (!month) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseQuoteHtml(html: string): ParsedDeal {
  const result: ParsedDeal = {
    destination: null, country: null, hotel: null, airline: null,
    price_from: null, currency: "ILS", start_date: null, end_date: null,
    nights: null, image_url: null, gallery: [], title: null,
  };

  // Destination from og:title "פאפוס · goldtus"
  const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i);
  if (ogTitle) {
    const t = decode(ogTitle[1]);
    result.title = t;
    const before = t.split("·")[0].trim();
    if (before) result.destination = before;
  }

  // Country lookup
  if (result.destination && CITY_TO_COUNTRY[result.destination]) {
    result.country = CITY_TO_COUNTRY[result.destination];
  }

  // Hero / og:image
  const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (ogImage) result.image_url = normalizeImageUrl(ogImage[1]);

  // Hotel: uppercase Latin name that repeats (appears in hotel section)
  const hotelMatches = Array.from(
    html.matchAll(/>([A-Z][A-Z0-9 &.'()\-]{5,})</g),
  ).map((m) => m[1].trim());
  if (hotelMatches.length) {
    const counts = new Map<string, number>();
    for (const h of hotelMatches) counts.set(h, (counts.get(h) ?? 0) + 1);
    // pick the most-repeated CAPS phrase
    const [top] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    if (top && top[1] >= 2) result.hotel = top[0];
    else result.hotel = hotelMatches[0];
  }

  // Price "₪3,300" (take smallest = "from")
  const prices = Array.from(html.matchAll(/₪\s*([\d,]+)/g))
    .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
    .filter((n) => Number.isFinite(n) && n > 100);
  if (prices.length) result.price_from = Math.min(...prices);

  // Airline
  const airline = html.match(
    /(Israir|Arkia airlines|Arkia|El Al|EL AL|Ryanair|Wizz Air|EasyJet|Aegean|Tus Airways|Blue Bird|Cyprus Airways|Turkish Airlines|Pegasus|Air France|Lufthansa|KLM|British Airways|Sun d\W?or|Sundor)/i,
  );
  if (airline) result.airline = airline[1];

  // Dates: "YYYY-MM-DD" appears in the flight blocks; use min/max.
  const isoDates = Array.from(html.matchAll(/"(\d{4}-\d{2}-\d{2})"/g))
    .map((m) => m[1]);
  if (isoDates.length >= 2) {
    const sorted = [...new Set(isoDates)].sort();
    result.start_date = sorted[0];
    result.end_date = sorted[sorted.length - 1];
  } else {
    // fallback: Hebrew dates from the summary
    const text = stripTags(html);
    const heDates = Array.from(text.matchAll(/\d{1,2}\s+ב?[\u0590-\u05FF]+\s+\d{4}/g))
      .map((m) => parseHebrewDate(m[0])).filter((d): d is string => !!d);
    if (heDates.length >= 2) {
      const sorted = [...new Set(heDates)].sort();
      result.start_date = sorted[0];
      result.end_date = sorted[sorted.length - 1];
    }
  }

  // Nights
  const nights = html.match(/>(\d{1,2})<\/[a-z]+>\s*<[^>]+>[^<]*לילות/);
  if (nights) result.nights = parseInt(nights[1], 10);
  else if (result.start_date && result.end_date) {
    const a = new Date(result.start_date).getTime();
    const b = new Date(result.end_date).getTime();
    if (b > a) result.nights = Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  // Gallery: hotel images
  const gallery = [
    ...Array.from(html.matchAll(/https:\/\/[^"'\s)]+(?:bstatic\.com|tripcdn\.com|image\.pollinations\.ai)[^"'\s)]*/g)).map((m) => m[0]),
    ...Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map((m) => m[1]),
  ]
    .map((src) => normalizeImageUrl(src))
    .filter((src): src is string => !!src);
  result.gallery = [...new Set(gallery)].slice(0, 8);

  // If no og:image was set, use the first gallery photo as the hero.
  if (!result.image_url && result.gallery.length > 0) {
    result.image_url = result.gallery[0];
  }

  return result;
}