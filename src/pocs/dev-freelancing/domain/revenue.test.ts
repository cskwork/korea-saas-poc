import { describe, expect, it } from "vitest";
import { clientShares, effectiveHourlyRate, goalProgress, monthlyRevenue, receivables, taxSummary, type RevenueInvoice } from "./revenue";

const invoice = (overrides: Partial<RevenueInvoice>): RevenueInvoice => ({
  id: crypto.randomUUID(),
  clientId: "c1",
  clientName: "디지털크리에이티브",
  status: "paid",
  taxMode: "withholding",
  issuedOn: "2026-08-01",
  dueOn: "2026-08-15",
  paidOn: "2026-08-10",
  supply: 1_000_000,
  vat: 0,
  withholding: 33_000,
  payout: 967_000,
  ...overrides,
});

const invoices: RevenueInvoice[] = [
  invoice({}),
  invoice({ clientId: "c2", clientName: "스타트업허브", paidOn: "2026-09-05", issuedOn: "2026-09-01", supply: 3_000_000, withholding: 99_000, payout: 2_901_000 }),
  invoice({ status: "awaiting", paidOn: null, issuedOn: "2026-09-10", dueOn: "2026-09-20", supply: 500_000, withholding: 16_500, payout: 483_500 }),
  invoice({ status: "issued", paidOn: null, issuedOn: "2026-09-22", dueOn: "2026-10-06", supply: 800_000, withholding: 26_400, payout: 773_600 }),
  invoice({ taxMode: "vat", clientId: "c3", clientName: "에듀테크솔루션", issuedOn: "2026-03-02", paidOn: "2026-03-20", supply: 2_000_000, vat: 200_000, withholding: 0, payout: 2_200_000 }),
  invoice({ paidOn: "2025-12-20", issuedOn: "2025-12-01" }),
];

describe("monthly revenue", () => {
  it("books paid supply by payment month and issued supply by issue month", () => {
    const series = monthlyRevenue(invoices, ["2026-08", "2026-09"]);
    expect(series).toEqual([
      { month: "2026-08", paid: 1_000_000, issued: 1_000_000 },
      { month: "2026-09", paid: 3_000_000, issued: 4_300_000 },
    ]);
  });
});

describe("receivables", () => {
  it("sums unpaid payouts and ages them", () => {
    const result = receivables(invoices, "2026-09-24");
    expect(result.count).toBe(2);
    expect(result.amount).toBe(483_500 + 773_600);
    expect(result.overdueCount).toBe(1);
    expect(result.buckets.d1_30).toBe(483_500);
    expect(result.buckets.current).toBe(773_600);
  });
});

describe("rates and goals", () => {
  it("computes won per tracked hour", () => {
    expect(effectiveHourlyRate(3_000_000, 50 * 60)).toBe(60_000);
    expect(effectiveHourlyRate(3_000_000, 0)).toBeNull();
  });

  it("fills goal cells and caps at the goal", () => {
    expect(goalProgress(2_800_000, 5_000_000)).toMatchObject({ filled: 5, partial: 1, cells: 10 });
    expect(goalProgress(2_600_000, 5_000_000)).toMatchObject({ filled: 5, partial: 0 });
    expect(goalProgress(9_000_000, 5_000_000)).toMatchObject({ filled: 10, partial: 0 });
    expect(goalProgress(100, 0).ratio).toBe(0);
  });
});

describe("tax summary", () => {
  it("adds up withheld tax by payment year and VAT by 1기/2기 issue date", () => {
    const summary = taxSummary(invoices, 2026);
    expect(summary.withheld).toBe(33_000 + 99_000);
    expect(summary.paidSupply).toBe(1_000_000 + 3_000_000 + 2_000_000);
    expect(summary.vatPeriods[0]).toMatchObject({ period: 1, vat: 200_000, dueOn: "2026-07-25" });
    expect(summary.vatPeriods[1]).toMatchObject({ period: 2, vat: 0, dueOn: "2027-01-25" });
  });
});

describe("client shares", () => {
  it("ranks clients by paid supply within the year", () => {
    const shares = clientShares(invoices, 2026);
    expect(shares.map((s) => s.clientName)).toEqual(["스타트업허브", "에듀테크솔루션", "디지털크리에이티브"]);
    expect(shares[0].share).toBeCloseTo(0.5);
  });
});
