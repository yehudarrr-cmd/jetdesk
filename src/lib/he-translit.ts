// Hebrew transliteration for English passenger names.
// Best-effort phonetic mapping with overrides for common Israeli names.

const NAME_OVERRIDES: Record<string, string> = {
  AVRAHAM: "אברהם",
  YITZHAK: "יצחק",
  YAAKOV: "יעקב",
  YAKOV: "יעקב",
  YACOV: "יעקב",
  MOSHE: "משה",
  DAVID: "דוד",
  SHLOMO: "שלמה",
  YOSEF: "יוסף",
  YOSSI: "יוסי",
  YEHUDA: "יהודה",
  ELIEZER: "אליעזר",
  LIPA: "ליפא",
  ELIMELECH: "אלימלך",
  MIRIAM: "מרים",
  LEAH: "לאה",
  LEA: "לאה",
  RIVKA: "רבקה",
  SARA: "שרה",
  SARAH: "שרה",
  RACHEL: "רחל",
  CHANA: "חנה",
  HANA: "חנה",
  MALKA: "מלכה",
  AHUVA: "אהובה",
  ZELDA: "זלדה",
  IRIT: "עירית",
  IRIS: "איריס",
  IDO: "עידו",
  DANIEL: "דניאל",
  RAN: "רן",
  YANIV: "יניב",
  NADAV: "נדב",
  KATZAV: "קצב",
  KAHANA: "כהנא",
  HALFON: "חלפון",
  RIMON: "רימון",
  LEV: "לב",
  BASON: "בסון",
  GOLDMAN: "גולדמן",
  FRUMKIN: "פרומקין",
  LEVITZEDEK: "לויצדק",
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
  A: "א", B: "ב", C: "ק", D: "ד", E: "", F: "פ", G: "ג",
  H: "ה", I: "י", J: "ג׳", K: "ק", L: "ל", M: "מ", N: "נ",
  O: "ו", P: "פ", Q: "ק", R: "ר", S: "ס", T: "ט", U: "ו",
  V: "ו", W: "ו", X: "קס", Y: "י", Z: "ז",
};

const FINALS: Record<string, string> = { מ: "ם", נ: "ן", צ: "ץ", פ: "ף", כ: "ך" };

function transliterateWord(word: string): string {
  const upper = word.toUpperCase().replace(/[^A-Z]/g, "");
  if (!upper) return "";
  if (NAME_OVERRIDES[upper]) return NAME_OVERRIDES[upper];

  let s = upper;
  for (const [re, sub] of DIGRAPHS) s = s.replace(re, sub);

  let out = "";
  for (const ch of s) {
    out += LETTERS[ch] ?? ch;
  }
  // Strip leading silent vowel only if word starts with vowel followed by consonant
  // Apply final letter form
  if (out.length > 1) {
    const last = out[out.length - 1];
    if (FINALS[last]) {
      out = out.slice(0, -1) + FINALS[last];
    }
  }
  return out;
}

/**
 * Splits a name like "ELIEZERLIPA KAHANA" into space-separated words and
 * transliterates each. Tries to detect concatenated first names by inserting
 * a space when an override prefix is found.
 */
export function nameToHebrew(englishName: string): string {
  if (!englishName) return "";
  const cleaned = englishName.trim().replace(/\s+/g, " ");
  const words = cleaned.split(" ").flatMap((w) => splitConcatenated(w));
  return words.map(transliterateWord).filter(Boolean).join(" ");
}

function splitConcatenated(word: string): string[] {
  const upper = word.toUpperCase();
  for (const key of Object.keys(NAME_OVERRIDES)) {
    if (key.length >= 3 && upper.startsWith(key) && upper.length > key.length) {
      return [key, ...splitConcatenated(upper.slice(key.length))];
    }
  }
  return [word];
}