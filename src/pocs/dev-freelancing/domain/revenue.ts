import { monthOf, type DateKey, type MonthKey } from "./dates";
import { overdueDays, receivableBucket, type InvoiceStatus, type ReceivableBucket } from "./documents";
import type { TaxMode } from "./money";

/**
 * Revenue from invoices: 매출 is the supply amount (공급가액, VAT is pass-through), 입금 is what landed.
 * Withholding is booked when paid (that is when the client withholds it); VAT when issued
 * (세금계산서 공급시기).
 */

export interface RevenueInvoice {
  id: string;
  clientId: string | null;
  clientName: string;
  status: InvoiceStatus;
  taxMode: TaxMode;
  issuedOn: DateKey;
  dueOn: DateKey;
  paidOn: DateKey | null;
  supply: number;
  vat: number;
  withholding: number;
  payout: number;
}

export interface MonthRevenue {
  month: MonthKey;
  /** Supply amount of invoices paid in the month. */
  paid: number;
  /** Supply amount of invoices issued in the month. */
  issued: number;
}

export function monthlyRevenue(invoices: readonly RevenueInvoice[], months: readonly MonthKey[]): MonthRevenue[] {
  const rows = new Map(months.map((month) => [month, { month, paid: 0, issued: 0 }]));
  for (const invoice of invoices) {
    const issued = rows.get(monthOf(invoice.issuedOn));
    if (issued) issued.issued += invoice.supply;
    if (invoice.status === "paid" && invoice.paidOn) {
      const paid = rows.get(monthOf(invoice.paidOn));
      if (paid) paid.paid += invoice.supply;
    }
  }
  return months.map((month) => rows.get(month)!);
}

/** Won per tracked hour, or null without tracked time. */
export function effectiveHourlyRate(revenue: number, trackedMinutes: number): number | null {
  if (trackedMinutes <= 0) return null;
  return Math.round(revenue / (trackedMinutes / 60));
}

export interface Receivables {
  count: number;
  /** What the clients still owe (실입금 기준). */
  amount: number;
  overdueCount: number;
  overdueAmount: number;
  buckets: Record<ReceivableBucket, number>;
}

export function receivables(invoices: readonly RevenueInvoice[], today: DateKey): Receivables {
  const result: Receivables = {
    count: 0,
    amount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    buckets: { current: 0, d1_30: 0, d31_60: 0, d61: 0 },
  };
  for (const invoice of invoices) {
    if (invoice.status === "paid") continue;
    const overdue = overdueDays(invoice, today);
    result.count += 1;
    result.amount += invoice.payout;
    result.buckets[receivableBucket(overdue)] += invoice.payout;
    if (overdue > 0) {
      result.overdueCount += 1;
      result.overdueAmount += invoice.payout;
    }
  }
  return result;
}

export interface GoalProgress {
  goal: number;
  amount: number;
  ratio: number;
  /** Of `cells` squares, how many are full. */
  filled: number;
  partial: 0 | 1;
  cells: number;
}

export function goalProgress(amount: number, goal: number, cells = 10): GoalProgress {
  const ratio = goal > 0 ? amount / goal : 0;
  const exact = Math.min(cells, Math.max(0, ratio * cells));
  const filled = Math.floor(exact);
  const partial: 0 | 1 = filled < cells && exact - filled >= 0.25 ? 1 : 0;
  return { goal, amount, ratio, filled, partial, cells };
}

export interface ClientShare {
  clientId: string | null;
  clientName: string;
  paid: number;
  share: number;
}

export function clientShares(invoices: readonly RevenueInvoice[], year: number): ClientShare[] {
  const totals = new Map<string, ClientShare>();
  let all = 0;
  for (const invoice of invoices) {
    if (invoice.status !== "paid" || !invoice.paidOn || Number(invoice.paidOn.slice(0, 4)) !== year) continue;
    const key = invoice.clientId ?? "none";
    const row = totals.get(key) ?? { clientId: invoice.clientId, clientName: invoice.clientName, paid: 0, share: 0 };
    row.paid += invoice.supply;
    all += invoice.supply;
    totals.set(key, row);
  }
  return [...totals.values()]
    .map((row) => ({ ...row, share: all > 0 ? row.paid / all : 0 }))
    .sort((a, b) => b.paid - a.paid);
}

export interface VatPeriod {
  /** 1기 (1–6월) or 2기 (7–12월) */
  period: 1 | 2;
  vat: number;
  supply: number;
  /** 확정신고·납부 기한 */
  dueOn: DateKey;
}

export interface TaxSummary {
  year: number;
  paidSupply: number;
  /** 원천징수된 세액 (기납부세액): settled in next May's 종합소득세 신고. */
  withheld: number;
  withheldIncomeTaxBase: number;
  vatPeriods: VatPeriod[];
}

export function taxSummary(invoices: readonly RevenueInvoice[], year: number): TaxSummary {
  let paidSupply = 0;
  let withheld = 0;
  let withheldIncomeTaxBase = 0;
  const periods: VatPeriod[] = [
    { period: 1, vat: 0, supply: 0, dueOn: `${year}-07-25` },
    { period: 2, vat: 0, supply: 0, dueOn: `${year + 1}-01-25` },
  ];
  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.paidOn && Number(invoice.paidOn.slice(0, 4)) === year) {
      paidSupply += invoice.supply;
      withheld += invoice.withholding;
      if (invoice.taxMode === "withholding") withheldIncomeTaxBase += invoice.supply;
    }
    if (invoice.taxMode === "vat" && Number(invoice.issuedOn.slice(0, 4)) === year) {
      const period = periods[Number(invoice.issuedOn.slice(5, 7)) <= 6 ? 0 : 1];
      period.vat += invoice.vat;
      period.supply += invoice.supply;
    }
  }
  return { year, paidSupply, withheld, withheldIncomeTaxBase, vatPeriods: periods };
}

/** Paid supply in a month and the change against the month before. */
export function monthOverMonth(series: readonly MonthRevenue[]): { current: number; previous: number; change: number | null } {
  const current = series.at(-1)?.paid ?? 0;
  const previous = series.at(-2)?.paid ?? 0;
  return { current, previous, change: previous > 0 ? (current - previous) / previous : null };
}

