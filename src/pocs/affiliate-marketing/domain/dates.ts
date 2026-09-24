/**
 * Calendar-day arithmetic on "YYYY-MM-DD" keys in Asia/Seoul (UTC+9, no DST).
 * Keys are compared as strings; arithmetic runs in UTC so it never drifts.
 */

const DAY_MS = 86_400_000;

function toUtc(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return fromUtc(new Date(toUtc(key).getTime() + days * DAY_MS));
}

/** Inclusive list of day keys from `from` to `to`. */
export function dayRange(from: string, to: string): string[] {
  const days: string[] = [];
  for (let key = from; key <= to; key = addDays(key, 1)) days.push(key);
  return days;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS);
}

export function monthStart(key: string): string {
  return `${key.slice(0, 7)}-01`;
}

export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function monthEnd(key: string): string {
  return `${key.slice(0, 7)}-${String(daysInMonth(key)).padStart(2, "0")}`;
}

/** First day of the month `offset` months away (negative = earlier). */
export function shiftMonth(key: string, offset: number): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + offset, 1));
  return fromUtc(date);
}

/** Start of the Seoul day as an instant. */
export function seoulDayStart(key: string): Date {
  return new Date(`${key}T00:00:00+09:00`);
}

/** Half-open instant range [from 00:00, day after `to` 00:00) in Seoul. */
export function seoulRange(from: string, to: string): { start: Date; end: Date } {
  return { start: seoulDayStart(from), end: seoulDayStart(addDays(to, 1)) };
}

/** "9월" */
export function monthLabel(key: string): string {
  return `${Number(key.slice(5, 7))}월`;
}

/** "9/24" */
export function shortDayLabel(key: string): string {
  return `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;
}

export function isDayKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}
