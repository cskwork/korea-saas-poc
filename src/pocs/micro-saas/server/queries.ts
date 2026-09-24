import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getModuleContext } from "@/core/modules/context";
import { dayAvailability, isClosedDay, type DayAvailability } from "../domain/availability";
import { buildDayBook } from "../domain/daybook";
import {
  NOTICE_TYPES,
  composeNotice,
  defaultCandidate,
  isNoticeType,
  upcomingCandidates,
  type NoticeType,
} from "../domain/notifications";
import { nextToCome, summarizeHistory, tally, weekSeries } from "../domain/stats";
import {
  addDays,
  daysInMonth,
  isDateKey,
  isMonthKey,
  monthGrid,
  monthKeyOf,
  seoulClock,
  startOfWeek,
} from "../domain/time";
import { idSchema } from "../domain/validation";
import { microSaasModule } from "../module";
import {
  bookingsBetween,
  bookingsOn,
  countActiveBetween,
  countPendingFrom,
  dayCounts,
  findBooking,
  hoursOf,
  occupantsOn,
  pendingFrom,
  type BookingRow,
} from "./store/bookings";
import { countCustomers, customerHistory, findCustomer, listCustomers, type CustomerSort } from "./store/customers";
import { findService, findShop, listServices } from "./store/shop";

/**
 * Reads for the /micro-saas pages. Every function resolves the visitor's workspace and the
 * shop's clock (Asia/Seoul) once per request, then delegates to the store functions.
 */

const context = cache(() => getModuleContext(microSaasModule));
const clock = cache(() => seoulClock());

/** Shell data: the owner block, the new-booking slip's services and hours. */
export const getShell = cache(async () => {
  const { db, workspaceId } = await context();
  const [shop, services] = await Promise.all([findShop(db, workspaceId), listServices(db, workspaceId)]);
  return { shop, services, today: clock().date };
});

export async function getDashboard() {
  const { db, workspaceId } = await context();
  const now = clock();
  const weekStart = startOfWeek(now.date);
  const [shop, today, pending, pendingTotal, week] = await Promise.all([
    findShop(db, workspaceId),
    bookingsOn(db, workspaceId, now.date),
    pendingFrom(db, workspaceId, now, 6),
    countPendingFrom(db, workspaceId, now),
    bookingsBetween(db, workspaceId, weekStart, addDays(weekStart, 6)),
  ]);
  const hours = hoursOf(shop);
  return {
    clock: now,
    shop,
    closedToday: isClosedDay(hours, now.date),
    tally: tally(today),
    next: nextToCome(today, now),
    lines: buildDayBook({ date: now.date, bookings: today, hours, clock: now, ghosts: true }),
    pending,
    pendingTotal,
    week: weekSeries(week, weekStart, now.date),
  };
}

export async function getCalendar(params: { month?: string; date?: string }) {
  const { db, workspaceId } = await context();
  const now = clock();
  const selected = params.date && isDateKey(params.date) ? params.date : undefined;
  const month =
    params.month && isMonthKey(params.month) ? params.month : monthKeyOf(selected ?? now.date);
  const cells = monthGrid(month);
  const day = selected ?? (monthKeyOf(now.date) === month ? now.date : `${month}-01`);
  const [shop, counts, dayRows] = await Promise.all([
    findShop(db, workspaceId),
    dayCounts(db, workspaceId, cells[0].date, cells[cells.length - 1].date),
    bookingsOn(db, workspaceId, day),
  ]);
  const hours = hoursOf(shop);
  const byDate = new Map(counts.map((c) => [c.date, c]));
  return {
    clock: now,
    month,
    day,
    daysInMonth: daysInMonth(month),
    cells: cells.map((cell) => ({
      ...cell,
      active: byDate.get(cell.date)?.active ?? 0,
      pending: byDate.get(cell.date)?.pending ?? 0,
      closed: isClosedDay(hours, cell.date),
    })),
    dayClosed: isClosedDay(hours, day),
    dayTally: tally(dayRows),
    lines: buildDayBook({ date: day, bookings: dayRows, hours, clock: now, ghosts: true }),
  };
}

export async function getCustomers(params: { query?: string; sort?: CustomerSort }) {
  const { db, workspaceId } = await context();
  const [rows, total] = await Promise.all([
    listCustomers(db, workspaceId, { query: params.query, sort: params.sort, clock: clock() }),
    countCustomers(db, workspaceId),
  ]);
  return { rows, total, clock: clock() };
}

/** 404s for malformed, missing and other workspaces' ids alike. */
export async function getCustomerDetail(id: string) {
  if (!idSchema.safeParse(id).success) notFound();
  const { db, workspaceId } = await context();
  const customer = await findCustomer(db, workspaceId, id);
  if (!customer) notFound();
  const history = await customerHistory(db, workspaceId, id);
  return { customer, history, summary: summarizeHistory(history, clock()), clock: clock() };
}

export async function getBookingDetail(id: string) {
  if (!idSchema.safeParse(id).success) notFound();
  const { db, workspaceId } = await context();
  const booking = await findBooking(db, workspaceId, id);
  if (!booking) notFound();
  const [shop, services] = await Promise.all([findShop(db, workspaceId), listServices(db, workspaceId)]);
  return { booking, shop, services };
}

