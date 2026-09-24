import { formatDate, formatKrw, formatMonthDay, formatNumber, formatPercent, formatTime } from "@/core/format";

/** Display helpers shared by the module's components (Asia/Seoul, Korean). */

/** "9. 29." */
export const shortDate = (input: Date | string) => formatDate(input, { month: "numeric", day: "numeric" });

/** "9월 29일 (화) 07:00" */
export const dayAndTime = (input: Date) => `${formatMonthDay(input)} ${formatTime(input)}`;

/** "2026년 9월 22일" */
export const longDate = (input: Date | string) => formatDate(input, { dateStyle: "long" });

export const won = formatKrw;
export const people = (n: number) => `${formatNumber(n)}명`;
export const percent = (ratio: number) => formatPercent(ratio, 1);

/** Axis ticks in 만 원 for money: 1500000 → "150만". */
export function wonTick(value: number): string {
  if (value === 0) return "0";
  if (value >= 100_000_000) return `${formatNumber(value / 100_000_000, 1)}억`;
  return `${formatNumber(value / 10_000)}만`;
}

/** "2026-09-22" → "9.22" (chart axes). */
export function dotDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${month}.${day}`;
}

/** "2026-09-22" → "9월 22일" */
export function monthDayKey(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${month}월 ${day}일`;
}
