import { describe, expect, it } from "vitest";
import { CATEGORY_INFO, feeRateBp, formatFeeRate } from "./categories";
import {
  breakEvenPrice,
  computeMargin,
  costStructure,
  marginTone,
  naverFee,
  priceForTargetMargin,
  projectMonthly,
} from "./margin";

describe("category fee table", () => {
  it("keeps the legacy 3.5%–7.0% rates", () => {
    expect(Object.fromEntries(Object.entries(CATEGORY_INFO).map(([k, v]) => [k, v.feeRateBp]))).toEqual({
      fashion: 550,
      beauty: 400,
      living: 600,
      digital: 350,
      food: 700,
      etc: 500,
    });
    expect(formatFeeRate(feeRateBp("digital"))).toBe("3.5%");
  });
});

describe("computeMargin", () => {
  it("subtracts cost, the category fee and shipping from the price", () => {
    // Legacy calculator defaults: 패션 5.5%, 10,000 → 25,000, shipping 3,000.
    const m = computeMargin({ price: 25_000, cost: 10_000, shipping: 3_000, feeRateBp: 550 });
    expect(m.fee).toBe(1_375);
    expect(m.profit).toBe(10_625);
    expect(m.marginRate).toBeCloseTo(0.425, 5);
  });

  it("rounds the fee to the won", () => {
    expect(naverFee(12_900, 400)).toBe(516);
    expect(naverFee(15_950, 550)).toBe(877); // 877.25
  });

  it("reports a loss when costs exceed the price", () => {
    const m = computeMargin({ price: 7_900, cost: 6_000, shipping: 3_000, feeRateBp: 350 });
    expect(m.profit).toBe(-1_377);
    expect(marginTone(m)).toBe("loss");
  });

  it("handles a zero price without dividing by zero", () => {
    expect(computeMargin({ price: 0, cost: 0, shipping: 0, feeRateBp: 500 }).marginRate).toBe(0);
  });
});

describe("marginTone", () => {
  it("grades margins", () => {
    expect(marginTone({ profit: 0, marginRate: 0 })).toBe("loss");
    expect(marginTone({ profit: 100, marginRate: 0.1 })).toBe("thin");
    expect(marginTone({ profit: 100, marginRate: 0.2 })).toBe("fair");
    expect(marginTone({ profit: 100, marginRate: 0.3 })).toBe("strong");
  });
});

describe("breakEvenPrice", () => {
  it("is the lowest price with no loss", () => {
    const price = breakEvenPrice(10_000, 3_000, 550);
    expect(computeMargin({ price, cost: 10_000, shipping: 3_000, feeRateBp: 550 }).profit).toBeGreaterThanOrEqual(0);
    expect(computeMargin({ price: price - 1, cost: 10_000, shipping: 3_000, feeRateBp: 550 }).profit).toBeLessThan(0);
  });
});

describe("priceForTargetMargin", () => {
  it("rounds up to a price ending in 900 that meets the target", () => {
    const price = priceForTargetMargin(10_000, 3_000, 550, 0.3);
    expect(price).toBe(20_900);
    expect(
      computeMargin({ price: price!, cost: 10_000, shipping: 3_000, feeRateBp: 550 }).marginRate,
    ).toBeGreaterThanOrEqual(0.3);
  });

  it("keeps an exact x,900 price", () => {
    // (cost + shipping) / keep = 18,900 exactly
    expect(priceForTargetMargin(17_010, 0, 0, 0.1)).toBe(18_900);
  });

  it("returns null when the target cannot be reached", () => {
    expect(priceForTargetMargin(1_000, 0, 700, 0.95)).toBeNull();
  });
});

describe("projections", () => {
  const m = computeMargin({ price: 25_000, cost: 10_000, shipping: 3_000, feeRateBp: 550 });

  it("multiplies a unit margin by the monthly quantity", () => {
    expect(projectMonthly(m, 100)).toEqual({
      quantity: 100,
      revenue: 2_500_000,
      cost: 1_000_000,
      fee: 137_500,
      shipping: 300_000,
      profit: 1_062_500,
    });
  });

  it("splits the price into shares that add up to one", () => {
    const shares = costStructure(m);
    expect(shares.map((s) => s.key)).toEqual(["cost", "fee", "shipping", "profit"]);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1, 5);
  });

  it("scales shares to total costs when selling at a loss", () => {
    const loss = computeMargin({ price: 5_000, cost: 6_000, shipping: 2_000, feeRateBp: 500 });
    const shares = costStructure(loss);
    expect(shares.find((s) => s.key === "profit")?.share).toBe(0);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1, 5);
  });
});