export async function getNotificationPreview(params: { type?: string; booking?: string }) {
  const { db, workspaceId } = await context();
  const now = clock();
  const type: NoticeType = isNoticeType(params.type) ? params.type : NOTICE_TYPES[0];
  const [shop, soon] = await Promise.all([
    findShop(db, workspaceId),
    bookingsBetween(db, workspaceId, now.date, addDays(now.date, 30)),
  ]);
  const candidates = upcomingCandidates(soon, now).slice(0, 40);
  const requested =
    params.booking && idSchema.safeParse(params.booking).success
      ? (candidates.find((c) => c.id === params.booking) ?? (await findBooking(db, workspaceId, params.booking)))
      : undefined;
  if (requested && !candidates.some((c) => c.id === requested.id)) candidates.unshift(requested);
  const booking: BookingRow | undefined = requested ?? defaultCandidate(type, candidates);
  const message = booking
    ? composeNotice(
        type,
        {
          customerName: booking.customerName,
          date: booking.date,
          startMinute: booking.startMinute,
          serviceName: booking.serviceName,
          shopName: shop.name,
          address: shop.address,
          cancelPolicy: shop.cancelPolicy,
        },
        now.date,
      )
    : null;
  return { type, shop, candidates, booking, message, clock: now };
}

export async function getPricing() {
  const { db, workspaceId } = await context();
  const now = clock();
  const month = monthKeyOf(now.date);
  const [shop, monthlyBookings, customers] = await Promise.all([
    findShop(db, workspaceId),
    countActiveBetween(db, workspaceId, `${month}-01`, `${month}-${String(daysInMonth(month)).padStart(2, "0")}`),
    countCustomers(db, workspaceId),
  ]);
  return { shop, usage: { monthlyBookings, customers } };
}

export async function getSettings() {
  const { db, workspaceId } = await context();
  const [shop, services] = await Promise.all([findShop(db, workspaceId), listServices(db, workspaceId)]);
  return { shop, services };
}

/** How far ahead the public page takes bookings. */
export const BOOKING_WINDOW_DAYS = 60;
const DATE_STRIP_DAYS = 14;

export interface DateChip {
  date: string;
  closed: boolean;
  open: number;
}

export async function getBookingPage(params: { service?: string; date?: string; time?: string }) {
  const { db, workspaceId } = await context();
  const now = clock();
  const [shop, services] = await Promise.all([
    findShop(db, workspaceId),
    listServices(db, workspaceId, { activeOnly: true }),
  ]);
  const hours = hoursOf(shop);
  const service = services.find((s) => s.id === params.service);
  const lastDay = addDays(now.date, BOOKING_WINDOW_DAYS);
  const inWindow = (d?: string): d is string => Boolean(d && isDateKey(d) && d >= now.date && d <= lastDay);

  let strip: DateChip[] = [];
  let date: string | undefined;
  let availability: DayAvailability | undefined;
  if (service) {
    const stripEnd = addDays(now.date, DATE_STRIP_DAYS - 1);
    const rows = await bookingsBetween(db, workspaceId, now.date, stripEnd);
    strip = Array.from({ length: DATE_STRIP_DAYS }, (_, i) => {
      const day = addDays(now.date, i);
      const view = dayAvailability({
        date: day,
        hours,
        bookings: rows.filter((r) => r.date === day),
        durationMinutes: service.durationMinutes,
        clock: now,
      });
      return { date: day, closed: view.closedDay, open: view.openCount };
    });
    date = inWindow(params.date) ? params.date : strip.find((d) => d.open > 0)?.date;
    if (date) {
      availability = dayAvailability({
        date,
        hours,
        bookings: await occupantsOn(db, workspaceId, date),
        durationMinutes: service.durationMinutes,
        clock: now,
      });
    }
  }
  const slot = availability?.slots.find((s) => s.state === "open" && String(s.minute) === params.time);
  return { shop, services, service, strip, date, availability, slot, clock: now, lastDay };
}

/** The customer's receipt after booking online (same visitor, same workspace). */
export async function getReceipt(id: string) {
  if (!idSchema.safeParse(id).success) notFound();
  const { db, workspaceId } = await context();
  const booking = await findBooking(db, workspaceId, id);
  if (!booking || booking.source !== "online") notFound();
  return booking;
}

/** Slot view for the owner's new-booking slip (JSON route). */
export async function getSlots(params: { date: string; serviceId: string; excludeId?: string }) {
  const { db, workspaceId } = await context();
  const [shop, service] = await Promise.all([
    findShop(db, workspaceId),
    findService(db, workspaceId, params.serviceId),
  ]);
  if (!service) return null;
  const occupants = (await occupantsOn(db, workspaceId, params.date)).filter((o) => o.id !== params.excludeId);
  const view = dayAvailability({
    date: params.date,
    hours: hoursOf(shop),
    bookings: occupants,
    durationMinutes: service.durationMinutes,
    // The owner can write down earlier bookings too, so nothing is "past" on the slip.
    clock: { date: params.date, minute: -1 },
  });
  return { ...view, seats: shop.seats };
}

export type SlotResponse = NonNullable<Awaited<ReturnType<typeof getSlots>>>;
