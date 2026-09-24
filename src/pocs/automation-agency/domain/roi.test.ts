import { describe, expect, it } from "vitest";
import { computeRoi, roiJourney, WEEKS_PER_MONTH } from "./roi";

const base = { weeklyHours: 30, hourlyCost: 25_000, automationRate: 60, investment: 2_000_000, monthlyFee: 300_000 };

describe("computeRoi", () => {
  it("turns weekly hours into monthly hours and won saved", () => {
    const r = computeRoi(base);
    expect(r.monthlyHoursSaved).toBeCloseTo(30 * WEEKS_PER_MONTH * 0.6);
    expect(r.monthlySavings).toBe(Math.round(30 * WEEKS_PER_MONTH * 0.6 * 25_000));
    expect(r.yearlySavings).toBe(r.monthlySavings * 12);
    expect(r.monthlyNet).toBe(r.monthlySavings - 300_000);
  });

  it("computes payback months from the net monthly saving", () => {
    const r = computeRoi(base);
    expect(r.paybackMonths).toBe(Math.ceil(2_000_000 / r.monthlyNet));
    expect(r.paybackMonths).toBe(2);
  });

  it("computes first-year ROI against build fee plus twelve months of maintenance", () => {
    const r = computeRoi(base);
    const cost = 2_000_000 + 300_000 * 12;
    expect(r.firstYearCost).toBe(cost);
    expect(r.roi).toBeCloseTo((r.yearlySavings - cost) / cost);
  });

  it("never pays back when the fee eats the saving", () => {
    const r = computeRoi({ ...base, weeklyHours: 2, monthlyFee: 500_000 });
    expect(r.monthlyNet).toBeLessThan(0);
    expect(r.paybackMonths).toBeNull();
    expect(r.roi).toBeLessThan(0);
  });

  it("pays back immediately with no build fee and a positive net", () => {
    expect(computeRoi({ ...base, investment: 0 }).paybackMonths).toBe(0);
  });

  it("returns no ROI ratio when nothing is spent", () => {
    expect(computeRoi({ ...base, investment: 0, monthlyFee: 0 }).roi).toBeNull();
  });

  it("clamps the automation share to 0–100%", () => {
    expect(computeRoi({ ...base, automationRate: 150 }).monthlyHoursSaved).toBeCloseTo(30 * WEEKS_PER_MONTH);
  });
});

describe("roiJourney", () => {
  it("starts at minus the build fee and crosses zero at the payback month", () => {
    const journey = roiJourney(base, 12);
    expect(journey).toHaveLength(13);
    expect(journey[0]).toEqual({ month: 0, balance: -2_000_000 });
    const payback = computeRoi(base).paybackMonths as number;
    expect(journey[payback].balance).toBeGreaterThanOrEqual(0);
    expect(journey[payback - 1].balance).toBeLessThan(0);
  });
});
