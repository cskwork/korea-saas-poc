import { describe, expect, it } from "vitest";
import {
  averageRevenuePerPaid,
  circulation,
  goalProgress,
  monthlyRecurringRevenue,
  paidChurnRate,
  paidConversion,
  revenueByMonth,
  subscriptionIncome,
  type SubscriberFacts,
} from "./revenue";

const prices = { free: 0, basic: 9_900, pro: 29_900 };
const sub = (facts: Partial<SubscriberFacts>): SubscriberFacts => ({
  tier: "free",
  status: "active",
  joinedOn: "2026-01-01",
  paidSince: null,
  unsubscribedOn: null,
  ...facts,
});

const list: SubscriberFacts[] = [
  sub({}),
  sub({ tier: "basic", paidSince: "2026-07-10" }),
  sub({ tier: "pro", paidSince: "2026-08-01" }),
  sub({ tier: "pro", paidSince: "2026-06-01", status: "unsubscribed", unsubscribedOn: "2026-09-05" }),
  sub({ joinedOn: "2026-09-20" }),
];

describe("revenue", () => {
  it("counts MRR from active paid subscribers only", () => {
    expect(monthlyRecurringRevenue(list, prices)).toBe(9_900 + 29_900);
  });

  it("bills everyone paying at any point of a month", () => {
    expect(subscriptionIncome(list, prices, "2026-06")).toBe(29_900);
    expect(subscriptionIncome(list, prices, "2026-07")).toBe(29_900 + 9_900);
    expect(subscriptionIncome(list, prices, "2026-09")).toBe(9_900 + 29_900 + 29_900);
    expect(subscriptionIncome(list, prices, "2026-10")).toBe(9_900 + 29_900);
  });

  it("adds sponsorships and memberships by month", () => {
    const [aug, sep] = revenueByMonth({
      months: ["2026-08", "2026-09"],
      subscribers: list,
      prices,
      sponsorships: [{ day: "2026-09-08", amount: 500_000 }],
      memberships: [
        { day: "2026-08-31", amount: 30_000 },
        { day: "2026-09-01", amount: 120_000 },
      ],
    });
    expect(aug).toEqual({ month: "2026-08", subscription: 69_700, sponsorship: 0, membership: 30_000, total: 99_700 });
    expect(sep.total).toBe(69_700 + 500_000 + 120_000);
  });

  it("derives ARPU, churn, conversion and goals", () => {
    expect(averageRevenuePerPaid(39_800, 2)).toBe(19_900);
    expect(averageRevenuePerPaid(0, 0)).toBe(0);
    expect(paidChurnRate(list, "2026-09-24")).toBeCloseTo(1 / 3);
    expect(paidConversion(list)).toBeCloseTo(2 / 4);
    expect(goalProgress(250, 1000)).toBe(0.25);
    expect(goalProgress(2000, 1000)).toBe(1);
    expect(goalProgress(10, 0)).toBe(0);
  });

  it("charts weekly circulation", () => {
    const points = circulation(list, "2026-09-24", 3);
    expect(points.map((p) => p.day)).toEqual(["2026-09-10", "2026-09-17", "2026-09-24"]);
    expect(points[0]).toEqual({ day: "2026-09-10", total: 3, paid: 2 });
    expect(points[2]).toEqual({ day: "2026-09-24", total: 4, paid: 2 });
  });
});
