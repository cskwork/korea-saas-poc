import { dayRange, daysInMonth } from "./dates";

/** Pure arithmetic behind every number on the dashboards (all inputs are aggregated rows). */

export interface Totals {
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface DayPoint extends Totals {
  day: string;
}

export const emptyTotals = (): Totals => ({ clicks: 0, conversions: 0, revenue: 0 });

/** Conversion rate (orders ÷ clicks), 0 when there were no clicks. */
export function conversionRate(conversions: number, clicks: number): number {
  return clicks > 0 ? conversions / clicks : 0;
}

/** Earnings per click in won (the shelf label's 단위가격). */
export function earningsPerClick(revenue: number, clicks: number): number {
  return clicks > 0 ? revenue / clicks : 0;
}

export type Direction = "up" | "down" | "flat";

export interface Delta {
  direction: Direction;
  /** Relative change; null when the previous value was 0 (no meaningful percentage). */
  ratio: number | null;
  difference: number;
}

export function delta(current: number, previous: number): Delta {
  const difference = current - previous;
  const direction: Direction = Math.abs(difference) < 1e-9 ? "flat" : difference > 0 ? "up" : "down";
  return { direction, difference, ratio: previous === 0 ? null : difference / previous };
}

/** Merges per-day aggregates into a gap-free series from `from` to `to`. */
export function fillDailySeries(
  clicksByDay: ReadonlyArray<{ day: string; clicks: number }>,
  conversionsByDay: ReadonlyArray<{ day: string; conversions: number; revenue: number }>,
  from: string,
  to: string,
): DayPoint[] {
  const clickMap = new Map(clicksByDay.map((row) => [row.day, row.clicks]));
  const convMap = new Map(conversionsByDay.map((row) => [row.day, row]));
  return dayRange(from, to).map((day) => ({
    day,
    clicks: clickMap.get(day) ?? 0,
    conversions: convMap.get(day)?.conversions ?? 0,
    revenue: convMap.get(day)?.revenue ?? 0,
  }));
}

export function sumSeries(points: ReadonlyArray<Totals>): Totals {
  return points.reduce(
    (acc, p) => ({ clicks: acc.clicks + p.clicks, conversions: acc.conversions + p.conversions, revenue: acc.revenue + p.revenue }),
    emptyTotals(),
  );
}

export interface GoalProgress {
  goal: number;
  earned: number;
  /** earned ÷ goal, not capped (can exceed 1). */
  ratio: number;
  remaining: number;
  /** Straight-line projection to month end at the month-to-date pace. */
  projected: number;
  /** Won per day needed for the rest of the month to reach the goal (0 when reached). */
  neededPerDay: number;
}

export function goalProgress(earned: number, goal: number, todayKey: string): GoalProgress {
  const day = Number(todayKey.slice(8, 10));
  const total = daysInMonth(todayKey);
  const remaining = Math.max(0, goal - earned);
  const daysLeft = total - day;
  return {
    goal,
    earned,
    ratio: goal > 0 ? earned / goal : 0,
    remaining,
    projected: Math.round((earned / day) * total),
    neededPerDay: remaining === 0 ? 0 : Math.ceil(remaining / Math.max(1, daysLeft)),
  };
}

export interface Breakdown<K extends string = string> extends Totals {
  key: K;
  share: number;
  cvr: number;
  epc: number;
}

/**
 * Joins click and conversion aggregates by key, adds share-of-clicks, CVR and EPC,
 * sorted by revenue then clicks (descending).
 */
export function breakdown<K extends string>(
  clickRows: ReadonlyArray<{ key: K; clicks: number }>,
  conversionRows: ReadonlyArray<{ key: K; conversions: number; revenue: number }>,
  keys: readonly K[] = [],
): Breakdown<K>[] {
  const map = new Map<K, Totals>();
  const get = (key: K) => {
    let entry = map.get(key);
    if (!entry) map.set(key, (entry = emptyTotals()));
    return entry;
  };
  for (const key of keys) get(key);
  for (const row of clickRows) get(row.key).clicks += row.clicks;
  for (const row of conversionRows) {
    const entry = get(row.key);
    entry.conversions += row.conversions;
    entry.revenue += row.revenue;
  }
  const totalClicks = [...map.values()].reduce((sum, t) => sum + t.clicks, 0);
  return [...map.entries()]
    .map(([key, t]) => ({
      key,
      ...t,
      share: totalClicks > 0 ? t.clicks / totalClicks : 0,
      cvr: conversionRate(t.conversions, t.clicks),
      epc: earningsPerClick(t.revenue, t.clicks),
    }))
    .sort((a, b) => b.revenue - a.revenue || b.clicks - a.clicks);
}

/** 24 buckets (0–23 시) from sparse hour rows. */
export function hourlyBuckets(rows: ReadonlyArray<{ hour: number; clicks: number }>): number[] {
  const buckets = Array.from({ length: 24 }, () => 0);
  for (const row of rows) if (row.hour >= 0 && row.hour < 24) buckets[row.hour] += row.clicks;
  return buckets;
}

/** The busiest consecutive window of `size` hours (wrapping midnight), for "클릭이 몰리는 시간". */
export function peakWindow(buckets: readonly number[], size = 3): { start: number; clicks: number } {
  let best = { start: 0, clicks: -1 };
  for (let start = 0; start < buckets.length; start += 1) {
    let clicks = 0;
    for (let i = 0; i < size; i += 1) clicks += buckets[(start + i) % buckets.length];
    if (clicks > best.clicks) best = { start, clicks };
  }
  return { start: best.start, clicks: Math.max(0, best.clicks) };
}

/** Nice axis maximum (1, 2, 2.5, 5 × 10ⁿ) at or above `value`. */
export function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  for (const step of [1, 2, 2.5, 5, 10]) if (step * base >= value) return step * base;
  return 10 * base;
}

export type PayoutState = { reached: true } | { reached: false; remaining: number };

/** Whether confirmed commission has reached a program's minimum payout. */
export function payoutState(confirmed: number, minPayout: number): PayoutState {
  return confirmed >= minPayout ? { reached: true } : { reached: false, remaining: minPayout - confirmed };
}
