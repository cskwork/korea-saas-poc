import { describe, expect, it } from "vitest";
import { addDays, addMonths, monthLabel } from "./dates";

describe("dates", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-09-24", 10)).toBe("2026-10-04");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds months, clamping to the month's last day", () => {
    expect(addMonths("2026-09-24", -8)).toBe("2026-01-24");
    expect(addMonths("2026-03-31", -1)).toBe("2026-02-28");
    expect(addMonths("2026-01-15", -2)).toBe("2025-11-15");
  });

  it("labels months, with the year when it differs", () => {
    expect(monthLabel("2026-09", 2026)).toBe("9월");
    expect(monthLabel("2025-12", 2026)).toBe("25년 12월");
  });
});
