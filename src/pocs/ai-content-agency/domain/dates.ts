/**
 * Calendar-day arithmetic on "YYYY-MM-DD" keys (Asia/Seoul days, as produced by
 * `seoulDateKey`). Keys are treated as UTC midnights so no time zone can shift them.
 */

const DAY_MS = 86_400_000;
const KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): boolean {
  if (!KEY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toUtc(key: string): number {
  return Date.parse(`${key}T00:00:00Z`);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return fromUtc(toUtc(key) + days * DAY_MS);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(key: string): number {
  return (new Date(toUtc(key)).getUTCDay() + 6) % 7;
}

/** Monday of the key's week. */
export function startOfWeek(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

/** Adds working days, skipping Saturdays and Sundays. */
export function addBusinessDays(key: string, days: number): string {
  let current = key;
  let remaining = days;
  while (remaining > 0) {
    current = addDays(current, 1);
    if (weekdayIndex(current) < 5) remaining -= 1;
  }
  return current;
}

/** "2026-09" for a key. */
export function monthKey(key: string): string {
  return key.slice(0, 7);
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function weekdayLabel(key: string): string {
  return WEEKDAYS[weekdayIndex(key)];
}

/** "9.24" */
export function shortDate(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(month)}.${Number(day)}`;
}

/** "9월 24일 (목)" */
export function longDate(key: string): string {
  const [, month, day] = key.split("-");
  return `${Number(month)}월 ${Number(day)}일 (${weekdayLabel(key)})`;
}

/** The instant a Seoul calendar day begins (for range queries on timestamps). */
export function seoulMidnight(key: string): Date {
  return new Date(`${key}T00:00:00+09:00`);
}

/** First day of the key's month and of the following month. */
export function monthRange(key: string): { start: string; next: string } {
  const [year, month] = key.split("-").map(Number);
  const next = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  return { start: `${key.slice(0, 7)}-01`, next };
}
