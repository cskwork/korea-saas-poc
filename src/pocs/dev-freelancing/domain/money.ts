/**
 * Money rules for Korean freelance documents (견적서 · 인보이스). All amounts are integer won.
 *
 * - `vat`: 일반과세자 — 부가가치세 10% on the supply amount, won fractions truncated.
 * - `withholding`: 사업소득 원천징수 3.3% — 소득세 3% plus 지방소득세 (10% of 소득세), each truncated to
 *   10 won. 소득세 under 1,000 won is not withheld (소액부징수), and then neither is 지방소득세.
 * - `none`: no tax line (간이과세자 영수증, overseas client…).
 */

export type TaxMode = "withholding" | "vat" | "none";
export type LineUnit = "hour" | "lump";

export interface LineItem {
  title: string;
  unit: LineUnit;
  /** Hours for `hour` lines (0.5 steps), a count for `lump` lines. */
  quantity: number;
  /** Hourly rate for `hour` lines, price per unit for `lump` lines. */
  unitPrice: number;
}

export interface DocumentTotals {
  /** Σ line amounts. */
  subtotal: number;
  /** Discount actually applied (clamped to 0…subtotal). */
  discount: number;
  /** 공급가액 */
  supply: number;
  /** 부가세 */
  vat: number;
  /** 청구 합계: what the client is asked to pay in total (supply + VAT). */
  billed: number;
  /** 소득세 3% */
  incomeTax: number;
  /** 지방소득세 0.3% */
  localTax: number;
  /** incomeTax + localTax */
  withholding: number;
  /** 실입금액: what lands in the freelancer's account. */
  payout: number;
  /** Σ hours of `hour` lines. */
  hours: number;
}

export const VAT_RATE = 0.1;
export const WITHHOLDING_RATE = 0.033;
/** 소액부징수: 소득세 below this is not withheld. */
export const MINIMUM_WITHHELD_INCOME_TAX = 1_000;

export function lineAmount(item: Pick<LineItem, "quantity" | "unitPrice">): number {
  return Math.round(item.quantity * item.unitPrice);
}

export function vatOf(supply: number): number {
  return Math.floor(Math.max(0, supply) / 10);
}

export function withholdingOf(supply: number): { incomeTax: number; localTax: number; total: number } {
  const incomeTax = Math.floor((Math.max(0, supply) * 3) / 1000) * 10;
  if (incomeTax < MINIMUM_WITHHELD_INCOME_TAX) return { incomeTax: 0, localTax: 0, total: 0 };
  const localTax = Math.floor(incomeTax / 100) * 10;
  return { incomeTax, localTax, total: incomeTax + localTax };
}

export function computeTotals(
  items: readonly Pick<LineItem, "unit" | "quantity" | "unitPrice">[],
  options: { discount?: number; taxMode: TaxMode },
): DocumentTotals {
  const subtotal = items.reduce((sum, item) => sum + lineAmount(item), 0);
  const discount = Math.min(Math.max(0, Math.round(options.discount ?? 0)), subtotal);
  const supply = subtotal - discount;
  const vat = options.taxMode === "vat" ? vatOf(supply) : 0;
  const tax = options.taxMode === "withholding" ? withholdingOf(supply) : { incomeTax: 0, localTax: 0, total: 0 };
  const billed = supply + vat;
  const hours = items.reduce((sum, item) => (item.unit === "hour" ? sum + item.quantity : sum), 0);
  return {
    subtotal,
    discount,
    supply,
    vat,
    billed,
    incomeTax: tax.incomeTax,
    localTax: tax.localTax,
    withholding: tax.total,
    payout: billed - tax.total,
    hours: Math.round(hours * 100) / 100,
  };
}

const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"] as const;
const SMALL_UNITS = ["천", "백", "십", ""] as const;
const LARGE_UNITS = ["", "만", "억", "조"] as const;

/**
 * Amount in Korean words as written on documents (금액 한글 표기), with every 일 spelled out so the
 * figure cannot be altered: 1,230,000 → "일백이십삼만". Zero is "영".
 */
export function wonInWords(amount: number): string {
  const value = Math.floor(Math.abs(amount));
  if (value === 0) return "영";
  const groups: number[] = [];
  for (let rest = value; rest > 0; rest = Math.floor(rest / 10_000)) groups.push(rest % 10_000);
  return groups
    .map((group, index) => {
      if (group === 0) return "";
      const digits = String(group).padStart(4, "0").split("").map(Number);
      const words = digits.map((digit, position) => (digit === 0 ? "" : `${DIGITS[digit]}${SMALL_UNITS[position]}`)).join("");
      return `${words}${LARGE_UNITS[index] ?? ""}`;
    })
    .reverse()
    .join("");
}
