import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  formatClosedWeekdays,
  formatDayLabel,
  formatMinute,
  hasBegun,
  isDateKey,
  isPast,
  monthGrid,
  parseTime,
  relativeDayLabel,
  seoulClock,
  shiftMonth,
  slotSpan,
  slotStarts,
  startOfWeek,
  weekdayOf,
} from "./time";

describe("time", () => {
  it("reads the shop clock in Asia/Seoul regardless of the server zone", () => {
    // 2026-09-24 15:30 UTC is 2026-09-25 00:30 in Seoul.
    expect(seoulClock(new Date("2026-09-24T15:30:00Z"))).toEqual({ date: "2026-09-25", minute: 30 });
    expect(seoulClock(new Date("2026-09-24T05:05:00Z"))).toEqual({ date: "2026-09-24", minute: 14 * 60 + 5 });
  });

  it("does date-key arithmetic across months and leap years", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2028-03-01", -1)).toBe("2028-02-29");
    expect(daysBetween("2026-09-24", "2026-10-01")).toBe(7);
    expect(weekdayOf("2026-09-24")).toBe(4);
    expect(startOfWeek("2026-09-27")).toBe("2026-09-21");
    expect(startOfWeek("2026-09-21")).toBe("2026-09-21");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });

  it("validates date keys strictly", () => {
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2028-02-29")).toBe(true);
    expect(isDateKey("2026-9-1")).toBe(false);
  });

  it("builds a Sunday-first month grid of whole weeks", () => {
    const grid = monthGrid("2026-09");
    expect(grid).toHaveLength(35);
    expect(grid[0]).toEqual({ date: "2026-08-30", inMonth: false, weekday: 0 });
    expect(grid.filter((c) => c.inMonth)).toHaveLength(30);
    expect(grid.at(-1)?.weekday).toBe(6);
  });

  it("converts between minutes and HH:MM", () => {
    expect(formatMinute(630)).toBe("10:30");
    expect(parseTime("19:30")).toBe(1170);
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("9:30")).toBeNull();
  });

  it("lists slot starts inside opening hours and rounds durations up to slots", () => {
    expect(slotStarts(600, 720)).toEqual([600, 630, 660, 690]);
    expect(slotSpan(20)).toBe(1);
    expect(slotSpan(90)).toBe(3);
    expect(slotSpan(120)).toBe(4);
  });

  it("labels days the Korean way", () => {
    expect(formatDayLabel("2026-09-24")).toBe("9월 24일 (목)");
    expect(relativeDayLabel("2026-09-25", "2026-09-24")).toBe("내일");
    expect(relativeDayLabel("2026-09-30", "2026-09-24")).toBe("9월 30일 (수)");
    expect(formatClosedWeekdays([0, 1])).toBe("매주 월요일·일요일 휴무");
    expect(formatClosedWeekdays([])).toBe("휴무일 없음");
  });

  it("tells past bookings from slots that can no longer be booked", () => {
    const clock = { date: "2026-09-24", minute: 600 };
    expect(isPast("2026-09-24", 600, clock)).toBe(false);
    expect(hasBegun("2026-09-24", 600, clock)).toBe(true);
    expect(hasBegun("2026-09-24", 630, clock)).toBe(false);
    expect(isPast("2026-09-23", 1200, clock)).toBe(true);
  });
});
