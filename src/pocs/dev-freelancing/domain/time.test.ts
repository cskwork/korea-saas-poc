import { describe, expect, it } from "vitest";
import { addDays, dDay, daysBetween, isDateKey, monthRange, startOfWeek, weekdayIndex } from "./dates";
import { buildWorkCalendar, clockLabel, formatDuration, hourCells, hoursLabel, levelFor, timerMinutes } from "./time";

describe("date keys", () => {
  it("validates real calendar days", () => {
    expect(isDateKey("2026-02-28")).toBe(true);
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("2026-9-1")).toBe(false);
  });

  it("does calendar arithmetic across months and years", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(daysBetween("2026-09-01", "2026-09-24")).toBe(23);
    expect(monthRange("2026-02", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });

  it("uses Monday-first weeks", () => {
    expect(weekdayIndex("2026-09-24")).toBe(3); // Thursday
    expect(startOfWeek("2026-09-24")).toBe("2026-09-21");
    expect(startOfWeek("2026-09-27")).toBe("2026-09-21"); // Sunday belongs to the week before
  });

  it("formats D-day labels", () => {
    expect(dDay("2026-09-29", "2026-09-24")).toBe("D-5");
    expect(dDay("2026-09-24", "2026-09-24")).toBe("D-day");
    expect(dDay("2026-09-20", "2026-09-24")).toBe("D+4");
  });
});

describe("durations", () => {
  it("formats minutes in Korean", () => {
    expect(formatDuration(200)).toBe("3시간 20분");
    expect(formatDuration(120)).toBe("2시간");
    expect(formatDuration(45)).toBe("45분");
    expect(hoursLabel(200)).toBe("3.3");
    expect(hoursLabel(180)).toBe("3");
  });

  it("formats the running clock", () => {
    expect(clockLabel(5047)).toBe("01:24:07");
  });

  it("logs at least one minute when the timer stops", () => {
    const start = new Date("2026-09-24T01:00:00Z");
    expect(timerMinutes(start, new Date("2026-09-24T01:00:10Z"))).toBe(1);
    expect(timerMinutes(start, new Date("2026-09-24T02:29:40Z"))).toBe(90);
  });
});

describe("work calendar", () => {
  it("maps minutes to five levels", () => {
    expect([0, 30, 150, 300, 480].map(levelFor)).toEqual([0, 1, 2, 3, 4]);
  });

  it("builds Monday-first weeks ending with today's week and blanks the future", () => {
    const minutes = new Map([
      ["2026-09-24", 300],
      ["2026-09-21", 60],
      ["2026-09-25", 999], // tomorrow: ignored
    ]);
    const deposits = new Map([["2026-09-22", 1_500_000]]);
    const calendar = buildWorkCalendar("2026-09-24", 4, minutes, deposits);

    expect(calendar.weeks).toHaveLength(4);
    expect(calendar.weeks[3].start).toBe("2026-09-21");
    const thisWeek = calendar.weeks[3].days;
    expect(thisWeek[3]).toMatchObject({ key: "2026-09-24", level: 3, today: true, future: false });
    expect(thisWeek[4]).toMatchObject({ key: "2026-09-25", minutes: 0, future: true });
    expect(calendar.totalMinutes).toBe(360);
    expect(calendar.activeDays).toBe(2);
    expect(calendar.depositTotal).toBe(1_500_000);
  });

  it("labels the week a month starts in", () => {
    const calendar = buildWorkCalendar("2026-09-24", 10, new Map());
    expect(calendar.weeks[0].start).toBe("2026-07-20");
    expect(calendar.weeks.map((week) => week.monthStart).filter(Boolean)).toEqual(["2026-08", "2026-09"]);
  });
});

describe("hour cells", () => {
  it("draws one cell per hour for small jobs", () => {
    expect(hourCells(10, 4)).toEqual({ unit: 1, planned: 10, filled: 4, partial: 0, over: 0, unplanned: 0 });
  });

  it("marks a half-used cell as partial", () => {
    expect(hourCells(10, 4.5)).toMatchObject({ filled: 4, partial: 1 });
  });

  it("scales the unit so big estimates stay under the cell budget", () => {
    const cells = hourCells(120, 30);
    expect(cells.unit).toBe(4);
    expect(cells.planned).toBe(30);
    expect(cells).toMatchObject({ filled: 7, partial: 1 }); // 30h ÷ 4h = 7.5 cells
  });

  it("counts overrun beyond the estimate", () => {
    expect(hourCells(8, 11)).toMatchObject({ planned: 8, filled: 8, over: 3 });
  });

  it("draws tracked time without an estimate as unplanned cells", () => {
    expect(hourCells(null, 5)).toMatchObject({ planned: 0, unplanned: 5 });
  });
});
