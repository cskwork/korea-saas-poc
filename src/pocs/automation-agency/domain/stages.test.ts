import { describe, expect, it } from "vitest";
import { advanceStage, nextStage } from "./stages";

describe("stages", () => {
  it("travels the delivery line in order", () => {
    expect(nextStage("waiting")).toBe("analysis");
    expect(nextStage("deployment")).toBe("maintenance");
    expect(nextStage("maintenance")).toBeUndefined();
  });

  it("sets the arrival progress for the next station", () => {
    expect(
      advanceStage({ stage: "analysis", maintenanceStatus: "none", maintenanceStartedOn: null }, "2026-09-24"),
    ).toEqual({
      stage: "development",
      progress: 40,
      maintenanceStatus: "none",
      maintenanceStartedOn: null,
    });
  });

  it("starts the maintenance subscription when joining the loop", () => {
    expect(
      advanceStage({ stage: "deployment", maintenanceStatus: "none", maintenanceStartedOn: null }, "2026-09-24"),
    ).toEqual({
      stage: "maintenance",
      progress: 100,
      maintenanceStatus: "active",
      maintenanceStartedOn: "2026-09-24",
    });
  });

  it("keeps an existing start date", () => {
    const move = advanceStage(
      { stage: "deployment", maintenanceStatus: "active", maintenanceStartedOn: "2026-01-02" },
      "2026-09-24",
    );
    expect(move?.maintenanceStartedOn).toBe("2026-01-02");
  });

  it("stops at the last station", () => {
    expect(
      advanceStage(
        { stage: "maintenance", maintenanceStatus: "active", maintenanceStartedOn: "2026-01-02" },
        "2026-09-24",
      ),
    ).toBeUndefined();
  });
});
