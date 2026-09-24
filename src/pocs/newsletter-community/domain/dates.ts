/**
 * Calendar helpers in Asia/Seoul. Korea has no daylight saving, so a fixed
 * +09:00 offset converts exactly between instants and Seoul wall-clock times.
 */

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Seoul calendar date ("YYYY-MM-DD") and time ("HH:MM") of an instant. */
export function seoulParts(instant: Date): { date: string; time: string } {
  const iso = new Date(instant.getTime() + SEOUL_OFFSET_MS).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/** The instant of a Seoul wall-clock date and time. */
export function seoulInstant(dateKey: string, time = "00:00"): Date {
  return new Date(`${dateKey}T${time}:00+09:00`);
}

export function addDays(dateKey: string, days: number): string {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** "2026-09-24" → "2026-09" */
export function monthOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/** First and last calendar day of a month key. */
export function monthRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
}

/** The `count` month keys ending with the month of `today`, oldest first. */
export function recentMonths(today: string, count: number): string[] {
  const [year, mon] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, mon - 1 - (count - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

/** "2026-09" → "9월" */
export function monthLabel(month: string): string {
  return `${Number(month.slice(5, 7))}월`;
}
