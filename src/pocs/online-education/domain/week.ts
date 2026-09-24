import { addDays, dayKey, mondayOf, seoulParts, shortDayLabel, startOfDay, WEEKDAYS, weekLabel } from "./calendar";

/**
 * The studio's week timetable: payments placed on a 월–일 × hour grid (Seoul
 * time), one block per payment, several blocks sharing a cell side by side.
 */

export interface TimetablePayment {
  id: string;
  kind: "course" | "product";
  amount: number;
  paidAt: Date;
  itemTitle: string;
  /** Course block colour key; null for products (drawn as outlined blocks). */
  color: string | null;
}

export interface TimetableCell {
  dayIndex: number;
  hour: number;
  items: TimetablePayment[];
  /** Payments in this hour beyond the visible lanes. */
  overflow: number;
}

export const DEFAULT_FIRST_HOUR = 7;
export const MAX_LANES = 3;

/** Monday of the week `offset` weeks from the one containing `now` (offset ≤ 0). */
export function weekStart(now: Date, offset: number): string {
  return addDays(mondayOf(dayKey(now)), offset * 7);
}

export function weekTimetable(payments: readonly TimetablePayment[], monday: string, now: Date) {
  const start = startOfDay(monday).getTime();
  const end = startOfDay(addDays(monday, 7)).getTime();
  const today = dayKey(now);

  const inWeek = payments
    .filter((p) => p.paidAt.getTime() >= start && p.paidAt.getTime() < end)
    .sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime());

  let firstHour = DEFAULT_FIRST_HOUR;
  const grouped = new Map<string, TimetablePayment[]>();
  for (const payment of inWeek) {
    const parts = seoulParts(payment.paidAt);
    firstHour = Math.min(firstHour, parts.hour);
    const key = `${parts.weekday - 1}:${parts.hour}`;
    grouped.set(key, [...(grouped.get(key) ?? []), payment]);
  }

  const cells: TimetableCell[] = [...grouped.entries()].map(([key, items]) => {
    const [dayIndex, hour] = key.split(":").map(Number);
    return { dayIndex, hour, items: items.slice(0, MAX_LANES), overflow: Math.max(0, items.length - MAX_LANES) };
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(monday, i);
    const own = cells.filter((cell) => cell.dayIndex === i);
    return {
      key,
      weekday: WEEKDAYS[i],
      date: shortDayLabel(key),
      isToday: key === today,
      isFuture: key > today,
      total: inWeek.filter((p) => seoulParts(p.paidAt).weekday - 1 === i).reduce((sum, p) => sum + p.amount, 0),
      count: own.reduce((sum, cell) => sum + cell.items.length + cell.overflow, 0),
    };
  });

  const nowParts = seoulParts(now);
  const nowInWeek = now.getTime() >= start && now.getTime() < end;
  const nowMarker = nowInWeek
    ? { dayIndex: nowParts.weekday - 1, hour: Math.max(firstHour, nowParts.hour + nowParts.minute / 60) }
    : null;

  return {
    monday,
    label: weekLabel(monday),
    days,
    firstHour,
    /** Exclusive: rows run firstHour … 23. */
    lastHour: 24,
    cells,
    nowMarker,
    total: inWeek.reduce((sum, p) => sum + p.amount, 0),
    count: inWeek.length,
  };
}

export type WeekTimetable = ReturnType<typeof weekTimetable>;
