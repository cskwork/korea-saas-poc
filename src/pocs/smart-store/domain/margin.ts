/**
 * Margin math — the one definition of "what the seller keeps" used by the
 * sourcing board, listings, orders, analytics and the calculator.
 *
 *   profit = price − cost − Naver fee (price × category rate) − shipping
 *
 * Amounts are integer won; the fee is rounded to the won.
 */

export interface MarginInput {
  /** Sale price per unit on SmartStore. */
  price: number;
  /** Wholesale purchase cost per unit. */
  cost: number;
  /** Shipping the seller pays the wholesaler per shipment. */
  shipping: number;
  /** Naver category fee in basis points (550 = 5.5%). */
  feeRateBp: number;
}

export interface MarginBreakdown extends MarginInput {
  fee: number;
  profit: number;
  /** profit / price (0 when price is 0). */
  marginRate: number;
}

export type MarginTone = "loss" | "thin" | "fair" | "strong";

export function naverFee(price: number, feeRateBp: number): number {
  return Math.round((price * feeRateBp) / 10_000);
}

export function computeMargin(input: MarginInput): MarginBreakdown {
  const fee = naverFee(input.price, input.feeRateBp);
  const profit = input.price - input.cost - fee - input.shipping;
  return { ...input, fee, profit, marginRate: input.price > 0 ? profit / input.price : 0 };
}

/** 흑자/적자 and how comfortable the margin is. */
export function marginTone(breakdown: Pick<MarginBreakdown, "profit" | "marginRate">): MarginTone {
  if (breakdown.profit <= 0) return "loss";
  if (breakdown.marginRate < 0.15) return "thin";
  if (breakdown.marginRate < 0.3) return "fair";
  return "strong";
}

export const MARGIN_TONE_LABEL: Record<MarginTone, string> = {
  loss: "적자",
  thin: "박한 마진",
  fair: "무난한 마진",
  strong: "넉넉한 마진",
};

/** Lowest price (won) at which the seller stops losing money. */
export function breakEvenPrice(cost: number, shipping: number, feeRateBp: number): number {
  const keep = 1 - feeRateBp / 10_000;
  let price = Math.ceil((cost + shipping) / keep);
  // Rounding the fee can leave the first candidate a won short.
  while (computeMargin({ price, cost, shipping, feeRateBp }).profit < 0) price += 1;
  return price;
}

/**
 * Price that reaches a target margin rate, rounded up to a shop-style price
 * ending in 900 (18,234 → 18,900). Returns null when the target is unreachable
 * (fee + target ≥ 100%).
 */
export function priceForTargetMargin(
  cost: number,
  shipping: number,
  feeRateBp: number,
  targetMarginRate: number,
): number | null {
  const keep = 1 - feeRateBp / 10_000 - targetMarginRate;
  if (keep <= 0) return null;
  // Whole won, tolerant of float noise (17,010 / 0.9 must stay 18,900).
  const exact = Math.ceil((cost + shipping) / keep - 1e-6);
  return Math.ceil((exact + 100) / 1000) * 1000 - 100;
}

export interface MonthlyProjection {
  quantity: number;
  revenue: number;
  cost: number;
  fee: number;
  shipping: number;
  profit: number;
}

export function projectMonthly(breakdown: MarginBreakdown, quantity: number): MonthlyProjection {
  return {
    quantity,
    revenue: breakdown.price * quantity,
    cost: breakdown.cost * quantity,
    fee: breakdown.fee * quantity,
    shipping: breakdown.shipping * quantity,
    profit: breakdown.profit * quantity,
  };
}

export interface CostShare {
  key: "cost" | "fee" | "shipping" | "profit";
  label: string;
  amount: number;
  /** Share of the sale price, 0–1 (profit share is 0 when it is a loss). */
  share: number;
}

/** How the sale price splits into cost, fee, shipping and what is left. */
export function costStructure(breakdown: MarginBreakdown): CostShare[] {
  const { price, cost, fee, shipping, profit } = breakdown;
  const base = Math.max(price, cost + fee + shipping, 1);
  const parts: CostShare[] = [
    { key: "cost", label: "매입가", amount: cost, share: cost / base },
    { key: "fee", label: "수수료", amount: fee, share: fee / base },
    { key: "shipping", label: "배송비", amount: shipping, share: shipping / base },
    { key: "profit", label: "남는 돈", amount: profit, share: Math.max(profit, 0) / base },
  ];
  return parts;
}
