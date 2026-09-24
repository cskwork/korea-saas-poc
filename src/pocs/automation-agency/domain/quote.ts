import type { Complexity } from "../db/schema";

/** Price multipliers by build complexity (legacy POC: 단순 0.7×, 보통 1.0×, 복잡 1.5×). */
export const COMPLEXITY_MULTIPLIER: Record<Complexity, number> = { simple: 0.7, normal: 1, complex: 1.5 };

/** 부가가치세 10%. */
export const VAT_RATE = 0.1;

export interface QuoteLine {
  name: string;
  complexity: Complexity;
  quantity: number;
  unitSetupFee: number;
  unitMonthlyFee: number;
}

export interface PricedLine extends QuoteLine {
  setupAmount: number;
  monthlyAmount: number;
}

export interface Charge {
  /** 공급가액 */
  supply: number;
  /** 부가세 (원 미만 절사) */
  vat: number;
  /** 합계 */
  total: number;
}

export interface QuoteTotals {
  lines: PricedLine[];
  setup: Charge;
  monthly: Charge;
  /** Build fee plus twelve months of maintenance, VAT included. */
  firstYearTotal: number;
}

/** Unit price adjusted for complexity, rounded to the nearest 1,000 won as quotes usually are. */
export function adjustedUnit(unit: number, complexity: Complexity): number {
  return Math.round((unit * COMPLEXITY_MULTIPLIER[complexity]) / 1000) * 1000;
}

export function priceLine(line: QuoteLine): PricedLine {
  return {
    ...line,
    setupAmount: adjustedUnit(line.unitSetupFee, line.complexity) * line.quantity,
    monthlyAmount: adjustedUnit(line.unitMonthlyFee, line.complexity) * line.quantity,
  };
}

export function charge(supply: number): Charge {
  const vat = Math.floor(supply * VAT_RATE);
  return { supply, vat, total: supply + vat };
}

export function quoteTotals(lines: readonly QuoteLine[]): QuoteTotals {
  const priced = lines.map(priceLine);
  const setup = charge(priced.reduce((sum, line) => sum + line.setupAmount, 0));
  const monthly = charge(priced.reduce((sum, line) => sum + line.monthlyAmount, 0));
  return { lines: priced, setup, monthly, firstYearTotal: setup.total + monthly.total * 12 };
}

/** Next quote number for the year: "Q-2026-0007". `existing` are the workspace's current numbers. */
export function nextQuoteNumber(existing: readonly string[], year: number): string {
  const prefix = `Q-${year}-`;
  const highest = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => Number.parseInt(n.slice(prefix.length), 10))
    .filter(Number.isFinite)
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SMALL_UNITS = ["", "십", "백", "천"];
const LARGE_UNITS = ["", "만", "억", "조"];

/**
 * Amount in Korean words, as written on quotes and receipts: 3300000 → "삼백삼십만".
 * Used as "일금 삼백삼십만 원정".
 */
export function amountInKorean(amount: number): string {
  const value = Math.floor(Math.abs(amount));
  if (value === 0) return "영";
  const groups: string[] = [];
  let rest = value;
  for (let g = 0; rest > 0 && g < LARGE_UNITS.length; g += 1) {
    const chunk = rest % 10_000;
    rest = Math.floor(rest / 10_000);
    if (chunk === 0) continue;
    let words = "";
    const digits = String(chunk).padStart(4, "0");
    for (let i = 0; i < 4; i += 1) {
      const d = Number(digits[i]);
      if (d === 0) continue;
      words += DIGITS[d] + SMALL_UNITS[3 - i];
    }
    groups.unshift(words + LARGE_UNITS[g]);
  }
  return groups.join("");
}
