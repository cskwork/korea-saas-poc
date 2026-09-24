import { and, asc, count, eq, gte, lte, ne, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { SLOT_PROBLEM_MESSAGES, checkSlot, type Occupant, type ShopHours } from "../../domain/availability";
import { formatMinute, type Clock } from "../../domain/time";
import type {
  BookingUpdateInput,
  OnlineBookingInput,
  OwnerBookingInput,
} from "../../domain/validation";
import { bookings, customers, type BookingSource, type BookingStatus, type Shop } from "../../db/schema";
import { upsertCustomer } from "./customers";
import { findService, lockShop, type Db } from "./shop";

/** A booking with its customer, as every book and list shows it. */
export interface BookingRow {
  id: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  status: BookingStatus;
  source: BookingSource;
  serviceId: string | null;
  serviceName: string;
  price: number;
  memo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
}

const rowColumns = {
  id: bookings.id,
  date: bookings.date,
  startMinute: bookings.startMinute,
  durationMinutes: bookings.durationMinutes,
  status: bookings.status,
  source: bookings.source,
  serviceId: bookings.serviceId,
  serviceName: bookings.serviceName,
  price: bookings.price,
  memo: bookings.memo,
  customerId: bookings.customerId,
  customerName: customers.name,
  customerPhone: customers.phone,
};

function selectRows(db: Db) {
  return db.select(rowColumns).from(bookings).innerJoin(customers, eq(customers.id, bookings.customerId));
}

export function hoursOf(shop: Shop): ShopHours {
  return {
    openMinute: shop.openMinute,
    closeMinute: shop.closeMinute,
    seats: shop.seats,
    closedWeekdays: shop.closedWeekdays,
  };
}

export async function bookingsOn(db: Db, workspaceId: string, date: string): Promise<BookingRow[]> {
  return selectRows(db)
    .where(and(eq(bookings.workspaceId, workspaceId), eq(bookings.date, date)))
    .orderBy(asc(bookings.startMinute), asc(bookings.createdAt));
}

export async function bookingsBetween(db: Db, workspaceId: string, from: string, to: string): Promise<BookingRow[]> {
  return selectRows(db)
    .where(and(eq(bookings.workspaceId, workspaceId), gte(bookings.date, from), lte(bookings.date, to)))
    .orderBy(asc(bookings.date), asc(bookings.startMinute), asc(bookings.createdAt));
}

/** Pending bookings from now on: the decisions still waiting for a stamp. */
export async function pendingFrom(db: Db, workspaceId: string, clock: Clock, limit = 8): Promise<BookingRow[]> {
  return selectRows(db)
    .where(
      and(
        eq(bookings.workspaceId, workspaceId),
        eq(bookings.status, "pending"),
        sql`(${bookings.date} > ${clock.date} or (${bookings.date} = ${clock.date} and ${bookings.startMinute} >= ${clock.minute}))`,
      ),
    )
    .orderBy(asc(bookings.date), asc(bookings.startMinute))
    .limit(limit);
}

export async function countPendingFrom(db: Db, workspaceId: string, clock: Clock): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.workspaceId, workspaceId),
        eq(bookings.status, "pending"),
        sql`(${bookings.date} > ${clock.date} or (${bookings.date} = ${clock.date} and ${bookings.startMinute} >= ${clock.minute}))`,
      ),
    );
  return row?.n ?? 0;
}

export interface DayCount {
  date: string;
  active: number;
  pending: number;
}

/** Non-cancelled and pending counts per day in a date range (the month grid). */
export async function dayCounts(db: Db, workspaceId: string, from: string, to: string): Promise<DayCount[]> {
  return db
    .select({
      date: bookings.date,
      active: sql<number>`count(*) filter (where ${bookings.status} <> 'cancelled')`.mapWith(Number),
      pending: sql<number>`count(*) filter (where ${bookings.status} = 'pending')`.mapWith(Number),
    })
    .from(bookings)
    .where(and(eq(bookings.workspaceId, workspaceId), gte(bookings.date, from), lte(bookings.date, to)))
    .groupBy(bookings.date);
}

