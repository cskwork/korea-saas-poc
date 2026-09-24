import { describe, expect, it } from "vitest";
import { formatKrw, formatPercent, formatRelative, formatTime, formatWon, seoulDateKey } from "./format";

describe("format", () => {
  it("formats won", () => {
    expect(formatWon(15000)).toBe("15,000원");
    expect(formatKrw(1234567.4)).toBe("₩1,234,567");
  });

  it("formats percent", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
  });

  it("uses Seoul time regardless of server zone", () => {
    const utcMidnight = new Date("2026-09-23T15:30:00Z"); // 00:30 KST next day
    expect(seoulDateKey(utcMidnight)).toBe("2026-09-24");
    expect(formatTime(utcMidnight)).toBe("00:30");
  });

  it("formats relative time in Korean", () => {
    const now = new Date("2026-09-24T12:00:00Z");
    expect(formatRelative(new Date("2026-09-24T11:59:50Z"), now)).toBe("방금");
    expect(formatRelative(new Date("2026-09-24T11:57:00Z"), now)).toBe("3분 전");
    expect(formatRelative(new Date("2026-09-22T12:00:00Z"), now)).toBe("그저께");
  });
});
