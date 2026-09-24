import { seoulDateKey } from "@/core/format";

/**
 * Calendar arithmetic on Seoul day keys ("YYYY-MM-DD") and month keys ("YYYY-MM").
 * Seoul has no daylight saving time, so a fixed +09:00 offset is exact.
 */

const DAY_MS = 86_400_000;

export { seoulDateKey };

export function seoulMonthKey(input: Date | string | number = new Date()): string {
  return seoulDateKey(input).slice(0, 7);
}

/** "2026-09-24" + 3 → "2026-09-27" */
export function addDays(dayKey: string, days: number): string {
  const base = Date.parse(`${dayKey}T00:00:00Z`);
  return new Date(base + days * DAY_MS).toISOString().slice(0, 10);
}

/** "2026-01-31" + 1 → "2026-02-28" (clamped to the month's last day). */
export function addMonths(dayKey: string, months: number): string {
  const [year, month, day] = dayKey.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

/** "2026-09" + -2 → "2026-07" */
export function shiftMonth(monthKey: string, months: number): string {
  return addMonths(`${monthKey}-01`, months).slice(0, 7);
}

/** The `count` month keys ending with the month of `now`, oldest first. */
export function lastMonthKeys(now: Date, count: number): string[] {
  const current = seoulMonthKey(now);
  return Array.from({ length: count }, (_, i) => shiftMonth(current, i - count + 1));
}

/** The `count` day keys ending with the Seoul day of `now`, oldest first. */
export function lastDayKeys(now: Date, count: number): string[] {
  const today = seoulDateKey(now);
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}

/** A Seoul wall-clock time on a given day as an instant: ("2026-09-24", "19:30"). */
export function seoulInstant(dayKey: string, time: string): Date {
  return new Date(`${dayKey}T${time}:00+09:00`);
}

/** The instant a Seoul month key begins. */
export function monthStart(monthKey: string): Date {
  return seoulInstant(`${monthKey}-01`, "00:00");
}

/** The instant the following Seoul month begins (exclusive end of the month). */
export function monthEnd(monthKey: string): Date {
  return monthStart(shiftMonth(monthKey, 1));
}

/** "2026-09" → "9월" (with the year when it differs from `referenceYear`). */
export function monthLabel(monthKey: string, referenceYear?: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  return referenceYear !== undefined && year !== referenceYear ? `${String(year).slice(2)}년 ${month}월` : `${month}월`;
}

export function daysBetween(fromDayKey: string, toDayKey: string): number {
  return Math.round((Date.parse(`${toDayKey}T00:00:00Z`) - Date.parse(`${fromDayKey}T00:00:00Z`)) / DAY_MS);
}
