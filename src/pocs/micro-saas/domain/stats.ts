import type { BookingStatus } from "../db/schema";
import { WEEKDAY_LABELS, addDays, hasBegun, weekdayOf, type Clock } from "./time";

/** Counts and summaries computed from real booking rows. */

interface StatusRow {
  status: BookingStatus;
}

export interface Tally {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

export function tally(rows: readonly StatusRow[]): Tally {
  const count = (status: BookingStatus) => rows.filter((r) => r.status === status).length;
  return { total: rows.length, confirmed: count("confirmed"), pending: count("pending"), cancelled: count("cancelled") };
}

interface TimedRow extends StatusRow {
  date: string;
  startMinute: number;
}

/** The next customer still to come today (cancelled bookings never come). */
export function nextToCome<T extends TimedRow>(rows: readonly T[], clock: Clock): T | undefined {
  return rows
    .filter((r) => r.date === clock.date && r.status !== "cancelled" && r.startMinute >= clock.minute)
    .sort((a, b) => a.startMinute - b.startMinute)[0];
}

export interface WeekDay {
  date: string;
  label: (typeof WEEKDAY_LABELS)[number];
  confirmed: number;
  pending: number;
  isToday: boolean;
}

export interface WeekSeries {
  days: WeekDay[];
  /** Largest day total, at least 1 (the chart's scale). */
  max: number;
  /** Sum of confirmed bookings' prices this week. */
  confirmedRevenue: number;
  total: number;
}

/** Seven days from `weekStart`, split into confirmed and pending (cancelled excluded). */
export function weekSeries(rows: readonly (TimedRow & { price: number })[], weekStart: string, today: string): WeekSeries {
  const days = Array.from({ length: 7 }, (_, i): WeekDay => {
    const date = addDays(weekStart, i);
    const onDay = rows.filter((r) => r.date === date);
    return {
      date,
      label: WEEKDAY_LABELS[weekdayOf(date)],
      confirmed: onDay.filter((r) => r.status === "confirmed").length,
      pending: onDay.filter((r) => r.status === "pending").length,
      isToday: date === today,
    };
  });
  const totals = days.map((d) => d.confirmed + d.pending);
  const inWeek = rows.filter((r) => r.date >= weekStart && r.date <= addDays(weekStart, 6));
  return {
    days,
    max: Math.max(1, ...totals),
    total: totals.reduce((sum, n) => sum + n, 0),
    confirmedRevenue: inWeek.filter((r) => r.status === "confirmed").reduce((sum, r) => sum + r.price, 0),
  };
}

export interface HistorySummary {
  /** Confirmed bookings whose time has come. */
  visits: number;
  spent: number;
  lastVisit: string | null;
  cancellations: number;
  next: { date: string; startMinute: number } | null;
}

/** A customer's record, from their bookings. */
export function summarizeHistory(rows: readonly (TimedRow & { price: number })[], clock: Clock): HistorySummary {
  const done = rows.filter((r) => r.status === "confirmed" && hasBegun(r.date, r.startMinute, clock));
  const upcoming = rows
    .filter((r) => r.status !== "cancelled" && !hasBegun(r.date, r.startMinute, clock))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute);
  return {
    visits: done.length,
    spent: done.reduce((sum, r) => sum + r.price, 0),
    lastVisit: done.map((r) => r.date).sort().at(-1) ?? null,
    cancellations: rows.filter((r) => r.status === "cancelled").length,
    next: upcoming[0] ? { date: upcoming[0].date, startMinute: upcoming[0].startMinute } : null,
  };
}
