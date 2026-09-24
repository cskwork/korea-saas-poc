import { addDays, monthOf, startOfWeek, daysBetween, type DateKey } from "./dates";

/**
 * Time tracking: durations, the running timer, the work calendar (day cells) and hour cells
 * (estimated vs tracked hours drawn as squares).
 */

/** 200 → "3시간 20분", 45 → "45분" */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

/** 200 → "3.3" (hours, one decimal, trailing .0 dropped) */
export function hoursLabel(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

/** Seconds → "01:24:07" */
export function clockLabel(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** Minutes a stopped timer logs: rounded to the nearest minute, at least one. */
export function timerMinutes(startedAt: Date, stoppedAt: Date): number {
  return Math.max(1, Math.round((stoppedAt.getTime() - startedAt.getTime()) / 60_000));
}

/** A timer left running this long was almost certainly forgotten; the UI asks before logging it. */
export const LONG_TIMER_MINUTES = 12 * 60;

// ---------------------------------------------------------------------------------------------
// Work calendar

export type CellLevel = 0 | 1 | 2 | 3 | 4;

/** Day-cell intensity from minutes worked: none, under 2h, under 4h, under 6h, 6h and more. */
export function levelFor(minutes: number): CellLevel {
  if (minutes <= 0) return 0;
  if (minutes < 120) return 1;
  if (minutes < 240) return 2;
  if (minutes < 360) return 3;
  return 4;
}

export const LEVEL_LEGEND: readonly { level: CellLevel; label: string }[] = [
  { level: 0, label: "기록 없음" },
  { level: 1, label: "2시간 미만" },
  { level: 2, label: "2–4시간" },
  { level: 3, label: "4–6시간" },
  { level: 4, label: "6시간 이상" },
];

export interface CalendarDay {
  key: DateKey;
  minutes: number;
  level: CellLevel;
  /** Deposits received that day (won). */
  deposit: number;
  future: boolean;
  today: boolean;
}

export interface CalendarWeek {
  start: DateKey;
  days: CalendarDay[];
  /** Month label shown above this week when a month starts inside it. */
  monthStart: string | null;
}

export interface WorkCalendar {
  weeks: CalendarWeek[];
  totalMinutes: number;
  activeDays: number;
  depositTotal: number;
  depositDays: number;
}

/**
 * Monday-first grid of `weekCount` weeks ending with the week that contains `today`.
 * Days after today are marked `future` and carry no data.
 */
export function buildWorkCalendar(
  today: DateKey,
  weekCount: number,
  minutesByDay: ReadonlyMap<DateKey, number>,
  depositsByDay: ReadonlyMap<DateKey, number> = new Map(),
): WorkCalendar {
  const firstMonday = addDays(startOfWeek(today), -7 * (weekCount - 1));
  let totalMinutes = 0;
  let activeDays = 0;
  let depositTotal = 0;
  let depositDays = 0;

  const weeks: CalendarWeek[] = Array.from({ length: weekCount }, (_, w) => {
    const start = addDays(firstMonday, w * 7);
    const days = Array.from({ length: 7 }, (_, d): CalendarDay => {
      const key = addDays(start, d);
      const future = daysBetween(today, key) > 0;
      const minutes = future ? 0 : (minutesByDay.get(key) ?? 0);
      const deposit = future ? 0 : (depositsByDay.get(key) ?? 0);
      totalMinutes += minutes;
      if (minutes > 0) activeDays += 1;
      if (deposit > 0) {
        depositTotal += deposit;
        depositDays += 1;
      }
      return { key, minutes, level: levelFor(minutes), deposit, future, today: key === today };
    });
    const firstOfMonth = days.find((day) => day.key.endsWith("-01"));
    return { start, days, monthStart: firstOfMonth ? monthOf(firstOfMonth.key) : null };
  });

  // Label the first column with its month too, unless a new month starts within the next two weeks
  // (the two labels would collide).
  const first = weeks[0];
  if (first && first.monthStart === null && !weeks.slice(1, 3).some((week) => week.monthStart !== null)) {
    first.monthStart = monthOf(first.start);
  }

  return { weeks, totalMinutes, activeDays, depositTotal, depositDays };
}

// ---------------------------------------------------------------------------------------------
// Hour cells: one square per unit of hours, estimated vs tracked.

export interface HourCells {
  /** Hours each cell stands for. */
  unit: number;
  /** Cells the estimate reserves. */
  planned: number;
  /** Fully tracked cells inside the estimate. */
  filled: number;
  /** 1 when a started-but-unfinished cell follows the filled ones. */
  partial: 0 | 1;
  /** Tracked cells beyond the estimate. */
  over: number;
  /** Tracked cells when there is no estimate at all. */
  unplanned: number;
}

const CELL_UNITS = [1, 2, 4, 5, 10, 20, 25, 50, 100] as const;

export function hourCells(estimatedHours: number | null, trackedHours: number, maxCells = 48): HourCells {
  const planned = Math.max(0, estimatedHours ?? 0);
  const tracked = Math.max(0, trackedHours);
  const largest = Math.max(planned, tracked);
  const unit = CELL_UNITS.find((u) => Math.ceil(largest / u) <= maxCells) ?? CELL_UNITS[CELL_UNITS.length - 1];

  const exact = tracked / unit;
  let whole = Math.floor(exact);
  const remainder = exact - whole;
  if (remainder >= 0.75) whole += 1;
  const partial: 0 | 1 = remainder >= 0.25 && remainder < 0.75 ? 1 : 0;

  const plannedCells = Math.ceil(planned / unit);
  if (plannedCells === 0) {
    return { unit, planned: 0, filled: 0, partial: 0, over: 0, unplanned: whole + partial };
  }
  const filled = Math.min(whole, plannedCells);
  const over = Math.max(0, whole + partial - plannedCells);
  return {
    unit,
    planned: plannedCells,
    filled,
    partial: whole < plannedCells ? partial : 0,
    over,
    unplanned: 0,
  };
}

/** Sum of minutes per key. */
export function sumBy<T>(rows: readonly T[], key: (row: T) => string, minutes: (row: T) => number): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(key(row), (totals.get(key(row)) ?? 0) + minutes(row));
  return totals;
}
