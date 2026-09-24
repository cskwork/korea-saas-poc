/**
 * Calendar and clock arithmetic for the shop's book. Pure functions over plain values:
 * a day is a "YYYY-MM-DD" key in Asia/Seoul, a time of day is minutes from midnight.
 */

export const SLOT_MINUTES = 30;
export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** The shop's "now": today's date key and the minute of the day in Asia/Seoul. */
export interface Clock {
  date: string;
  minute: number;
}

const seoulParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function seoulClock(instant: Date = new Date()): Clock {
  const parts = Object.fromEntries(seoulParts.formatToParts(instant).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minute: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateKey(value: string): boolean {
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

function toUtc(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`);
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateKey: string, days: number): string {
  const date = toUtc(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** 0 = 일요일 … 6 = 토요일 */
export function weekdayOf(dateKey: string): number {
  return toUtc(dateKey).getUTCDay();
}

/** Monday of the week that holds `dateKey` (Korean calendars and shop weeks start on Monday). */
export function startOfWeek(dateKey: string): string {
  const offset = (weekdayOf(dateKey) + 6) % 7;
  return addDays(dateKey, -offset);
}

export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function isMonthKey(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return fromUtc(date).slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export interface MonthCell {
  date: string;
  inMonth: boolean;
  weekday: number;
}

/** Sunday-first weeks covering the whole month, padded with the neighbouring months' days. */
export function monthGrid(monthKey: string): MonthCell[] {
  const first = `${monthKey}-01`;
  const start = addDays(first, -weekdayOf(first));
  const last = `${monthKey}-${String(daysInMonth(monthKey)).padStart(2, "0")}`;
  const end = addDays(last, 6 - weekdayOf(last));
  const cells: MonthCell[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) {
    cells.push({ date: day, inMonth: monthKeyOf(day) === monthKey, weekday: weekdayOf(day) });
  }
  return cells;
}

/** 600 → "10:00" */
export function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "10:30" → 630; null when not a valid HH:MM. */
export function parseTime(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** Slot start minutes within opening hours, e.g. 10:00, 10:30 … 19:30 for 10:00–20:00. */
export function slotStarts(openMinute: number, closeMinute: number, step = SLOT_MINUTES): number[] {
  const starts: number[] = [];
  for (let minute = openMinute; minute + step <= closeMinute; minute += step) starts.push(minute);
  return starts;
}

/** Number of slots a service of `duration` minutes occupies (a 20분 드라이 still takes one slot). */
export function slotSpan(duration: number, step = SLOT_MINUTES): number {
  return Math.max(1, Math.ceil(duration / step));
}

/** "9월 24일 (목)" */
export function formatDayLabel(dateKey: string): string {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${m}월 ${d}일 (${WEEKDAY_LABELS[weekdayOf(dateKey)]})`;
}

/** "2026년 9월 24일 (목)" */
export function formatLongDayLabel(dateKey: string): string {
  return `${dateKey.slice(0, 4)}년 ${formatDayLabel(dateKey)}`;
}

/** "2026년 9월" */
export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${y}년 ${m}월`;
}

/** "오늘", "내일", "모레", or the day label. */
export function relativeDayLabel(dateKey: string, today: string): string {
  const diff = daysBetween(today, dateKey);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === 2) return "모레";
  if (diff === -1) return "어제";
  return formatDayLabel(dateKey);
}

/** "오늘", "내일", "모레", or a short "9/27 (일)" for narrow columns. */
export function shortDayLabel(dateKey: string, today: string): string {
  const diff = daysBetween(today, dateKey);
  if (diff >= -1 && diff <= 2) return relativeDayLabel(dateKey, today);
  const [, m, d] = dateKey.split("-").map(Number);
  return `${m}/${d} (${WEEKDAY_LABELS[weekdayOf(dateKey)]})`;
}

/** Has the booking's start already passed on the shop's clock? */
export function isPast(date: string, startMinute: number, clock: Clock): boolean {
  return date < clock.date || (date === clock.date && startMinute < clock.minute);
}

/** Is it too late to book a slot starting at `startMinute`? (A slot starting this minute is gone.) */
export function hasBegun(date: string, startMinute: number, clock: Clock): boolean {
  return date < clock.date || (date === clock.date && startMinute <= clock.minute);
}

/** "매주 월요일 휴무" / "휴무일 없음" */
export function formatClosedWeekdays(closed: readonly number[]): string {
  if (closed.length === 0) return "휴무일 없음";
  const labels = [...closed].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => `${WEEKDAY_LABELS[d]}요일`);
  return `매주 ${labels.join("·")} 휴무`;
}
