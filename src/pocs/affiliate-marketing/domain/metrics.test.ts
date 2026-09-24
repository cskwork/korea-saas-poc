import { describe, expect, it } from "vitest";
import { addDays, dayRange, daysInMonth, isDayKey, monthEnd, seoulRange, shiftMonth } from "./dates";
import {
  breakdown,
  conversionRate,
  delta,
  earningsPerClick,
  fillDailySeries,
  goalProgress,
  hourlyBuckets,
  niceCeiling,
  payoutState,
  peakWindow,
  sumSeries,
} from "./metrics";

describe("rates", () => {
  it("guards against zero clicks", () => {
    expect(conversionRate(3, 100)).toBeCloseTo(0.03);
    expect(conversionRate(3, 0)).toBe(0);
    expect(earningsPerClick(21_900, 100)).toBe(219);
    expect(earningsPerClick(100, 0)).toBe(0);
  });

  it("describes change against a previous period", () => {
    expect(delta(150, 100)).toEqual({ direction: "up", difference: 50, ratio: 0.5 });
    expect(delta(50, 100)).toMatchObject({ direction: "down", ratio: -0.5 });
    expect(delta(10, 0)).toMatchObject({ direction: "up", ratio: null });
    expect(delta(7, 7).direction).toBe("flat");
  });
});

describe("daily series", () => {
  it("fills missing days with zeros and sums", () => {
    const series = fillDailySeries(
      [{ day: "2026-09-01", clicks: 10 }, { day: "2026-09-03", clicks: 5 }],
      [{ day: "2026-09-03", conversions: 1, revenue: 6_570 }],
      "2026-09-01",
      "2026-09-04",
    );
    expect(series.map((p) => p.day)).toEqual(["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"]);
    expect(series[1]).toEqual({ day: "2026-09-02", clicks: 0, conversions: 0, revenue: 0 });
    expect(sumSeries(series)).toEqual({ clicks: 15, conversions: 1, revenue: 6_570 });
  });
});

describe("goal progress", () => {
  it("projects the month at the current pace", () => {
    const goal = goalProgress(240_000, 400_000, "2026-09-24");
    expect(goal.ratio).toBeCloseTo(0.6);
    expect(goal.remaining).toBe(160_000);
    expect(goal.projected).toBe(300_000);
    expect(goal.neededPerDay).toBe(26_667); // 160,000 over the 6 days left, rounded up
  });

  it("stops asking once the goal is reached", () => {
    const goal = goalProgress(500_000, 400_000, "2026-09-30");
    expect(goal.remaining).toBe(0);
    expect(goal.neededPerDay).toBe(0);
    expect(goal.ratio).toBeGreaterThan(1);
  });
});

describe("breakdown", () => {
  it("joins clicks and orders by key with share, CVR and EPC, revenue first", () => {
    const rows = breakdown(
      [{ key: "a", clicks: 100 }, { key: "b", clicks: 300 }],
      [{ key: "a", conversions: 5, revenue: 30_000 }, { key: "c", conversions: 1, revenue: 4_000 }],
      ["a", "b", "c", "d"],
    );
    expect(rows.map((r) => r.key)).toEqual(["a", "c", "b", "d"]);
    const a = rows[0];
    expect(a).toMatchObject({ clicks: 100, conversions: 5, revenue: 30_000, share: 0.25, cvr: 0.05, epc: 300 });
    expect(rows.find((r) => r.key === "d")).toMatchObject({ clicks: 0, share: 0, cvr: 0 });
  });
});

describe("hours", () => {
  it("buckets hours and finds the busiest 3-hour window, wrapping midnight", () => {
    const buckets = hourlyBuckets([{ hour: 20, clicks: 9 }, { hour: 21, clicks: 10 }, { hour: 22, clicks: 8 }, { hour: 3, clicks: 1 }, { hour: 30, clicks: 99 }]);
    expect(buckets).toHaveLength(24);
    expect(buckets[21]).toBe(10);
    expect(peakWindow(buckets)).toEqual({ start: 20, clicks: 27 });
    const late = hourlyBuckets([{ hour: 23, clicks: 5 }, { hour: 0, clicks: 5 }, { hour: 1, clicks: 5 }]);
    expect(peakWindow(late).start).toBe(23);
  });
});

describe("axes and payouts", () => {
  it("rounds axis maxima up to nice numbers", () => {
    expect(niceCeiling(0)).toBe(1);
    expect(niceCeiling(87)).toBe(100);
    expect(niceCeiling(180)).toBe(200);
    expect(niceCeiling(2_300)).toBe(2_500);
    expect(niceCeiling(41_000)).toBe(50_000);
  });

  it("tells how far confirmed commission is from the minimum payout", () => {
    expect(payoutState(12_000, 10_000)).toEqual({ reached: true });
    expect(payoutState(8_000, 10_000)).toEqual({ reached: false, remaining: 2_000 });
  });
});

describe("Seoul calendar keys", () => {
  it("does day and month arithmetic on keys", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(dayRange("2026-09-29", "2026-10-02")).toHaveLength(4);
    expect(daysInMonth("2028-02-10")).toBe(29);
    expect(monthEnd("2026-09-24")).toBe("2026-09-30");
    expect(shiftMonth("2026-01-15", -1)).toBe("2025-12-01");
    expect(isDayKey("2026-02-30")).toBe(false);
    expect(isDayKey("2026-09-24")).toBe(true);
  });

  it("maps a Seoul day to UTC instants (UTC+9)", () => {
    const { start, end } = seoulRange("2026-09-24", "2026-09-24");
    expect(start.toISOString()).toBe("2026-09-23T15:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-24T15:00:00.000Z");
  });
});
