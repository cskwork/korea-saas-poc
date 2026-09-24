import { describe, expect, it } from "vitest";
import {
  dDay,
  lastMonths,
  loopRiders,
  monthlyRecurringRevenue,
  mrrHistory,
  pipeline,
  rankPackages,
  stationSummaries,
  upcomingArrivals,
  type ProjectRow,
} from "./dashboard";

const today = "2026-09-24";
const project = (over: Partial<ProjectRow>): ProjectRow => ({
  id: over.clientName ?? "p",
  clientName: "고객",
  stage: "development",
  progress: 50,
  dueDate: null,
  setupFee: 1_000_000,
  monthlyFee: 200_000,
  maintenanceStatus: "none",
  maintenanceStartedOn: null,
  maintenanceEndedOn: null,
  ...over,
});

const rows = [
  project({ clientName: "가", stage: "development", dueDate: "2026-09-20" }),
  project({ clientName: "나", stage: "testing", dueDate: "2026-09-27" }),
  project({
    clientName: "다",
    stage: "maintenance",
    maintenanceStatus: "active",
    monthlyFee: 300_000,
    maintenanceStartedOn: "2026-05-10",
  }),
  project({
    clientName: "라",
    stage: "maintenance",
    maintenanceStatus: "paused",
    monthlyFee: 150_000,
    maintenanceStartedOn: "2026-03-01",
  }),
  project({
    clientName: "마",
    stage: "maintenance",
    maintenanceStatus: "ended",
    monthlyFee: 400_000,
    maintenanceStartedOn: "2026-01-05",
    maintenanceEndedOn: "2026-07-15",
  }),
];

describe("dashboard metrics", () => {
  it("counts only running subscriptions as MRR", () => {
    expect(monthlyRecurringRevenue(rows)).toBe(300_000);
  });

  it("puts running riders before paused ones on the loop", () => {
    expect(loopRiders(rows).map((r) => [r.clientName, r.status])).toEqual([
      ["다", "active"],
      ["라", "paused"],
    ]);
  });

  it("reconstructs MRR month by month from start and end dates", () => {
    const history = mrrHistory(rows, today, 6);
    expect(history.map((h) => h.month)).toEqual(["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]);
    expect(history.map((h) => h.mrr)).toEqual([400_000, 700_000, 700_000, 300_000, 300_000, 300_000]);
  });

  it("groups delivery projects by station and flags overdue ones", () => {
    const stations = stationSummaries(rows, today);
    expect(stations.map((s) => s.stage)).toEqual(["waiting", "analysis", "development", "testing", "deployment"]);
    expect(stations[2].projects).toEqual([{ id: "가", clientName: "가", progress: 50, overdue: true }]);
  });

  it("lists upcoming deadlines soonest first, overdue included", () => {
    expect(upcomingArrivals(rows, today).map((a) => [a.clientName, a.days])).toEqual([
      ["가", -4],
      ["나", 3],
    ]);
    expect([dDay(-4), dDay(0), dDay(3)]).toEqual(["D+4", "D-DAY", "D-3"]);
  });

  it("sums open, unexpired quotes into the pipeline", () => {
    const line = {
      name: "x",
      complexity: "normal" as const,
      quantity: 1,
      unitSetupFee: 1_000_000,
      unitMonthlyFee: 100_000,
    };
    const q = { id: "q", number: "Q", clientName: "c", issuedOn: "2026-09-01" };
    const result = pipeline(
      [
        { ...q, status: "sent", validUntil: "2026-10-01", lines: [line] },
        { ...q, status: "sent", validUntil: "2026-09-01", lines: [line] },
        { ...q, status: "accepted", validUntil: "2026-10-01", lines: [line] },
        { ...q, status: "declined", validUntil: "2026-10-01", lines: [line] },
        { ...q, status: "draft", validUntil: "2026-10-01", lines: [line] },
      ],
      today,
    );
    expect(result).toEqual({ openCount: 1, setupValue: 1_000_000, monthlyValue: 100_000, draftCount: 1, winRate: 0.5 });
  });

  it("ranks packages by sales, then quotes", () => {
    expect(
      rankPackages([
        { packageId: "a", projects: 0, quotes: 3 },
        { packageId: "b", projects: 2, quotes: 0 },
        { packageId: "c", projects: 0, quotes: 0 },
      ]).map((u) => u.packageId),
    ).toEqual(["b", "a"]);
  });

  it("builds month keys across a year boundary", () => {
    expect(lastMonths("2026-02-10", 4)).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
  });
});
