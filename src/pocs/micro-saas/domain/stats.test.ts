import { describe, expect, it } from "vitest";
import { nextToCome, summarizeHistory, tally, weekSeries } from "./stats";

const row = (date: string, startMinute: number, status: "confirmed" | "pending" | "cancelled", price = 10_000) => ({
  date,
  startMinute,
  status,
  price,
});

describe("stats", () => {
  it("tallies a day by status", () => {
    expect(tally([row("d", 0, "confirmed"), row("d", 0, "pending"), row("d", 0, "cancelled"), row("d", 0, "confirmed")])).toEqual({
      total: 4,
      confirmed: 2,
      pending: 1,
      cancelled: 1,
    });
  });

  it("finds the next customer still to come today", () => {
    const clock = { date: "2026-09-24", minute: 700 };
    const rows = [row("2026-09-24", 600, "confirmed"), row("2026-09-24", 780, "cancelled"), row("2026-09-24", 900, "pending"), row("2026-09-25", 600, "confirmed")];
    expect(nextToCome(rows, clock)?.startMinute).toBe(900);
    expect(nextToCome(rows, { date: "2026-09-24", minute: 1000 })).toBeUndefined();
  });

  it("splits the week into confirmed and pending, excluding cancellations", () => {
    const week = weekSeries(
      [row("2026-09-21", 600, "confirmed", 15_000), row("2026-09-21", 660, "pending"), row("2026-09-24", 600, "cancelled"), row("2026-09-27", 600, "confirmed", 50_000)],
      "2026-09-21",
      "2026-09-24",
    );
    expect(week.days.map((d) => d.label).join("")).toBe("월화수목금토일");
    expect(week.days[0]).toMatchObject({ confirmed: 1, pending: 1 });
    expect(week.days[3]).toMatchObject({ confirmed: 0, pending: 0, isToday: true });
    expect(week.max).toBe(2);
    expect(week.total).toBe(3);
    expect(week.confirmedRevenue).toBe(65_000);
  });

  it("summarises a customer's visits, spend and next booking", () => {
    const clock = { date: "2026-09-24", minute: 720 };
    const summary = summarizeHistory(
      [
        row("2026-08-01", 600, "confirmed", 15_000),
        row("2026-09-24", 660, "confirmed", 40_000),
        row("2026-09-10", 600, "cancelled", 50_000),
        row("2026-09-24", 780, "pending", 30_000),
        row("2026-10-02", 600, "confirmed", 15_000),
      ],
      clock,
    );
    expect(summary).toEqual({
      visits: 2,
      spent: 55_000,
      lastVisit: "2026-09-24",
      cancellations: 1,
      next: { date: "2026-09-24", startMinute: 780 },
    });
  });
});
