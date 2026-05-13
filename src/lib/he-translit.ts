// Hebrew transliteration for English passenger names from GDS feeds.

const NAME_OVERRIDES: Record<string, string> = {
  // Male
  AVRAHAM: "אברהם", AVRUMI: "אברומי", YITZHAK: "יצחק", YITZCHAK: "יצחק",
  YAAKOV: "יעקב", YAKOV: "יעקב", YACOV: "יעקב", YANKEL: "יענקל",
  MOSHE: "משה", MOISHE: "משה", DAVID: "דוד", DOVID: "דוד", DUDI: "דודי",
  SHLOMO: "שלמה", YOSEF: "יוסף", YOSSI: "יוסי", YOSI: "יוסי",
  YEHUDA: "יהודה", YEHUDAH: "יהודה",
  ELIEZER: "אליעזר", ELI: "אלי", ELIYAHU: "אליהו",
  LIPA: "ליפא", LIPMAN: "ליפמן", LIPMANN: "ליפמן",
  ELIMELECH: "אלימלך", MENACHEM: "מנחם", MENDEL: "מענדל",
  MORDECHAI: "מרדכי", MORDCHE: "מרדכי", MOTI: "מוטי",
  SHMUEL: "שמואל", SHMULIK: "שמוליק",
  CHAIM: "חיים", HAIM: "חיים",
  YISRAEL: "ישראל", ISRAEL: "ישראל", SRULI: "שרולי",
  ITZIK: "איציק", ITZHAK: "יצחק",
  EYAL: "אייל", EYTAN: "איתן", ETAN: "איתן",
  ADAM: "אדם", AVI: "אבי", AMIR: "אמיר", ASAF: "אסף", ASSAF: "אסף",
  TOMER: "תומר", LIRAN: "לירן", IDAN: "עידן",
  DANIEL: "דניאל", DAN: "דן", RAN: "רן",
  YANIV: "יניב", NADAV: "נדב", IDO: "עידו", OFER: "עופר",
  GUY: "גיא", GAL: "גל", OR: "אור", URI: "אורי", URIEL: "אוריאל",
  TAL: "טל", BEN: "בן", BENNY: "בני", BENI: "בני",
  YONATAN: "יונתן", JONATHAN: "יונתן", NATAN: "נתן",
  RAFI: "רפי", RAFAEL: "רפאל", REFAEL: "רפאל",
  AHARON: "אהרון", AARON: "אהרון",
  PINCHAS: "פנחס", PINCHOS: "פנחס",
  NOAM: "נועם", NIR: "ניר", ROY: "רועי", ROEE: "רועי",
  AMIT: "עמית", OMER: "עומר", OMRI: "עומרי",
  AVISHAI: "אבישי", AVNER: "אבנר",
  ARI: "ארי", ARYE: "אריה", ARIEL: "אריאל",

  // Female
  MIRIAM: "מרים", LEAH: "לאה", LEA: "לאה",
  RIVKA: "רבקה", SARA: "שרה", SARAH: "שרה",
  RACHEL: "רחל", RAHEL: "רחל",
  CHANA: "חנה", HANA: "חנה", HANNA: "חנה", HANNAH: "חנה",
  MALKA: "מלכה", AHUVA: "אהובה", ZELDA: "זלדה",
  IRIT: "עירית", IRIS: "איריס", INBAL: "ענבל",
  ESTHER: "אסתר", ESTI: "אסתי",
  SHIRA: "שירה", SHIRI: "שירי",
  YAEL: "יעל", MAYA: "מאיה", NOA: "נועה",
  TAMAR: "תמר", TALIA: "טליה",
  AVIVA: "אביבה", BATYA: "בתיה", BATSHEVA: "בת שבע",
  DEVORAH: "דבורה", DVORA: "דבורה",
  GITTY: "גיטי", GITEL: "גיטל",
  BRACHA: "ברכה", BRACHAH: "ברכה",
  ROCHEL: "רחל", RUCHIE: "רוחי",
  TZIPPORA: "ציפורה", TZIPPI: "ציפי",
  SHEINDEL: "שיינדל", SHEINY: "שייני",

  // Common surnames
  COHEN: "כהן", KOHEN: "כהן", KAHANA: "כהנא",
  LEVI: "לוי", LEVY: "לוי", LEV: "לב",
  KATZ: "כץ", KATZAV: "קצב",
  HALFON: "חלפון", RIMON: "רימון",
  GOLDMAN: "גולדמן", GOLDBERG: "גולדברג", GOLDSTEIN: "גולדשטיין",
  FRUMKIN: "פרומקין", FRIEDMAN: "פרידמן",
  ROSENBERG: "רוזנברג", ROSEN: "רוזן",
  WEISS: "ווייס", WEISMAN: "וייסמן",
  KLEIN: "קליין", SCHWARTZ: "שוורץ",
  GREENBERG: "גרינברג", BERG: "ברג",
  STERN: "שטרן", SHTERN: "שטרן",
  BASON: "בסון", LEVITZEDEK: "לויצדק",
  MAMOU: "ממו", MIZRAHI: "מזרחי", MIZRACHI: "מזרחי",
  PERETZ: "פרץ", AMAR: "עמר", BITON: "ביטון",
  CLIFF: "קליף",
};

const DIGRAPHS: Array<[RegExp, string]> = [
  [/SHCH/g, "שצ׳"],
  [/TSCH/g, "צ׳"],
  [/TCH/g, "צ׳"],
  [/SCH/g, "ש"],
  [/SH/g, "ש"],
  [/CH/g, "ח"],
  [/TS/g, "צ"],
  [/TZ/g, "צ"],
  [/TH/g, "ת"],
  [/PH/g, "פ"],
  [/CK/g, "ק"],
  [/QU/g, "קו"],
];

