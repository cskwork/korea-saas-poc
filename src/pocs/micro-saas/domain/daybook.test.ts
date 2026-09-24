import { describe, expect, it } from "vitest";
import { buildDayBook } from "./daybook";

const hours = { openMinute: 600, closeMinute: 900, seats: 2, closedWeekdays: [1] };
const b = (id: string, startMinute: number, durationMinutes: number, status: "confirmed" | "pending" | "cancelled" = "confirmed") => ({
  id,
  startMinute,
  durationMinutes,
  status,
});

describe("buildDayBook", () => {
  it("lists bookings in time order with free slots drawn and long gaps collapsed", () => {
    const lines = buildDayBook({
      date: "2026-09-24",
      bookings: [b("late", 840, 30), b("perm", 600, 120)],
      hours,
      clock: { date: "2026-09-24", minute: 0 },
      ghosts: true,
    });
    expect(lines.map((l) => (l.kind === "booking" ? l.booking.id : `${l.kind}@${l.minute}`))).toEqual([
      "perm", // 10:00–12:00 covers 10:30, 11:00, 11:30
      "free-run@720", // 12:00, 12:30, 13:00, 13:30 free
      "late",
      "free@870",
    ]);
    const run = lines[1];
    expect(run).toMatchObject({ kind: "free-run", lastMinute: 810, count: 4 });
  });

  it("keeps cancelled bookings in the book without holding their slot", () => {
    const lines = buildDayBook({
      date: "2026-09-24",
      bookings: [b("void", 600, 30, "cancelled")],
      hours: { ...hours, closeMinute: 660 },
      clock: { date: "2026-09-24", minute: 0 },
      ghosts: true,
    });
    expect(lines.map((l) => l.kind)).toEqual(["booking", "free"]);
  });

  it("splits free runs where the clock passes and marks past lines", () => {
    const lines = buildDayBook({
      date: "2026-09-24",
      bookings: [],
      hours,
      clock: { date: "2026-09-24", minute: 700 },
      ghosts: true,
    });
    expect(lines).toEqual([
      { kind: "free-run", minute: 600, lastMinute: 690, count: 4, past: true },
      { kind: "free-run", minute: 720, lastMinute: 870, count: 6, past: false },
    ]);
  });

  it("draws no free slots on a closed day or when ghosts are off", () => {
    const monday = buildDayBook({ date: "2026-09-21", bookings: [b("x", 600, 30)], hours, clock: { date: "2026-09-20", minute: 0 }, ghosts: true });
    expect(monday.map((l) => l.kind)).toEqual(["booking"]);
    const plain = buildDayBook({ date: "2026-09-24", bookings: [], hours, clock: { date: "2026-09-20", minute: 0 }, ghosts: false });
    expect(plain).toEqual([]);
  });
});
