/**
 * Calendar-day arithmetic on "YYYY-MM-DD" keys (Asia/Seoul days, see `seoulDateKey`).
 * Keys are treated as plain dates: no time zone, no clock, so the math is exact.
 */

export type DateKey = string;
/** "YYYY-MM" */
export type MonthKey = string;

const KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export function isDateKey(value: string): value is DateKey {
  const match = KEY_PATTERN.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function toUtc(key: DateKey): number {
  const match = KEY_PATTERN.exec(key);
  if (!match) throw new Error(`Invalid date key: ${key}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function fromUtc(ms: number): DateKey {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(key: DateKey, days: number): DateKey {
  return fromUtc(toUtc(key) + days * DAY_MS);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: DateKey, to: DateKey): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(key: DateKey): number {
  return (new Date(toUtc(key)).getUTCDay() + 6) % 7;
}

/** The Monday of the key's week. */
export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, -weekdayIndex(key));
}

export function monthOf(key: DateKey): MonthKey {
  return key.slice(0, 7);
}

export function addMonths(month: MonthKey, months: number): MonthKey {
  const [y, m] = month.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, "0")}`;
}

/** The last `count` months ending with `last`, oldest first. */
export function monthRange(last: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, i) => addMonths(last, i - count + 1));
}

/** "2026-09" → "9월" */
export function monthLabel(month: MonthKey): string {
  return `${Number(month.slice(5, 7))}월`;
}

/** "2026-09-24" → "9.24" */
export function shortDay(key: DateKey): string {
  return `${Number(key.slice(5, 7))}.${Number(key.slice(8, 10))}`;
}

/** "2026-09-24" → "2026. 9. 24." (document style) */
export function longDay(key: DateKey): string {
  return `${key.slice(0, 4)}. ${Number(key.slice(5, 7))}. ${Number(key.slice(8, 10))}.`;
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function weekdayLabel(key: DateKey): string {
  return WEEKDAYS[weekdayIndex(key)];
}

/** "D-3", "D-day", "D+5" relative to today. */
export function dDay(target: DateKey, today: DateKey): string {
  const diff = daysBetween(today, target);
  if (diff === 0) return "D-day";
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
}
