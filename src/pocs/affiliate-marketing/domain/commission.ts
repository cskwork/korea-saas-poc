import type { CommissionType } from "./catalog";

/** How a link earns: a percentage of the order (CPS) or a fixed amount per conversion (CPA). */
export interface CommissionTerms {
  commissionType: CommissionType;
  /** Basis points: 3.5% → 350. */
  commissionRateBp: number;
  commissionFixedWon: number;
}

/**
 * Commission for one order, in whole won. Programs pay truncated amounts, so fractions are
 * floored, never rounded up.
 */
export function computeCommission(terms: CommissionTerms, orderAmountWon: number): number {
  if (terms.commissionType === "fixed") return Math.max(0, Math.trunc(terms.commissionFixedWon));
  const amount = Math.max(0, Math.trunc(orderAmountWon));
  const rate = Math.max(0, Math.trunc(terms.commissionRateBp));
  return Math.floor((amount * rate) / 10_000);
}

/** "3.5" (percent string for inputs) → 350 bp. Accepts up to two decimals; returns null when invalid. */
export function parseRatePercent(input: string): number | null {
  const trimmed = input.trim().replace(/%$/, "");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const bp = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return bp <= 10_000 ? bp : null;
}

/** 350 → "3.5%" */
export function formatRate(bp: number): string {
  const percent = bp / 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2).replace(/0$/, "")}%`;
}

/** 350 → "3.5" for an input's value. */
export function rateInputValue(bp: number): string {
  return formatRate(bp).replace(/%$/, "");
}

/** Short human description of the terms: "판매가의 3%" / "건당 3,000원". */
export function describeTerms(terms: CommissionTerms): string {
  return terms.commissionType === "fixed"
    ? `건당 ${new Intl.NumberFormat("ko-KR").format(terms.commissionFixedWon)}원`
    : `판매가의 ${formatRate(terms.commissionRateBp)}`;
}

/** "12,900" / "₩12,900" / "12900원" → 12900. */
export function parseWon(input: string): number | null {
  const digits = input.replace(/[₩원,\s]/g, "");
  if (!/^\d{1,10}$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}
