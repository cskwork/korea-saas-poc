import { describe, expect, it } from "vitest";
import { addDays, computeAnalytics, periodDays, seoulDayStart, type AnalyticsOrder } from "./analytics";

const TODAY = "2026-09-24";

function order(day: string, overrides: Partial<AnalyticsOrder> = {}): AnalyticsOrder {
  return {
    // 10:00 Seoul on the given day
    orderedAt: new Date(`${day}T10:00:00+09:00`),
    status: "delivered",
    category: "living",
    productName: "스테인리스 텀블러",
    listingId: "tumbler",
    quantity: 1,
    unitPrice: 10_000,
    unitCost: 4_000,
    shippingCost: 2_000,
    feeRateBp: 600,
    ...overrides,
  };
}

describe("date helpers", () => {
  it("adds calendar days across month ends", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("lists the period's days oldest first", () => {
    expect(periodDays(TODAY, 3)).toEqual(["2026-09-22", "2026-09-23", "2026-09-24"]);
  });

  it("starts Seoul days at 15:00 UTC the day before", () => {
    expect(seoulDayStart(TODAY).toISOString()).toBe("2026-09-23T15:00:00.000Z");
  });
});

describe("computeAnalytics", () => {
  it("buckets orders by Seoul day and compares with the previous period", () => {
    const orders = [
      order(TODAY, { quantity: 2 }),
      order(addDays(TODAY, -6)),
      order(addDays(TODAY, -7)), // previous period
      order(addDays(TODAY, -3), { status: "cancelled" }),
      order(addDays(TODAY, -20)), // outside both periods
    ];
    const a = computeAnalytics(orders, TODAY, 7);

    expect(a.days).toHaveLength(7);
    expect(a.days.at(-1)).toEqual({ date: TODAY, revenue: 20_000, profit: 20_000 - 8_000 - 1_200 - 2_000, orders: 1 });
    expect(a.current.orders).toBe(2);
    expect(a.current.units).toBe(3);
    expect(a.current.cancelled).toBe(1);
    expect(a.current.revenue).toBe(30_000);
    expect(a.previous.orders).toBe(1);
    expect(a.previous.revenue).toBe(10_000);
    expect(a.change.revenue).toBeCloseTo(2, 5);
  });

  it("uses the Seoul day even when UTC is still the day before", () => {
    // 00:30 Seoul on TODAY is 15:30 UTC on the previous day.
    const a = computeAnalytics([order(TODAY, { orderedAt: new Date("2026-09-23T15:30:00Z") })], TODAY, 7);
    expect(a.days.at(-1)?.orders).toBe(1);
  });

  it("ranks top sellers by revenue and shares revenue by category", () => {
    const orders = [
      order(TODAY, { listingId: "a", productName: "A", unitPrice: 30_000, category: "fashion" }),
      order(TODAY, { listingId: "b", productName: "B", unitPrice: 10_000, quantity: 3, category: "living" }),
      order(TODAY, { listingId: null, productName: "B", unitPrice: 10_000, category: "living" }),
    ];
    const a = computeAnalytics(orders, TODAY, 7);
    expect(a.topSellers.map((s) => [s.listingId, s.units, s.revenue])).toEqual([
      ["b", 3, 30_000], // ties on revenue break on units
      ["a", 1, 30_000],
      [null, 1, 10_000], // a deleted listing's sales group by name
    ]);
    expect(a.categories.map((c) => c.category)).toEqual(["living", "fashion"]);
    expect(a.categories.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(1, 5);
  });

  it("reports no change when the previous period is empty", () => {
    const a = computeAnalytics([order(TODAY)], TODAY, 14);
    expect(a.change.revenue).toBeNull();
    expect(a.current.marginRate).toBeCloseTo(a.current.profit / a.current.revenue, 5);
  });

  it("handles no orders at all", () => {
    const a = computeAnalytics([], TODAY, 30);
    expect(a.days).toHaveLength(30);
    expect(a.current).toMatchObject({ revenue: 0, orders: 0, marginRate: 0 });
    expect(a.topSellers).toEqual([]);
  });
});
