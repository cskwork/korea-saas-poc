import type { OrderType, PlanKind } from "./catalog";
import { ORDER_TYPES } from "./catalog";
import { daysBetween, daysInMonth, lastMonths } from "./calendar";

/** The studio's monthly revenue goal until the operator sets one (₩15,000,000, from the studio plan). */
export const DEFAULT_MONTHLY_GOAL = 15_000_000;

/**
 * Revenue is recognised when work is delivered: an order counts in the Seoul
 * month of its delivery, at its agreed price plus billed extra revisions.
 */
export interface DeliveredOrder {
  type: OrderType;
  plan: PlanKind;
  total: number;
  /** Seoul calendar day of delivery, "YYYY-MM-DD". */
  deliveredOn: string;
}

export interface MonthTotal {
  month: string;
  total: number;
  count: number;
}

export function monthlyTotals(orders: readonly DeliveredOrder[], endMonth: string, count: number): MonthTotal[] {
  const months = lastMonths(endMonth, count);
  const byMonth = new Map(months.map((month) => [month, { month, total: 0, count: 0 }]));
  for (const order of orders) {
    const bucket = byMonth.get(order.deliveredOn.slice(0, 7));
    if (!bucket) continue;
    bucket.total += order.total;
    bucket.count += 1;
  }
  return months.map((month) => byMonth.get(month)!);
}

export interface CategoryShare {
  type: OrderType;
  total: number;
  count: number;
  share: number;
}

/** Revenue per order type, largest first; types without revenue are left out. */
export function categorySplit(orders: readonly DeliveredOrder[]): CategoryShare[] {
  const sum = orders.reduce((acc, o) => acc + o.total, 0);
  return ORDER_TYPES.map((type) => {
    const ofType = orders.filter((o) => o.type === type);
    const total = ofType.reduce((acc, o) => acc + o.total, 0);
    return { type, total, count: ofType.length, share: sum > 0 ? total / sum : 0 };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.total - a.total);
}

export function planSplit(orders: readonly DeliveredOrder[]): Record<PlanKind, number> {
  return orders.reduce((acc, o) => ({ ...acc, [o.plan]: acc[o.plan] + o.total }), {
    single: 0,
    subscription: 0,
  } as Record<PlanKind, number>);
}

export interface GoalProgress {
  achieved: number;
  goal: number;
  /** 0..1+, not capped: going over the goal is worth showing. */
  ratio: number;
  remaining: number;
  /** Days left in the month including today. */
  daysLeft: number;
  /** Won per remaining day needed to reach the goal (0 when reached). */
  perDayNeeded: number;
}

export function goalProgress(achieved: number, goal: number, today: string): GoalProgress {
  const month = today.slice(0, 7);
  const lastDay = `${month}-${String(daysInMonth(month)).padStart(2, "0")}`;
  const daysLeft = daysBetween(today, lastDay) + 1;
  const remaining = Math.max(goal - achieved, 0);
  return {
    achieved,
    goal,
    ratio: goal > 0 ? achieved / goal : 0,
    remaining,
    daysLeft,
    perDayNeeded: remaining > 0 ? Math.ceil(remaining / daysLeft) : 0,
  };
}

/** Month-over-month change as a ratio (null when the previous month had nothing). */
export function monthChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return (current - previous) / previous;
}

export function averageTicket(orders: readonly DeliveredOrder[]): number {
  if (orders.length === 0) return 0;
  return Math.round(orders.reduce((acc, o) => acc + o.total, 0) / orders.length);
}
