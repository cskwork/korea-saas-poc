import { describe, expect, it } from "vitest";
import { billingPeriod, chargesFor, currentPeriod, duePeriods, tierAt } from "./billing";

describe("billing periods", () => {
  it("anchors every period on the upgrade day without drifting through short months", () => {
    expect(billingPeriod("2026-01-31", 0)).toEqual({ periodStart: "2026-01-31", periodEnd: "2026-02-27" });
    expect(billingPeriod("2026-01-31", 1)).toEqual({ periodStart: "2026-02-28", periodEnd: "2026-03-30" });
    expect(billingPeriod("2026-01-31", 2)).toEqual({ periodStart: "2026-03-31", periodEnd: "2026-04-29" });
  });

  it("lists the periods that have started", () => {
    expect(duePeriods("2026-07-10", "2026-09-09").map((period) => period.periodStart)).toEqual(["2026-07-10", "2026-08-10"]);
    expect(duePeriods("2026-07-10", "2026-09-10")).toHaveLength(3);
    expect(duePeriods("2026-09-25", "2026-09-24")).toEqual([]);
    expect(currentPeriod("2026-07-10", "2026-09-24")).toEqual({ periodStart: "2026-09-10", periodEnd: "2026-10-09" });
    expect(currentPeriod("2026-09-25", "2026-09-24")).toBeNull();
  });

  it("charges at the upgrade, then each renewal at 09:00 Seoul (never in the future)", () => {
    const upgradedAt = new Date("2026-07-10T05:00:00Z");
    const now = new Date("2026-09-09T23:30:00Z"); // 08:30 on the 10th in Seoul
    const charges = chargesFor(upgradedAt, "2026-09-10", now);
    expect(charges.map((charge) => charge.paidAt.toISOString())).toEqual([
      "2026-07-10T05:00:00.000Z",
      "2026-08-10T00:00:00.000Z",
      now.toISOString(),
    ]);
  });

  it("replays tier changes", () => {
    const changes = [
      { kind: "downgrade" as const, occurredAt: new Date("2026-08-01") },
      { kind: "upgrade" as const, occurredAt: new Date("2026-06-01") },
    ];
    expect(tierAt(changes, new Date("2026-05-01"))).toBe("free");
    expect(tierAt(changes, new Date("2026-07-01"))).toBe("premium");
    expect(tierAt(changes, new Date("2026-08-01"))).toBe("free");
    expect(tierAt([], new Date())).toBe("free");
  });
});
