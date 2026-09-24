import { describe, expect, it } from "vitest";
import { computeCommission, describeTerms, formatRate, parseRatePercent, parseWon, rateInputValue } from "./commission";

describe("computeCommission", () => {
  it("takes a percentage of the order and truncates to whole won", () => {
    expect(computeCommission({ commissionType: "percent", commissionRateBp: 300, commissionFixedWon: 0 }, 219_000)).toBe(6_570);
    expect(computeCommission({ commissionType: "percent", commissionRateBp: 350, commissionFixedWon: 0 }, 249_000)).toBe(8_715);
    // 33,333 × 3% = 999.99 → 999 (programs never round up)
    expect(computeCommission({ commissionType: "percent", commissionRateBp: 300, commissionFixedWon: 0 }, 33_333)).toBe(999);
  });

  it("pays a fixed amount per conversion regardless of order size", () => {
    const terms = { commissionType: "fixed" as const, commissionRateBp: 900, commissionFixedWon: 4_000 };
    expect(computeCommission(terms, 0)).toBe(4_000);
    expect(computeCommission(terms, 1_000_000)).toBe(4_000);
  });

  it("never returns a negative or fractional amount", () => {
    expect(computeCommission({ commissionType: "percent", commissionRateBp: 300, commissionFixedWon: 0 }, -5_000)).toBe(0);
    expect(computeCommission({ commissionType: "percent", commissionRateBp: -300, commissionFixedWon: 0 }, 5_000)).toBe(0);
    expect(computeCommission({ commissionType: "fixed", commissionRateBp: 0, commissionFixedWon: 1234.9 }, 0)).toBe(1_234);
  });
});

describe("rate parsing and formatting", () => {
  it("parses percent strings into basis points", () => {
    expect(parseRatePercent("3")).toBe(300);
    expect(parseRatePercent("3.5")).toBe(350);
    expect(parseRatePercent("12.25%")).toBe(1_225);
    expect(parseRatePercent(" 0 ")).toBe(0);
    expect(parseRatePercent("100")).toBe(10_000);
  });

  it("rejects malformed or out-of-range rates", () => {
    for (const bad of ["", "abc", "3.555", "101", "-1", "3,5"]) expect(parseRatePercent(bad)).toBeNull();
  });

  it("formats basis points compactly and round-trips through the input value", () => {
    expect(formatRate(300)).toBe("3%");
    expect(formatRate(350)).toBe("3.5%");
    expect(formatRate(1_225)).toBe("12.25%");
    expect(parseRatePercent(rateInputValue(350))).toBe(350);
  });

  it("describes terms in Korean", () => {
    expect(describeTerms({ commissionType: "percent", commissionRateBp: 300, commissionFixedWon: 0 })).toBe("판매가의 3%");
    expect(describeTerms({ commissionType: "fixed", commissionRateBp: 0, commissionFixedWon: 4_000 })).toBe("건당 4,000원");
  });
});

describe("parseWon", () => {
  it("accepts commas, currency marks and the 원 suffix", () => {
    expect(parseWon("219,000")).toBe(219_000);
    expect(parseWon("₩12,900")).toBe(12_900);
    expect(parseWon("12900원")).toBe(12_900);
  });

  it("rejects decimals, negatives and text", () => {
    for (const bad of ["", "12.5", "-100", "만원", "12e3"]) expect(parseWon(bad)).toBeNull();
  });
});
