import type { BookingStatus } from "../db/schema";
import { SLOT_MINUTES, hasBegun, slotSpan, slotStarts, weekdayOf, type Clock } from "./time";

/**
 * Slot availability. A booking occupies its service's duration rounded up to whole
 * 30-minute slots; the shop can hold `seats` bookings in the same slot. Cancelled
 * bookings free their slots. The same rules serve the public booking page (strict)
 * and the owner's new-booking slip (warns, may override).
 */

export interface ShopHours {
  openMinute: number;
  closeMinute: number;
  seats: number;
  closedWeekdays: readonly number[];
}

export interface Occupant {
  id: string;
  startMinute: number;
  durationMinutes: number;
  status: BookingStatus;
}

export type SlotState = "open" | "full" | "past" | "overrun";

export interface SlotView {
  minute: number;
  state: SlotState;
  /** Bookings already in the busiest slot this booking would cover. */
  taken: number;
}

export interface DayAvailability {
  closedDay: boolean;
  slots: SlotView[];
  openCount: number;
}

const coveredSlots = (startMinute: number, durationMinutes: number) =>
  Array.from({ length: slotSpan(durationMinutes) }, (_, i) => startMinute + i * SLOT_MINUTES);

const isActive = (o: Occupant) => o.status !== "cancelled";

export function isClosedDay(hours: ShopHours, date: string): boolean {
  return hours.closedWeekdays.includes(weekdayOf(date));
}

/** Active bookings per slot start minute. */
export function occupancy(bookings: readonly Occupant[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const booking of bookings) {
    if (!isActive(booking)) continue;
    for (const slot of coveredSlots(booking.startMinute, booking.durationMinutes)) {
      counts.set(slot, (counts.get(slot) ?? 0) + 1);
    }
  }
  return counts;
}

/** Active bookings that share at least one slot with a booking at `startMinute` lasting `durationMinutes`. */
export function overlapping(bookings: readonly Occupant[], startMinute: number, durationMinutes: number): Occupant[] {
  const wanted = new Set(coveredSlots(startMinute, durationMinutes));
  return bookings.filter(
    (b) => isActive(b) && coveredSlots(b.startMinute, b.durationMinutes).some((slot) => wanted.has(slot)),
  );
}

function busiest(counts: Map<number, number>, startMinute: number, durationMinutes: number): number {
  return Math.max(0, ...coveredSlots(startMinute, durationMinutes).map((slot) => counts.get(slot) ?? 0));
}

export function dayAvailability(input: {
  date: string;
  hours: ShopHours;
  bookings: readonly Occupant[];
  durationMinutes: number;
  clock: Clock;
}): DayAvailability {
  const { date, hours, bookings, durationMinutes, clock } = input;
  const counts = occupancy(bookings);
  const slots = slotStarts(hours.openMinute, hours.closeMinute).map((minute): SlotView => {
    const taken = busiest(counts, minute, durationMinutes);
    let state: SlotState = "open";
    if (hasBegun(date, minute, clock)) state = "past";
    else if (minute + durationMinutes > hours.closeMinute) state = "overrun";
    else if (taken >= hours.seats) state = "full";
    return { minute, state, taken };
  });
  const closedDay = isClosedDay(hours, date);
  return { closedDay, slots, openCount: closedDay ? 0 : slots.filter((s) => s.state === "open").length };
}

export type SlotProblem = "closed-day" | "outside-hours" | "past" | "full";

export type SlotCheck = { ok: true } | { ok: false; problem: SlotProblem; conflicts: Occupant[] };

/** Can a booking of `durationMinutes` start at `startMinute` on `date`? */
export function checkSlot(input: {
  date: string;
  startMinute: number;
  durationMinutes: number;
  hours: ShopHours;
  bookings: readonly Occupant[];
  clock: Clock;
  /** Ignore this booking (when moving an existing one). */
  excludeId?: string;
}): SlotCheck {
  const { date, startMinute, durationMinutes, hours, clock } = input;
  const others = input.bookings.filter((b) => b.id !== input.excludeId);
  const conflicts = overlapping(others, startMinute, durationMinutes);
  if (hasBegun(date, startMinute, clock)) return { ok: false, problem: "past", conflicts };
  if (isClosedDay(hours, date)) return { ok: false, problem: "closed-day", conflicts };
  if (startMinute < hours.openMinute || startMinute + durationMinutes > hours.closeMinute) {
    return { ok: false, problem: "outside-hours", conflicts };
  }
  if (busiest(occupancy(others), startMinute, durationMinutes) >= hours.seats) {
    return { ok: false, problem: "full", conflicts };
  }
  return { ok: true };
}

export const SLOT_PROBLEM_MESSAGES: Record<SlotProblem, string> = {
  "closed-day": "휴무일이에요.",
  "outside-hours": "영업시간 안에 끝나지 않는 시간이에요.",
  past: "이미 지난 시간이에요.",
  full: "그 시간은 예약이 다 찼어요.",
};