/** Non-cancelled bookings dated in a range (plan usage). */
export async function countActiveBetween(db: Db, workspaceId: string, from: string, to: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(bookings)
    .where(
      and(
        eq(bookings.workspaceId, workspaceId),
        ne(bookings.status, "cancelled"),
        gte(bookings.date, from),
        lte(bookings.date, to),
      ),
    );
  return row?.n ?? 0;
}

export async function findBooking(db: Db, workspaceId: string, id: string): Promise<BookingRow | undefined> {
  const [row] = await selectRows(db)
    .where(and(eq(bookings.id, id), eq(bookings.workspaceId, workspaceId)))
    .limit(1);
  return row;
}

/** A day's bookings as slot occupants (availability for the slip and the booking page). */
export async function occupantsOn(db: Db, workspaceId: string, date: string): Promise<Occupant[]> {
  return db
    .select({
      id: bookings.id,
      startMinute: bookings.startMinute,
      durationMinutes: bookings.durationMinutes,
      status: bookings.status,
    })
    .from(bookings)
    .where(and(eq(bookings.workspaceId, workspaceId), eq(bookings.date, date)));
}

async function serviceSnapshot(db: Db, workspaceId: string, serviceId: string) {
  const service = await findService(db, workspaceId, serviceId);
  if (!service) throw new UserError("서비스를 찾을 수 없어요. 서비스를 다시 골라 주세요.");
  return service;
}

/** The owner may write down a booking that already happened (a walk-in), so their checks skip "past". */
const OWNER_CLOCK = (date: string): Clock => ({ date, minute: -1 });

/** Owner-side slot rule: problems are reported, and the owner may knowingly book over them. */
function ownerSlotError(
  check: ReturnType<typeof checkSlot>,
  allowOverlap: boolean,
): string | null {
  if (check.ok || allowOverlap) return null;
  const names = check.conflicts.length > 0 ? ` 겹치는 예약 ${check.conflicts.length}건이 있어요.` : "";
  return `${SLOT_PROBLEM_MESSAGES[check.problem]}${names} 그래도 저장하려면 '겹쳐도 저장'을 선택해 주세요.`;
}

/** Books a slot from the owner console (the customer is found or registered by phone). */
export async function createOwnerBooking(
  db: Db,
  workspaceId: string,
  input: OwnerBookingInput,
): Promise<{ id: string; customerName: string }> {
  return db.transaction(async (tx) => {
    const shop = await lockShop(tx, workspaceId);
    const service = await serviceSnapshot(tx, workspaceId, input.serviceId);
    const check = checkSlot({
      date: input.date,
      startMinute: input.time,
      durationMinutes: service.durationMinutes,
      hours: hoursOf(shop),
      bookings: await occupantsOn(tx, workspaceId, input.date),
      clock: OWNER_CLOCK(input.date),
    });
    const problem = ownerSlotError(check, input.allowOverlap);
    if (problem) throw new UserError(problem);

    const customerId = await upsertCustomer(
      tx,
      workspaceId,
      { name: input.customerName, phone: input.customerPhone },
      { rename: true },
    );
    const [row] = await tx
      .insert(bookings)
      .values({
        workspaceId,
        customerId,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        date: input.date,
        startMinute: input.time,
        status: input.status,
        source: "owner",
        memo: input.memo,
      })
      .returning({ id: bookings.id });
    return { id: row.id, customerName: input.customerName };
  });
}

/**
 * Books a slot from the public booking page. Strict: refuses past, closed, out-of-hours and
 * full slots. The shop row is locked first, so two customers racing for the last seat in a
 * slot are served one after the other and the second is refused.
 */
