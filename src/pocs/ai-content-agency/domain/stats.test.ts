import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  deliveryPerformance,
  headlineCounts,
  kindMix,
  ordersThisMonth,
  pipelineCounts,
  weeklyThroughput,
  type OrderFacts,
} from "./stats";

const today = "2026-09-24"; // Thursday

const order = (overrides: Partial<OrderFacts>): OrderFacts => ({
  status: "writing",
  kind: "blog",
  createdOn: "2026-09-20",
  dueDate: "2026-09-26",
  deliveredOn: null,
  ...overrides,
});

const orders: OrderFacts[] = [
  order({ status: "received", createdOn: "2026-09-24", dueDate: "2026-09-30" }),
  order({ status: "writing", dueDate: "2026-09-23" }), // late
  order({ status: "review", kind: "ad", dueDate: today }), // due today
  order({ status: "review", kind: "product", dueDate: "2026-09-27" }),
  order({ status: "delivered", createdOn: "2026-09-01", dueDate: "2026-09-05", deliveredOn: "2026-09-04" }),
  order({ status: "delivered", createdOn: "2026-08-25", dueDate: "2026-08-28", deliveredOn: "2026-08-31" }),
];

describe("dashboard statistics", () => {
  it("counts the pipeline and kinds", () => {
    expect(pipelineCounts(orders)).toEqual({ received: 1, writing: 1, review: 2, delivered: 2 });
    expect(kindMix(orders)).toEqual({ blog: 4, product: 1, ad: 1 });
  });

  it("summarises what needs attention today", () => {
    expect(headlineCounts(orders, today)).toEqual({ dueToday: 1, late: 1, awaitingReview: 2, dueThisWeek: 2 });
  });

  it("counts orders received this month", () => {
    expect(ordersThisMonth(orders, today)).toBe(5);
  });

  it("measures on-time delivery and turnaround", () => {
    expect(deliveryPerformance(orders)).toEqual({ delivered: 2, onTime: 1, onTimeRate: 0.5, averageTurnaroundDays: 4.5 });
    expect(deliveryPerformance([]).onTimeRate).toBeNull();
  });

  it("groups throughput by Monday-starting week, ending this week", () => {
    const weeks = weeklyThroughput(orders, today, 5);
    expect(weeks.map((w) => w.weekStart)).toEqual(["2026-08-24", "2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21"]);
    expect(weeks[0]).toEqual({ weekStart: "2026-08-24", received: 1, delivered: 0 });
    expect(weeks[1]).toEqual({ weekStart: "2026-08-31", received: 1, delivered: 2 });
    // 9/20 is a Sunday, so those three requests belong to the week of 9/14.
    expect(weeks[3].received).toBe(3);
    expect(weeks[4].received).toBe(1);
  });
});

describe("buildTimeline", () => {
  it("draws open orders from request to due date around today", () => {
    const timeline = buildTimeline(orders, today, { before: 3, after: 10 });
    expect(timeline.days).toHaveLength(14);
    expect(timeline.days[timeline.todayIndex]).toBe(today);
    expect(timeline.bars).toHaveLength(4);
    // Sorted by due date: the late order first.
    const [late, dueToday] = timeline.bars;
    expect(late).toMatchObject({ start: 0, end: 2, overrunEnd: 3, clippedStart: true });
    expect(dueToday).toMatchObject({ end: 3, overrunEnd: null });
  });

  it("clips bars that run past the window and still shows long-late orders", () => {
    const timeline = buildTimeline(
      [order({ createdOn: "2026-09-01", dueDate: "2026-09-10" }), order({ createdOn: today, dueDate: "2026-10-30" })],
      today,
    );
    expect(timeline.bars[0]).toMatchObject({ start: 0, end: 0, overrunEnd: 3 });
    expect(timeline.bars[1]).toMatchObject({ start: 3, end: 13, clippedEnd: true });
    expect(timeline.hidden).toBe(0);
  });
});
