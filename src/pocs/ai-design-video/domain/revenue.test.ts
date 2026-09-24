import { describe, expect, it } from "vitest";
import {
  averageTicket,
  categorySplit,
  goalProgress,
  monthChange,
  monthlyTotals,
  planSplit,
  type DeliveredOrder,
} from "./revenue";

const orders: DeliveredOrder[] = [
  { type: "thumbnail", plan: "single", total: 150_000, deliveredOn: "2026-09-02" },
  { type: "thumbnail", plan: "single", total: 100_000, deliveredOn: "2026-09-20" },
  { type: "video_edit", plan: "single", total: 300_000, deliveredOn: "2026-08-31" },
  { type: "bundle", plan: "subscription", total: 590_000, deliveredOn: "2026-08-31" },
  { type: "logo", plan: "single", total: 500_000, deliveredOn: "2026-03-10" },
];

describe("monthlyTotals", () => {
  it("buckets deliveries by month and keeps empty months", () => {
    expect(monthlyTotals(orders, "2026-09", 3)).toEqual([
      { month: "2026-07", total: 0, count: 0 },
      { month: "2026-08", total: 890_000, count: 2 },
      { month: "2026-09", total: 250_000, count: 2 },
    ]);
  });
});

describe("categorySplit", () => {
  it("sorts types by revenue and leaves out empty ones", () => {
    const split = categorySplit(orders);
    expect(split.map((s) => s.type)).toEqual(["bundle", "logo", "video_edit", "thumbnail"]);
    expect(split.reduce((acc, s) => acc + s.share, 0)).toBeCloseTo(1);
    expect(split.find((s) => s.type === "thumbnail")).toMatchObject({ total: 250_000, count: 2 });
  });

  it("handles no deliveries", () => {
    expect(categorySplit([])).toEqual([]);
  });
});

describe("goal and tickets", () => {
  it("computes what is still needed per remaining day", () => {
    const progress = goalProgress(6_000_000, 15_000_000, "2026-09-24");
    expect(progress.ratio).toBeCloseTo(0.4);
    expect(progress.remaining).toBe(9_000_000);
    expect(progress.daysLeft).toBe(7);
    expect(progress.perDayNeeded).toBe(1_285_715);
  });

  it("does not ask for more once the goal is reached", () => {
    expect(goalProgress(16_000_000, 15_000_000, "2026-09-30")).toMatchObject({
      remaining: 0,
      perDayNeeded: 0,
      daysLeft: 1,
    });
  });

  it("splits single and subscription revenue", () => {
    expect(planSplit(orders)).toEqual({ single: 1_050_000, subscription: 590_000 });
    expect(averageTicket(orders)).toBe(328_000);
    expect(monthChange(250_000, 890_000)).toBeCloseTo(-0.719, 3);
    expect(monthChange(100, 0)).toBeNull();
  });
});
