import { CONTENT_KINDS, type ContentKind } from "./content";
import { addDays, daysBetween, monthKey, startOfWeek } from "./dates";
import { ORDER_STATUSES, type OrderStatus } from "./pipeline";

/** The facts about an order the dashboard needs, as Seoul calendar days. */
export interface OrderFacts {
  status: OrderStatus;
  kind: ContentKind;
  createdOn: string;
  dueDate: string;
  deliveredOn: string | null;
}

export function pipelineCounts(orders: readonly OrderFacts[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const order of orders) counts[order.status] += 1;
  return counts;
}

export function kindMix(orders: readonly OrderFacts[]): Record<ContentKind, number> {
  const counts = Object.fromEntries(CONTENT_KINDS.map((k) => [k, 0])) as Record<ContentKind, number>;
  for (const order of orders) counts[order.kind] += 1;
  return counts;
}

/** Orders received in the calendar month of `today` (what the plan quota counts). */
export function ordersThisMonth(orders: readonly OrderFacts[], today: string): number {
  const month = monthKey(today);
  return orders.filter((o) => monthKey(o.createdOn) === month).length;
}

export interface DeliveryPerformance {
  delivered: number;
  onTime: number;
  /** Share delivered on or before the due date; null before the first delivery. */
  onTimeRate: number | null;
  /** Mean days from request to delivery; null before the first delivery. */
  averageTurnaroundDays: number | null;
}

export function deliveryPerformance(orders: readonly OrderFacts[]): DeliveryPerformance {
  const delivered = orders.filter((o): o is OrderFacts & { deliveredOn: string } => o.status === "delivered" && !!o.deliveredOn);
  if (delivered.length === 0) return { delivered: 0, onTime: 0, onTimeRate: null, averageTurnaroundDays: null };
  const onTime = delivered.filter((o) => daysBetween(o.dueDate, o.deliveredOn) <= 0).length;
  const totalDays = delivered.reduce((sum, o) => sum + Math.max(0, daysBetween(o.createdOn, o.deliveredOn)), 0);
  return {
    delivered: delivered.length,
    onTime,
    onTimeRate: onTime / delivered.length,
    averageTurnaroundDays: Math.round((totalDays / delivered.length) * 10) / 10,
  };
}

export interface HeadlineCounts {
  dueToday: number;
  late: number;
  awaitingReview: number;
  /** Open orders due from today through the coming Sunday. */
  dueThisWeek: number;
}

export function headlineCounts(orders: readonly OrderFacts[], today: string): HeadlineCounts {
  const open = orders.filter((o) => o.status !== "delivered");
  const sunday = addDays(startOfWeek(today), 6);
  return {
    dueToday: open.filter((o) => o.dueDate === today).length,
    late: open.filter((o) => o.dueDate < today).length,
    awaitingReview: open.filter((o) => o.status === "review").length,
    dueThisWeek: open.filter((o) => o.dueDate >= today && o.dueDate <= sunday).length,
  };
}

export interface WeekThroughput {
  weekStart: string;
  received: number;
  delivered: number;
}

/** Orders received and delivered per week (Monday start), oldest first, ending with this week. */
export function weeklyThroughput(orders: readonly OrderFacts[], today: string, weeks = 8): WeekThroughput[] {
  const thisWeek = startOfWeek(today);
  const rows = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDays(thisWeek, (i - weeks + 1) * 7),
    received: 0,
    delivered: 0,
  }));
  const byWeek = new Map(rows.map((row) => [row.weekStart, row]));
  for (const order of orders) {
    const received = byWeek.get(startOfWeek(order.createdOn));
    if (received) received.received += 1;
    if (order.deliveredOn) {
      const delivered = byWeek.get(startOfWeek(order.deliveredOn));
      if (delivered) delivered.delivered += 1;
    }
  }
  return rows;
}

export interface TimelineBar<T> {
  order: T;
  /** Column where the bar starts (0-based within the window). */
  start: number;
  /** Column of the due date, clamped to the window. */
  end: number;
  /** Late orders run on past their due date up to today's column. */
  overrunEnd: number | null;
  /** The bar continues before / after the visible window. */
  clippedStart: boolean;
  clippedEnd: boolean;
}

export interface Timeline<T> {
  days: string[];
  todayIndex: number;
  bars: TimelineBar<T>[];
  /** Open orders that fall entirely outside the window. */
  hidden: number;
}

/**
 * The posting-period stand: every open order drawn from the day it was received to its
 * due date, over a window of days around today.
 */
export function buildTimeline<T extends OrderFacts>(
  orders: readonly T[],
  today: string,
  { before = 3, after = 10 }: { before?: number; after?: number } = {},
): Timeline<T> {
  const first = addDays(today, -before);
  const last = addDays(today, after);
  const days = Array.from({ length: before + after + 1 }, (_, i) => addDays(first, i));
  const clamp = (key: string) => Math.min(Math.max(daysBetween(first, key), 0), days.length - 1);

  const open = orders.filter((o) => o.status !== "delivered");
  // Late orders always show: they overrun into today whatever their dates.
  const visible = open.filter((o) => (o.dueDate >= first && o.createdOn <= last) || o.dueDate < today);
  const bars = visible
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.createdOn.localeCompare(b.createdOn))
    .map((order) => {
      const late = order.dueDate < today;
      return {
        order,
        start: clamp(order.createdOn),
        end: clamp(order.dueDate),
        overrunEnd: late ? before : null,
        clippedStart: order.createdOn < first,
        clippedEnd: order.dueDate > last,
      };
    });
  return { days, todayIndex: before, bars, hidden: open.length - visible.length };
}
