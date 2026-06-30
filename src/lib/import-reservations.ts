import * as XLSX from "xlsx";
import { passengerToHebrew, parsePassengerName } from "./he-translit";
import { destinationHe } from "./iata-he";

export type ParsedReservation = {
  rowIndex: number;
  sabrePnr: string;
  supplierPnrs: string[];
  suppliers: string[];
  nameEn: string;
  nameHe: string;
  fare: number | null;
  departDate: string | null; // YYYY-MM-DD
  destCode: string;
  destHe: string;
  type: string;
  agency: string;
  agent: string;
  bookingStatus: string;
  pax: number;
  remarks: string;
};

function splitBr(v: unknown): string[] {
  if (v == null) return [];
  return String(v)
    .split(/<br\s*\/?>/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toIso(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  // dd.mm.yyyy or dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function parseReservationsFile(file: File): Promise<ParsedReservation[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
  return rows.map((r, i) => mapRow(r, i)).filter((r) => r.nameEn);
}

function pick(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    for (const rk of Object.keys(r)) {
      if (rk.trim().toUpperCase() === k.trim().toUpperCase()) return r[rk];
    }
  }
  return null;
}

function mapRow(r: Record<string, unknown>, i: number): ParsedReservation {
  const rawName = String(pick(r, "NAME", "שם", "PASSENGER", "PASSENGER NAME") ?? "").trim();
  // Hebrew template format: "ENGLISH NAME / שם עברית"
  let nameEnFromCombo = "";
  let nameHeFromCombo = "";
  if (rawName.includes(" / ")) {
    const [a, b] = rawName.split(" / ").map((s) => s.trim());
    nameEnFromCombo = a;
    nameHeFromCombo = b;
  }
  const parsed = parsePassengerName(rawName);
  const nameEn = nameEnFromCombo || parsed.cleaned || rawName;
  const supPnrs = splitBr(pick(r, "SUP. PNR", "SUP PNR", "SUPP PNR"));
  const suppliers = splitBr(pick(r, "SUPP.", "SUPP", "SUPPLIER", "ספק", "חברת תעופה"));
  const destRaw = String(pick(r, "DEST", "יעד", "DESTINATION") ?? "").trim();
  const destCode = /^[A-Za-z]{3}$/.test(destRaw) ? destRaw.toUpperCase() : "";
  const destHe = destCode ? destinationHe(destCode) : destRaw;
  const departDate = toIso(pick(r, "DEPART", "DEPARTURE", "תאריך התחלה", "תאריך"));
  const fare = num(pick(r, "SYS. FARE", "SYS FARE", "FARE", "מחיר כולל", "מחיר"));
  const sabrePnr = String(pick(r, "SABRE PNR", "PNR") ?? "").trim();
  const bookingStatus = String(pick(r, "STATUS", "סטטוס") ?? "").trim();
  const remarks = String(pick(r, "REMARKS", "הערות") ?? "").trim();
  return {
    rowIndex: i,
    sabrePnr,
    supplierPnrs: supPnrs,
    suppliers,
    nameEn,
    nameHe: nameHeFromCombo || passengerToHebrew(rawName),
    fare,
    departDate,
    destCode,
    destHe,
    type: splitBr(pick(r, "TYPE")).join(" / "),
    agency: String(pick(r, "AGENCY") ?? "").trim(),
    agent: String(pick(r, "AGENT") ?? "").trim(),
    bookingStatus,
    pax: Number(pick(r, "PAX") ?? 1) || 1,
    remarks,
  };
}