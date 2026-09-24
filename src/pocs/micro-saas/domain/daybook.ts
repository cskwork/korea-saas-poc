import { occupancy, type Occupant, type ShopHours, isClosedDay } from "./availability";
import { hasBegun, isPast, slotStarts, type Clock } from "./time";

/**
 * The day-book: one ruled line per booking in time order, with the shop's free
 * 30-minute slots drawn as ghost lines. Three or more free slots in a row collapse
 * into one line ("~ 13:30 · 빈 시간 4칸") so the book stays short.
 */

export type DayBookLine<T extends Occupant> =
  | { kind: "booking"; booking: T; past: boolean }
  | { kind: "free"; minute: number; past: boolean }
  | { kind: "free-run"; minute: number; lastMinute: number; count: number; past: boolean };

export const FREE_RUN_MIN = 3;

export function buildDayBook<T extends Occupant>(input: {
  date: string;
  bookings: readonly T[];
  hours: ShopHours;
  clock: Clock;
  /** Draw free slots (off on closed days). */
  ghosts: boolean;
}): DayBookLine<T>[] {
  const { date, hours, clock } = input;
  const sorted = [...input.bookings].sort((a, b) => a.startMinute - b.startMinute);
  const showGhosts = input.ghosts && !isClosedDay(hours, date);
  const busy = occupancy(sorted);
  const byStart = new Map<number, T[]>();
  for (const booking of sorted) byStart.set(booking.startMinute, [...(byStart.get(booking.startMinute) ?? []), booking]);

  const times = [...new Set([...slotStarts(hours.openMinute, hours.closeMinute), ...byStart.keys()])].sort((a, b) => a - b);
  const lines: DayBookLine<T>[] = [];
  let run: number[] = [];
  let runPast = false;

  const flush = () => {
    if (run.length === 0) return;
    if (run.length < FREE_RUN_MIN) {
      for (const minute of run) lines.push({ kind: "free", minute, past: runPast });
    } else {
      lines.push({ kind: "free-run", minute: run[0], lastMinute: run[run.length - 1], count: run.length, past: runPast });
    }
    run = [];
  };

  for (const minute of times) {
    const starting = byStart.get(minute);
    if (starting) {
      flush();
      for (const booking of starting) {
        lines.push({ kind: "booking", booking, past: isPast(date, booking.startMinute, clock) });
      }
      continue;
    }
    const free = showGhosts && (busy.get(minute) ?? 0) === 0;
    if (!free) {
      flush();
      continue;
    }
    const past = hasBegun(date, minute, clock);
    if (run.length > 0 && past !== runPast) flush();
    runPast = past;
    run.push(minute);
  }
  flush();
  return lines;
}
