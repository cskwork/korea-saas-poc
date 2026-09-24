import { describe, expect, it } from "vitest";
import { adjustedUnit, amountInKorean, charge, nextQuoteNumber, quoteTotals } from "./quote";

describe("quote pricing", () => {
  it("applies the complexity multiplier and rounds to 1,000 won", () => {
    expect(adjustedUnit(1_500_000, "simple")).toBe(1_050_000);
    expect(adjustedUnit(1_500_000, "normal")).toBe(1_500_000);
    expect(adjustedUnit(1_500_000, "complex")).toBe(2_250_000);
    expect(adjustedUnit(150_000, "simple")).toBe(105_000);
    expect(adjustedUnit(333_333, "normal")).toBe(333_000);
  });

  it("adds 10% VAT, truncating below one won", () => {
    expect(charge(1_234_567)).toEqual({ supply: 1_234_567, vat: 123_456, total: 1_358_023 });
  });

  it("totals build and monthly charges separately and the first year together", () => {
    const totals = quoteTotals([
      { name: "엑셀 자동화", complexity: "normal", quantity: 1, unitSetupFee: 1_500_000, unitMonthlyFee: 300_000 },
      { name: "알림톡 연동", complexity: "simple", quantity: 2, unitSetupFee: 500_000, unitMonthlyFee: 50_000 },
    ]);
    expect(totals.lines.map((l) => [l.setupAmount, l.monthlyAmount])).toEqual([
      [1_500_000, 300_000],
      [700_000, 70_000],
    ]);
    expect(totals.setup).toEqual({ supply: 2_200_000, vat: 220_000, total: 2_420_000 });
    expect(totals.monthly).toEqual({ supply: 370_000, vat: 37_000, total: 407_000 });
    expect(totals.firstYearTotal).toBe(2_420_000 + 407_000 * 12);
  });

  it("totals an empty quote as zero", () => {
    expect(quoteTotals([]).firstYearTotal).toBe(0);
  });
});

describe("nextQuoteNumber", () => {
  it("continues the year's sequence and restarts in a new year", () => {
    expect(nextQuoteNumber(["Q-2026-0001", "Q-2026-0007", "Q-2025-0031"], 2026)).toBe("Q-2026-0008");
    expect(nextQuoteNumber(["Q-2025-0031"], 2026)).toBe("Q-2026-0001");
    expect(nextQuoteNumber([], 2026)).toBe("Q-2026-0001");
  });
});

describe("amountInKorean", () => {
  it.each([
    [0, "영"],
    [10_000, "일만"],
    [1_100_000, "일백일십만"],
    [3_300_000, "삼백삼십만"],
    [2_420_000, "이백사십이만"],
    [123_456_789, "일억이천삼백사십오만육천칠백팔십구"],
    [100_000_000, "일억"],
  ])("%i → %s", (amount, words) => {
    expect(amountInKorean(amount)).toBe(words);
  });
});