export async function createOnlineBooking(
  db: Db,
  workspaceId: string,
  input: OnlineBookingInput,
  clock: Clock,
): Promise<{ id: string }> {
  return db.transaction(async (tx) => {
    const shop = await lockShop(tx, workspaceId);
    const service = await serviceSnapshot(tx, workspaceId, input.serviceId);
    if (!service.active) throw new UserError("지금은 예약을 받지 않는 서비스예요. 다른 서비스를 골라 주세요.");
    const check = checkSlot({
      date: input.date,
      startMinute: input.time,
      durationMinutes: service.durationMinutes,
      hours: hoursOf(shop),
      bookings: await occupantsOn(tx, workspaceId, input.date),
      clock,
    });
    if (!check.ok) {
      throw new SlotUnavailableError(
        check.problem === "full"
          ? `방금 ${formatMinute(input.time)} 예약이 마감되었어요. 다른 시간을 골라 주세요.`
          : SLOT_PROBLEM_MESSAGES[check.problem],
      );
    }
    const customerId = await upsertCustomer(tx, workspaceId, { name: input.name, phone: input.phone }, { rename: false });
    const [row] = await tx
      .insert(bookings)
      .values({
        workspaceId,
        customerId,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        date: input.date,
        startMinute: input.time,
        status: "pending",
        source: "online",
        memo: input.memo,
      })
      .returning({ id: bookings.id });
    return { id: row.id };
  });
}

/** The slot is gone (taken, past or closed): the booking page sends the customer back to pick another. */
export class SlotUnavailableError extends UserError {
  constructor(message: string) {
    super(message);
    this.name = "SlotUnavailableError";
  }
}

/**
 * Moves a booking or changes its service or memo; status changes go through stamps.
 * Keeping the service keeps the booked price; picking another service takes its current snapshot.
 */
export async function updateBooking(db: Db, workspaceId: string, input: BookingUpdateInput): Promise<void> {
  await db.transaction(async (tx) => {
    const shop = await lockShop(tx, workspaceId);
    const existing = await findBooking(tx, workspaceId, input.id);
    if (!existing) throw new UserError("예약을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
    const changedService =
      input.serviceId && input.serviceId !== existing.serviceId
        ? await serviceSnapshot(tx, workspaceId, input.serviceId)
        : null;
    const snapshot = changedService
      ? {
          serviceId: changedService.id,
          serviceName: changedService.name,
          price: changedService.price,
          durationMinutes: changedService.durationMinutes,
        }
      : {};
    const durationMinutes = changedService?.durationMinutes ?? existing.durationMinutes;
    const moved = input.date !== existing.date || input.time !== existing.startMinute || changedService !== null;
    if (moved && existing.status !== "cancelled") {
      const check = checkSlot({
        date: input.date,
        startMinute: input.time,
        durationMinutes,
        hours: hoursOf(shop),
        bookings: await occupantsOn(tx, workspaceId, input.date),
        clock: OWNER_CLOCK(input.date),
        excludeId: input.id,
      });
      const problem = ownerSlotError(check, input.allowOverlap);
      if (problem) throw new UserError(problem);
    }
    await tx
      .update(bookings)
      .set({ ...snapshot, date: input.date, startMinute: input.time, memo: input.memo, updatedAt: new Date() })
      .where(and(eq(bookings.id, input.id), eq(bookings.workspaceId, workspaceId)));
  });
}

/** Presses a status stamp. Returns the booking before the change, for the undo toast. */
export async function setBookingStatus(
  db: Db,
  workspaceId: string,
  id: string,
  status: BookingStatus,
): Promise<{ previous: BookingStatus; customerName: string; startMinute: number; date: string }> {
  const existing = await findBooking(db, workspaceId, id);
  if (!existing) throw new UserError("예약을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
  if (existing.status !== status) {
    await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(bookings.id, id), eq(bookings.workspaceId, workspaceId)));
  }
  return {
    previous: existing.status,
    customerName: existing.customerName,
    startMinute: existing.startMinute,
    date: existing.date,
  };
}

/** Removes a booking entered by mistake (cancelling keeps it in the book instead). */
export async function deleteBooking(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.workspaceId, workspaceId)))
    .returning({ id: bookings.id });
  if (deleted.length === 0) throw new UserError("예약을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
}
