import { seoulDateKey } from "@/core/format";
import type { Category } from "./categories";
import { orderAmounts, type OrderLine, type OrderStatus } from "./orders";

/**
 * Sales analytics computed from order rows (never from constants).
 * Cancelled orders count toward the cancellation rate only, not revenue.
 */
export const PERIODS = [7, 14, 30] as const;
export type Period = (typeof PERIODS)[number];

export function isPeriod(value: number): value is Period {
  return (PERIODS as readonly number[]).includes(value);
}

export interface AnalyticsOrder extends OrderLine {
  orderedAt: Date;
  status: OrderStatus;
  category: Category;
  productName: string;
  /** Null once the listing was deleted; sales then group by product name. */
  listingId: string | null;
}

export interface DayPoint {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface Totals {
  revenue: number;
  profit: number;
  orders: number;
  units: number;
  cancelled: number;
  /** profit / revenue */
  marginRate: number;
}

export interface CategoryShare {
  category: Category;
  revenue: number;
  share: number;
}

export interface TopSeller {
  productKey: string;
  listingId: string | null;
  productName: string;
  category: Category;
  units: number;
  revenue: number;
  profit: number;
}

export interface Analytics {
  period: Period;
  days: DayPoint[];
  current: Totals;
  previous: Totals;
  /** Relative change vs the previous period; null when the previous value is 0. */
  change: { revenue: number | null; profit: number | null; orders: number | null; marginRate: number };
  categories: CategoryShare[];
  topSellers: TopSeller[];
}

/** "2026-09-24" + n days, calendar arithmetic independent of the server time zone. */
export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Seoul day keys, oldest first, ending today. */
export function periodDays(todayKey: string, period: number): string[] {
  return Array.from({ length: period }, (_, i) => addDays(todayKey, i - period + 1));
}

/** Start of a Seoul calendar day as an instant (Seoul has no DST: UTC+9). */
export function seoulDayStart(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00+09:00`);
}

function emptyTotals(): Totals {
  return { revenue: 0, profit: 0, orders: 0, units: 0, cancelled: 0, marginRate: 0 };
}

function relativeChange(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / Math.abs(previous);
}

export function computeAnalytics(orders: readonly AnalyticsOrder[], todayKey: string, period: Period): Analytics {
  const days = periodDays(todayKey, period);
  const firstDay = days[0];
  const previousFirstDay = addDays(firstDay, -period);
  const points = new Map(days.map((date) => [date, { date, revenue: 0, profit: 0, orders: 0 }]));
  const current = emptyTotals();
  const previous = emptyTotals();
  const byCategory = new Map<Category, number>();
  const byProduct = new Map<string, TopSeller>();

  for (const order of orders) {
    const day = seoulDateKey(order.orderedAt);
    if (day > todayKey || day < previousFirstDay) continue;
    const inCurrent = day >= firstDay;
    const totals = inCurrent ? current : previous;
    if (order.status === "cancelled") {
      totals.cancelled += 1;
      continue;
    }
    const amounts = orderAmounts(order);
    totals.revenue += amounts.revenue;
    totals.profit += amounts.profit;
    totals.orders += 1;
    totals.units += order.quantity;
    if (!inCurrent) continue;

    const point = points.get(day);
    if (point) {
      point.revenue += amounts.revenue;
      point.profit += amounts.profit;
      point.orders += 1;
    }
    byCategory.set(order.category, (byCategory.get(order.category) ?? 0) + amounts.revenue);
    const productKey = order.listingId ?? `name:${order.productName}`;
    const seller = byProduct.get(productKey) ?? {
      productKey,
      listingId: order.listingId,
      productName: order.productName,
      category: order.category,
      units: 0,
      revenue: 0,
      profit: 0,
    };
    seller.units += order.quantity;
    seller.revenue += amounts.revenue;
    seller.profit += amounts.profit;
    byProduct.set(productKey, seller);
  }

  for (const totals of [current, previous]) {
    totals.marginRate = totals.revenue > 0 ? totals.profit / totals.revenue : 0;
  }

  const categories = [...byCategory.entries()]
    .map(([category, revenue]) => ({ category, revenue, share: current.revenue > 0 ? revenue / current.revenue : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  const topSellers = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue || b.units - a.units).slice(0, 5);

  return {
    period,
    days: [...points.values()],
    current,
    previous,
    change: {
      revenue: relativeChange(current.revenue, previous.revenue),
      profit: relativeChange(current.profit, previous.profit),
      orders: relativeChange(current.orders, previous.orders),
      marginRate: current.marginRate - previous.marginRate,
    },
    categories,
    topSellers,
  };
}
