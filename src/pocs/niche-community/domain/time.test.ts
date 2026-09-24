import { describe, expect, it } from "vitest";
import { addDays, addMonths, daysBetween, lastDayKeys, lastMonthKeys, monthEnd, monthLabel, monthStart, seoulInstant, seoulMonthKey, shiftMonth } from "./time";

describe("Seoul calendar helpers", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("clamps month arithmetic to the last day of short months", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
    expect(shiftMonth("2026-01", -2)).toBe("2025-11");
  });

  it("uses the Seoul day, not UTC", () => {
    // 2026-09-23 16:30 UTC is already the 24th in Seoul.
    const lateUtc = new Date("2026-09-23T16:30:00Z");
    expect(lastDayKeys(lateUtc, 2)).toEqual(["2026-09-23", "2026-09-24"]);
    expect(seoulMonthKey(new Date("2026-09-30T15:30:00Z"))).toBe("2026-10");
    expect(lastMonthKeys(lateUtc, 3)).toEqual(["2026-07", "2026-08", "2026-09"]);
  });

  it("turns Seoul wall-clock times into instants", () => {
    expect(seoulInstant("2026-09-26", "10:00").toISOString()).toBe("2026-09-26T01:00:00.000Z");
    expect(monthStart("2026-09").toISOString()).toBe("2026-08-31T15:00:00.000Z");
    expect(monthEnd("2026-12").toISOString()).toBe("2026-12-31T15:00:00.000Z");
  });

  it("labels months and counts days", () => {
    expect(monthLabel("2026-09", 2026)).toBe("9월");
    expect(monthLabel("2025-12", 2026)).toBe("25년 12월");
    expect(daysBetween("2026-09-01", "2026-09-24")).toBe(23);
  });
});
