import * as XLSX from "xlsx";
import { nameToHebrew } from "./he-translit";
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
  const nameEn = String(pick(r, "NAME") ?? "").trim();
  const supPnrs = splitBr(pick(r, "SUP. PNR", "SUP PNR", "SUPP PNR"));
  const suppliers = splitBr(pick(r, "SUPP.", "SUPP", "SUPPLIER"));
  const destCode = String(pick(r, "DEST") ?? "").trim().toUpperCase();
  return {
    rowIndex: i,
    sabrePnr: String(pick(r, "SABRE PNR") ?? "").trim(),
    supplierPnrs: supPnrs,
    suppliers,
    nameEn,
    nameHe: nameToHebrew(nameEn),
    fare: num(pick(r, "SYS. FARE", "SYS FARE", "FARE")),
    departDate: toIso(pick(r, "DEPART", "DEPARTURE")),
    destCode,
    destHe: destinationHe(destCode),
    type: splitBr(pick(r, "TYPE")).join(" / "),
    agency: String(pick(r, "AGENCY") ?? "").trim(),
    agent: String(pick(r, "AGENT") ?? "").trim(),
    bookingStatus: String(pick(r, "STATUS") ?? "").trim(),
    pax: Number(pick(r, "PAX") ?? 1) || 1,
    remarks: String(pick(r, "REMARKS") ?? "").trim(),
  };
}