import { addMonths, daysInMonth, monthKey, monthLabel, seoulParts, startOfDay } from "./calendar";

/** Revenue analytics computed from payment rows (never from stored totals). */

export interface RevenuePayment {
  kind: "course" | "product";
  amount: number;
  status: "paid" | "refunded";
  paidAt: Date;
  courseId: string | null;
  productId: string | null;
  itemTitle: string;
}

export interface MonthRevenue {
  month: string;
  label: string;
  course: number;
  product: number;
  total: number;
  refunded: number;
  sales: number;
  /** Paid course revenue per course key (see `itemKey`). */
  byCourse: Record<string, number>;
}

/** Groups payments of a deleted course/product under its title snapshot. */
export function itemKey(payment: Pick<RevenuePayment, "kind" | "courseId" | "productId" | "itemTitle">): string {
  const id = payment.kind === "course" ? payment.courseId : payment.productId;
  return id ?? `deleted:${payment.kind}:${payment.itemTitle}`;
}

/** The last `months` calendar months (Seoul) up to and including the current one. */
export function monthlySeries(payments: readonly RevenuePayment[], now: Date, months: number): MonthRevenue[] {
  const current = monthKey(now);
  const series = Array.from({ length: months }, (_, i): MonthRevenue => {
    const month = addMonths(current, i - (months - 1));
    return { month, label: monthLabel(month), course: 0, product: 0, total: 0, refunded: 0, sales: 0, byCourse: {} };
  });
  const index = new Map(series.map((row, i) => [row.month, i]));
  for (const payment of payments) {
    const i = index.get(monthKey(payment.paidAt));
    if (i === undefined) continue;
    const row = series[i];
    if (payment.status === "refunded") {
      row.refunded += payment.amount;
      continue;
    }
    row.sales += 1;
    row.total += payment.amount;
    if (payment.kind === "course") {
      row.course += payment.amount;
      const key = itemKey(payment);
      row.byCourse[key] = (row.byCourse[key] ?? 0) + payment.amount;
    } else {
      row.product += payment.amount;
    }
  }
  return series;
}

/** Relative change, or null when there is nothing to compare against. */
export function growthRate(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return (current - previous) / previous;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  growth: number | null;
  /** Day of month the comparison runs to (inclusive), e.g. 24 → "1–24일". */
  throughDay: number;
  previousThroughDay: number;
  month: string;
  previousMonth: string;
}

/**
 * This month so far against the same stretch of last month (1st → the same day,
 * capped at last month's length), so a partial month is compared fairly.
 */
export function monthToDate(payments: readonly RevenuePayment[], now: Date): PeriodComparison {
  const month = monthKey(now);
  const previousMonth = addMonths(month, -1);
  const today = seoulParts(now).day;
  const previousThroughDay = Math.min(today, daysInMonth(previousMonth));
  const currentStart = startOfDay(`${month}-01`).getTime();
  const previousStart = startOfDay(`${previousMonth}-01`).getTime();
  // Same elapsed time into the month, bounded by the end of the capped day.
  const elapsed = now.getTime() - currentStart;
  const previousEnd = Math.min(
    previousStart + elapsed,
    startOfDay(`${previousMonth}-${String(previousThroughDay).padStart(2, "0")}`).getTime() + 86_400_000,
  );

  let current = 0;
  let previous = 0;
  for (const payment of payments) {
    if (payment.status !== "paid") continue;
    const t = payment.paidAt.getTime();
    if (t >= currentStart && t <= now.getTime()) current += payment.amount;
    else if (t >= previousStart && t < previousEnd) previous += payment.amount;
  }
  return { current, previous, growth: growthRate(current, previous), throughDay: today, previousThroughDay, month, previousMonth };
}

export interface RevenueSplit {
  course: number;
  product: number;
  total: number;
  /** 0–1; 0 when there is no revenue. */
  courseShare: number;
}

export function revenueSplit(payments: readonly RevenuePayment[]): RevenueSplit {
  let course = 0;
  let product = 0;
  for (const payment of payments) {
    if (payment.status !== "paid") continue;
    if (payment.kind === "course") course += payment.amount;
    else product += payment.amount;
  }
  const total = course + product;
  return { course, product, total, courseShare: total > 0 ? course / total : 0 };
}

export interface ItemRevenue {
  key: string;
  kind: "course" | "product";
  /** null when the course/product has been deleted. */
  id: string | null;
  title: string;
  revenue: number;
  sales: number;
  refunds: number;
  refundedAmount: number;
}

export function revenueByItem(payments: readonly RevenuePayment[]): ItemRevenue[] {
  const rows = new Map<string, ItemRevenue>();
  for (const payment of payments) {
    const key = itemKey(payment);
    const row = rows.get(key) ?? {
      key,
      kind: payment.kind,
      id: payment.kind === "course" ? payment.courseId : payment.productId,
      title: payment.itemTitle,
      revenue: 0,
      sales: 0,
      refunds: 0,
      refundedAmount: 0,
    };
    if (payment.status === "paid") {
      row.revenue += payment.amount;
      row.sales += 1;
    } else {
      row.refunds += 1;
      row.refundedAmount += payment.amount;
    }
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.revenue - a.revenue || a.title.localeCompare(b.title, "ko"));
}

/** Card/transfer processing fee on sales, per the plan terms (3.5%). */
export const PAYMENT_FEE_RATE = 0.035;

export function settlement(gross: number) {
  const fee = Math.round(gross * PAYMENT_FEE_RATE);
  return { gross, fee, net: gross - fee };
}

/** Monthly revenue as CSV (UTF-8 with BOM so spreadsheet apps read Korean correctly). */
export function revenueCsv(series: readonly MonthRevenue[]): string {
  const header = ["월", "강의 매출", "디지털 상품 매출", "합계", "결제 건수", "환불액", "수수료(3.5%)", "정산 예정액"];
  const lines = series.map((row) => {
    const { fee, net } = settlement(row.total);
    return [row.month, row.course, row.product, row.total, row.sales, row.refunded, fee, net].join(",");
  });
  return `﻿${[header.join(","), ...lines].join("\r\n")}\r\n`;
}
