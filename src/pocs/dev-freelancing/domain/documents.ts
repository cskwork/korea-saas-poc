import { daysBetween, type DateKey } from "./dates";
import { computeTotals, type LineItem, type TaxMode } from "./money";

/**
 * Document workflows: 견적서 (estimate) and 인보이스 (invoice) statuses, numbering, deadlines and
 * estimate → invoice conversion (전액 / 착수금 / 잔금).
 */

export const ESTIMATE_STATUSES = ["draft", "sent", "accepted", "declined", "invoiced"] as const;
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export const INVOICE_STATUSES = ["issued", "awaiting", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/** Status changes the developer can record by hand. `invoiced` is only reached by conversion. */
const ESTIMATE_TRANSITIONS: Record<EstimateStatus, readonly EstimateStatus[]> = {
  draft: ["sent"],
  sent: ["accepted", "declined", "draft"],
  accepted: ["sent"],
  declined: ["draft"],
  invoiced: [],
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  issued: ["awaiting", "paid"],
  awaiting: ["paid", "issued"],
  paid: ["awaiting"],
};

export function estimateTransitions(status: EstimateStatus): readonly EstimateStatus[] {
  return ESTIMATE_TRANSITIONS[status];
}

export function canMoveEstimate(from: EstimateStatus, to: EstimateStatus): boolean {
  return ESTIMATE_TRANSITIONS[from].includes(to);
}

export function invoiceTransitions(status: InvoiceStatus): readonly InvoiceStatus[] {
  return INVOICE_TRANSITIONS[status];
}

export function canMoveInvoice(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return INVOICE_TRANSITIONS[from].includes(to);
}

/** Only drafts are edited in place; a sent estimate is withdrawn to draft first. */
export function isEstimateEditable(status: EstimateStatus): boolean {
  return status === "draft";
}

/** An invoice can be corrected until it has been sent. */
export function isInvoiceEditable(status: InvoiceStatus): boolean {
  return status === "issued";
}

export function canConvertEstimate(status: EstimateStatus): boolean {
  return status === "accepted" || status === "invoiced";
}

/** Next number for a day, e.g. `EST-20260924-003`, given the numbers already used. */
export function nextDocumentNumber(prefix: "EST" | "INV", day: DateKey, existing: readonly string[]): string {
  const stem = `${prefix}-${day.replaceAll("-", "")}-`;
  const highest = existing.reduce((max, number) => {
    if (!number.startsWith(stem)) return max;
    const sequence = Number(number.slice(stem.length));
    return Number.isInteger(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `${stem}${String(highest + 1).padStart(3, "0")}`;
}

/** Days past the due date for an unpaid invoice (0 when not overdue). */
export function overdueDays(invoice: { status: InvoiceStatus; dueOn: DateKey }, today: DateKey): number {
  if (invoice.status === "paid") return 0;
  return Math.max(0, daysBetween(invoice.dueOn, today));
}

/** A sent estimate past its validity date. */
export function isEstimateExpired(estimate: { status: EstimateStatus; validUntil: DateKey }, today: DateKey): boolean {
  return estimate.status === "sent" && daysBetween(estimate.validUntil, today) > 0;
}

export type ReceivableBucket = "current" | "d1_30" | "d31_60" | "d61";

export function receivableBucket(overdue: number): ReceivableBucket {
  if (overdue <= 0) return "current";
  if (overdue <= 30) return "d1_30";
  if (overdue <= 60) return "d31_60";
  return "d61";
}

export const CONVERSION_SHARES = ["full", "advance30", "advance50", "balance"] as const;
export type ConversionShare = (typeof CONVERSION_SHARES)[number];

const ADVANCE_RATIO: Record<"advance30" | "advance50", number> = { advance30: 0.3, advance50: 0.5 };

/** Which conversions make sense given what has already been invoiced from the estimate. */
export function availableShares(supply: number, invoicedSupply: number): ConversionShare[] {
  if (supply <= 0) return [];
  if (invoicedSupply <= 0) return ["full", "advance30", "advance50"];
  return invoicedSupply < supply ? ["balance"] : [];
}

export interface ConvertibleEstimate {
  title: string;
  items: readonly LineItem[];
  discount: number;
  taxMode: TaxMode;
}

/**
 * Lines for an invoice made from an estimate. `full` copies every line (and the discount);
 * 착수금 bills a share of the supply amount as one line; 잔금 bills what is left.
 * Returns null when the share is not available any more.
 */
export function conversionLines(
  estimate: ConvertibleEstimate,
  invoicedSupply: number,
  share: ConversionShare,
): { items: LineItem[]; discount: number } | null {
  const { supply } = computeTotals(estimate.items, { discount: estimate.discount, taxMode: estimate.taxMode });
  if (!availableShares(supply, invoicedSupply).includes(share)) return null;

  if (share === "full") {
    return {
      items: estimate.items.map(({ title, unit, quantity, unitPrice }) => ({ title, unit, quantity, unitPrice })),
      discount: estimate.discount,
    };
  }
  if (share === "balance") {
    return {
      items: [{ title: `잔금 · ${estimate.title}`, unit: "lump", quantity: 1, unitPrice: supply - invoicedSupply }],
      discount: 0,
    };
  }
  const ratio = ADVANCE_RATIO[share];
  return {
    items: [
      {
        title: `착수금 ${Math.round(ratio * 100)}% · ${estimate.title}`,
        unit: "lump",
        quantity: 1,
        unitPrice: Math.round(supply * ratio),
      },
    ],
    discount: 0,
  };
}
