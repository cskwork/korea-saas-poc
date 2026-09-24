import { describe, expect, it } from "vitest";
import { computeTotals, lineAmount, vatOf, withholdingOf, wonInWords, type LineItem } from "./money";

const items: LineItem[] = [
  { title: "회원가입 · 로그인", unit: "hour", quantity: 16, unitPrice: 60_000 },
  { title: "결제 연동", unit: "hour", quantity: 24.5, unitPrice: 60_000 },
  { title: "도메인 · 서버 세팅", unit: "lump", quantity: 1, unitPrice: 300_000 },
];

describe("line amounts", () => {
  it("multiplies hours by the rate and rounds to whole won", () => {
    expect(lineAmount({ quantity: 24.5, unitPrice: 60_000 })).toBe(1_470_000);
    expect(lineAmount({ quantity: 0.33, unitPrice: 10_001 })).toBe(3300);
  });
});

describe("VAT (부가세 10%)", () => {
  it("adds 10% of the supply amount and truncates won fractions", () => {
    expect(vatOf(1_000_000)).toBe(100_000);
    expect(vatOf(1_234_567)).toBe(123_456);
  });

  it("builds totals with a discount applied before tax", () => {
    const totals = computeTotals(items, { discount: 70_000, taxMode: "vat" });
    expect(totals.subtotal).toBe(960_000 + 1_470_000 + 300_000);
    expect(totals.supply).toBe(2_660_000);
    expect(totals.vat).toBe(266_000);
    expect(totals.billed).toBe(2_926_000);
    expect(totals.withholding).toBe(0);
    expect(totals.payout).toBe(2_926_000);
    expect(totals.hours).toBe(40.5);
  });
});

describe("withholding (사업소득 3.3%)", () => {
  it("splits into 소득세 3% and 지방소득세 0.3%", () => {
    expect(withholdingOf(1_000_000)).toEqual({ incomeTax: 30_000, localTax: 3_000, total: 33_000 });
  });

  it("truncates each tax to 10 won", () => {
    // 1,234,567 × 3% = 37,037.01 → 37,030; 지방소득세 3,703 → 3,700
    expect(withholdingOf(1_234_567)).toEqual({ incomeTax: 37_030, localTax: 3_700, total: 40_730 });
  });

  it("does not withhold when 소득세 is under 1,000 won (소액부징수)", () => {
    expect(withholdingOf(33_000).total).toBe(0);
    expect(withholdingOf(33_340)).toEqual({ incomeTax: 1_000, localTax: 100, total: 1_100 });
  });

  it("bills the supply amount and pays out the rest", () => {
    const totals = computeTotals(items, { taxMode: "withholding" });
    expect(totals.billed).toBe(2_730_000);
    expect(totals.vat).toBe(0);
    expect(totals.incomeTax).toBe(81_900);
    expect(totals.localTax).toBe(8_190);
    expect(totals.payout).toBe(2_730_000 - 90_090);
  });
});

describe("totals edge cases", () => {
  it("clamps the discount to the subtotal and ignores negatives", () => {
    expect(computeTotals(items, { discount: 99_999_999, taxMode: "vat" }).supply).toBe(0);
    expect(computeTotals(items, { discount: -5, taxMode: "none" }).discount).toBe(0);
  });

  it("returns zeros for an empty document", () => {
    const totals = computeTotals([], { taxMode: "withholding" });
    expect(totals).toMatchObject({ subtotal: 0, supply: 0, billed: 0, withholding: 0, payout: 0, hours: 0 });
  });

  it("adds no tax line in `none` mode", () => {
    const totals = computeTotals(items, { taxMode: "none" });
    expect(totals.billed).toBe(totals.supply);
    expect(totals.payout).toBe(totals.supply);
  });
});

describe("amount in words (금액 한글 표기)", () => {
  it("spells amounts the way Korean documents do", () => {
    expect(wonInWords(3_000_000)).toBe("삼백만");
    expect(wonInWords(1_230_000)).toBe("일백이십삼만");
    expect(wonInWords(11_000_000)).toBe("일천일백만");
    expect(wonInWords(100_010_500)).toBe("일억일만오백");
    expect(wonInWords(967_000)).toBe("구십육만칠천");
    expect(wonInWords(0)).toBe("영");
  });
});
