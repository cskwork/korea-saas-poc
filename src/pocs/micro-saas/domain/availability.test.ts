import { describe, expect, it } from "vitest";
import { checkSlot, dayAvailability, occupancy, overlapping, type Occupant, type ShopHours } from "./availability";

const hours: ShopHours = { openMinute: 600, closeMinute: 1200, seats: 1, closedWeekdays: [1] };
const clock = { date: "2026-09-24", minute: 0 };
const booking = (id: string, startMinute: number, durationMinutes: number, status: Occupant["status"] = "confirmed") => ({
  id,
  startMinute,
  durationMinutes,
  status,
});

describe("availability", () => {
  it("counts every slot a booking covers, and ignores cancelled bookings", () => {
    const counts = occupancy([booking("a", 600, 120), booking("b", 660, 30), booking("c", 600, 30, "cancelled")]);
    expect([...counts.entries()]).toEqual([
      [600, 1],
      [630, 1],
      [660, 2],
      [690, 1],
    ]);
  });

  it("finds overlaps by slot, not only by start time", () => {
    const existing = [booking("perm", 840, 120)]; // 14:00–16:00
    expect(overlapping(existing, 900, 30).map((b) => b.id)).toEqual(["perm"]); // 15:00
    expect(overlapping(existing, 960, 30)).toEqual([]); // 16:00
    expect(overlapping(existing, 780, 90).map((b) => b.id)).toEqual(["perm"]); // 13:00–14:30
  });

  it("marks slots full, past or overrunning closing time", () => {
    const view = dayAvailability({
      date: "2026-09-24",
      hours,
      bookings: [booking("a", 660, 60)],
      durationMinutes: 60,
      clock: { date: "2026-09-24", minute: 610 },
    });
    const state = (minute: number) => view.slots.find((s) => s.minute === minute)?.state;
    expect(state(600)).toBe("past");
    expect(state(630)).toBe("full"); // 10:30–11:30 would share 11:00
    expect(state(660)).toBe("full");
    expect(state(720)).toBe("open");
    expect(state(1170)).toBe("overrun"); // 19:30 + 60 > 20:00
    expect(view.closedDay).toBe(false);
  });

  it("has no open slots on a closed weekday", () => {
    const monday = dayAvailability({ date: "2026-09-21", hours, bookings: [], durationMinutes: 30, clock });
    expect(monday.closedDay).toBe(true);
    expect(monday.openCount).toBe(0);
  });

  it("allows as many overlapping bookings as the shop has seats", () => {
    const twoSeats = { ...hours, seats: 2 };
    const existing = [booking("a", 720, 30)];
    expect(checkSlot({ date: "2026-09-24", startMinute: 720, durationMinutes: 30, hours: twoSeats, bookings: existing, clock })).toEqual({
      ok: true,
    });
    const full = checkSlot({
      date: "2026-09-24",
      startMinute: 720,
      durationMinutes: 30,
      hours: twoSeats,
      bookings: [...existing, booking("b", 690, 60)],
      clock,
    });
    expect(full).toMatchObject({ ok: false, problem: "full" });
    if (!full.ok) expect(full.conflicts.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("reports the first problem in order: past, closed day, hours, capacity", () => {
    const base = { durationMinutes: 30, hours, bookings: [booking("a", 720, 30)], clock: { date: "2026-09-24", minute: 700 } };
    expect(checkSlot({ ...base, date: "2026-09-24", startMinute: 690 })).toMatchObject({ problem: "past" });
    expect(checkSlot({ ...base, date: "2026-09-28", startMinute: 720 })).toMatchObject({ problem: "closed-day" });
    expect(checkSlot({ ...base, date: "2026-09-25", startMinute: 1200 - 15 })).toMatchObject({ problem: "outside-hours" });
    expect(checkSlot({ ...base, date: "2026-09-24", startMinute: 720 })).toMatchObject({ problem: "full" });
    expect(checkSlot({ ...base, date: "2026-09-24", startMinute: 720, excludeId: "a" })).toEqual({ ok: true });
  });
});
