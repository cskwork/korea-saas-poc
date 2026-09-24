/**
 * Calendar arithmetic in Asia/Seoul on plain "YYYY-MM-DD" day keys and "YYYY-MM"
 * month keys. Korea has observed a fixed UTC+9 offset since 1988, so a constant
 * offset is exact and keeps these helpers pure and fast.
 */

const OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Wall-clock parts of an instant in Seoul. `weekday`: 1 = 월 … 7 = 일. */
export function seoulParts(instant: Date) {
  const shifted = new Date(instant.getTime() + OFFSET_MS);
  const weekday = ((shifted.getUTCDay() + 6) % 7) + 1;
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday,
  };
}

export function dayKey(instant: Date): string {
  const p = seoulParts(instant);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function monthKey(instant: Date): string {
  const p = seoulParts(instant);
  return `${p.year}-${pad(p.month)}`;
}

function parseDayKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

/** The instant Seoul's day `key` starts (00:00 KST). */
export function startOfDay(key: string): Date {
  const { year, month, day } = parseDayKey(key);
  return new Date(Date.UTC(year, month - 1, day) - OFFSET_MS);
}

/** Seoul wall-clock time → instant. */
export function seoulInstant(key: string, hour: number, minute = 0): Date {
  return new Date(startOfDay(key).getTime() + (hour * 60 + minute) * 60_000);
}

export function addDays(key: string, days: number): string {
  const { year, month, day } = parseDayKey(key);
  const next = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const a = parseDayKey(from);
  const b = parseDayKey(to);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS);
}

/** 1 = 월 … 7 = 일 */
export function weekdayOf(key: string): number {
  const { year, month, day } = parseDayKey(key);
  return ((new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7) + 1;
}

/** Monday of the week containing `key`. */
export function mondayOf(key: string): string {
  return addDays(key, 1 - weekdayOf(key));
}

export function daysInMonth(month: string): number {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m, 0)).getUTCDate();
}

export function addMonths(month: string, count: number): string {
  const [year, m] = month.split("-").map(Number);
  const index = year * 12 + (m - 1) + count;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

/** "2026-09" → "9월"; with the year: "2026년 9월". */
export function monthLabel(month: string, withYear = false): string {
  const [year, m] = month.split("-").map(Number);
  return withYear ? `${year}년 ${m}월` : `${m}월`;
}

/** "2026-09-24" → "9월 24일 (목)" */
export function dayLabel(key: string): string {
  const { month, day } = parseDayKey(key);
  return `${month}월 ${day}일 (${WEEKDAYS[weekdayOf(key) - 1]})`;
}

/** "2026-09-24" → "9/24" */
export function shortDayLabel(key: string): string {
  const { month, day } = parseDayKey(key);
  return `${month}/${day}`;
}

const ORDINALS = ["첫째", "둘째", "셋째", "넷째", "다섯째"] as const;

/**
 * "9월 넷째 주" for the week starting on `monday`. A week belongs to the month
 * that holds its Thursday (the usual Korean and ISO convention).
 */
export function weekLabel(monday: string): string {
  const thursday = parseDayKey(addDays(monday, 3));
  return `${thursday.month}월 ${ORDINALS[Math.ceil(thursday.day / 7) - 1]} 주`;
}
