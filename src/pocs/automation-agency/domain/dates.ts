/** Calendar-day arithmetic on "YYYY-MM-DD" keys (Asia/Seoul days, no time zone drift). */

export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonths(dateKey: string, months: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

/** "2026-09" → "9월" (with the year when it differs from `currentYear`). */
export function monthLabel(monthKey: string, currentYear?: number): string {
  const [y, m] = monthKey.split("-").map(Number);
  return currentYear !== undefined && y !== currentYear ? `${String(y).slice(2)}년 ${m}월` : `${m}월`;
}
