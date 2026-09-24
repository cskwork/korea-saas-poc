/**
 * Calendar-day arithmetic on "YYYY-MM-DD" keys (Asia/Seoul days are produced by
 * `seoulDateKey`; everything here is time-zone free).
 */

const DAY_MS = 86_400_000;

function toUtc(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  return fromUtc(toUtc(key) + days * DAY_MS);
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

/** "2026-09" */
export function monthOf(key: string): string {
  return key.slice(0, 7);
}

/** Month keys ending at `month`, oldest first: lastMonths("2026-09", 3) → ["2026-07","2026-08","2026-09"]. */
export function lastMonths(month: string, count: number): string[] {
  const [y, m] = month.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return date.toISOString().slice(0, 7);
  });
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** "9월" */
export function monthLabel(month: string): string {
  return `${Number(month.slice(5, 7))}월`;
}

export interface DueState {
  days: number;
  /** "D-3", "오늘 마감", "2일 지남" */
  label: string;
  tone: "overdue" | "today" | "soon" | "later";
}

export function dueState(dueDate: string, today: string): DueState {
  const days = daysBetween(today, dueDate);
  if (days < 0) return { days, label: `${-days}일 지남`, tone: "overdue" };
  if (days === 0) return { days, label: "오늘 마감", tone: "today" };
  return { days, label: `D-${days}`, tone: days <= 2 ? "soon" : "later" };
}