const LETTERS: Record<string, string> = {
  A: "א", B: "ב", C: "ק", D: "ד", E: "א", F: "פ", G: "ג",
  H: "ה", I: "י", J: "ג׳", K: "ק", L: "ל", M: "מ", N: "נ",
  O: "ו", P: "פ", Q: "ק", R: "ר", S: "ס", T: "ט", U: "ו",
  V: "ו", W: "ו", X: "קס", Y: "י", Z: "ז",
};

const FINALS: Record<string, string> = { מ: "ם", נ: "ן", צ: "ץ", פ: "ף", כ: "ך" };

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const OVERRIDE_KEYS = Object.keys(NAME_OVERRIDES).sort((a, b) => b.length - a.length);

function transliterateWord(word: string): string {
  const upper = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!upper) return "";
  if (NAME_OVERRIDES[upper]) return NAME_OVERRIDES[upper];

  let s = upper;
  // Drop leading silent E? keep as א via LETTERS["E"]="א"
  for (const [re, sub] of DIGRAPHS) s = s.replace(re, sub);

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    // Skip "E" inside the word (silent), but keep it at start/end
    if (ch === "E" && i > 0 && i < s.length - 1) continue;
    out += LETTERS[ch] ?? ch;
  }
  if (out.length > 1) {
    const last = out[out.length - 1];
    if (FINALS[last]) out = out.slice(0, -1) + FINALS[last];
  }
  return out;
}

/** Greedy split a glued uppercase word using known names + vowel-consonant heuristic. */
function splitConcatenated(word: string): string[] {
  const upper = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (upper.length <= 6) return [upper];

  // Try known prefix
  for (const key of OVERRIDE_KEYS) {
    if (key.length >= 3 && upper.startsWith(key) && upper.length > key.length + 2) {
      const rest = upper.slice(key.length);
      return [key, ...splitConcatenated(rest)];
    }
  }
  // Try known suffix
  for (const key of OVERRIDE_KEYS) {
    if (key.length >= 3 && upper.endsWith(key) && upper.length > key.length + 2) {
      const head = upper.slice(0, upper.length - key.length);
      return [...splitConcatenated(head), key];
    }
  }
  // Heuristic: split at vowel→consonant boundary closest to middle, ensuring both parts >=3
  const mid = Math.floor(upper.length / 2);
  let bestCut = -1;
  let bestDist = Infinity;
  for (let i = 3; i <= upper.length - 3; i++) {
    const prev = upper[i - 1];
    const cur = upper[i];
    if (VOWELS.has(prev) && !VOWELS.has(cur)) {
      const d = Math.abs(i - mid);
      if (d < bestDist) { bestDist = d; bestCut = i; }
    }
  }
  if (bestCut > 0) {
    return [upper.slice(0, bestCut), ...splitConcatenated(upper.slice(bestCut))];
  }
  return [upper];
}

export function nameToHebrew(englishName: string): string {
  if (!englishName) return "";
  const cleaned = englishName.trim().replace(/\s+/g, " ");
  const words = cleaned.split(/[\s\-]+/).flatMap((w) => splitConcatenated(w));
  return words.map(transliterateWord).filter(Boolean).join(" ");
}

// Sabre/GDS noise tokens that show up after the name
const SABRE_SUFFIXES = new Set([
  "MR", "MRS", "MS", "MSTR", "MISS", "DR", "PROF",
  "CHD", "INF", "INFT", "ADT",
  "CENFMT", "FSULNA", "FSULNAJDLR", "FSULNAJDR",
]);

/**
 * Parse a passenger string from a reservations export.
 * Examples:
 *  "GOLDMAN/ELIEZERLIPMAN 13227874"  -> { last: "GOLDMAN", first: "ELIEZER LIPMAN" }
 *  "EYAL/ADAMCLIFF"                  -> { last: "EYAL",    first: "ADAM CLIFF" }
 *  "MAMOU/TOMERMORDECHAI FSULNA"     -> { last: "MAMOU",   first: "TOMER MORDECHAI" }
 */
export function parsePassengerName(raw: string): { last: string; first: string; cleaned: string } {
  if (!raw) return { last: "", first: "", cleaned: "" };
  let s = raw.toUpperCase().trim();

  // Strip trailing numeric booking codes / IDs
  s = s.replace(/\s+\d{4,}\s*$/g, "").trim();

  // Strip trailing Sabre noise tokens (may be several)
  let changed = true;
  while (changed) {
    changed = false;
    const m = s.match(/[\s/]([A-Z]+)\s*$/);
    if (m && SABRE_SUFFIXES.has(m[1])) {
      s = s.slice(0, s.length - m[0].length).trim();
      changed = true;
    }
  }

  const slash = s.indexOf("/");
  let last = "";
  let firstPart = s;
  if (slash > 0) {
    last = s.slice(0, slash).trim();
    firstPart = s.slice(slash + 1).trim();
  }

  // Split first names by space, then ungllue each
  const firstWords = firstPart.split(/\s+/).flatMap((w) => splitConcatenated(w));
  const lastWords = last.split(/\s+/).flatMap((w) => splitConcatenated(w));

  return {
    last: lastWords.join(" "),
    first: firstWords.join(" "),
    cleaned: s,
  };
}

/** Convert a parsed passenger name into Hebrew, ordered "First Last". */
export function passengerToHebrew(raw: string): string {
  const { last, first } = parsePassengerName(raw);
  const heFirst = nameToHebrew(first);
  const heLast = nameToHebrew(last);
  return [heFirst, heLast].filter(Boolean).join(" ");
}
