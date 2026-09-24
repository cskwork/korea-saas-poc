import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { phoneDigits } from "../../domain/phone";
import type { Clock } from "../../domain/time";
import type { CustomerInput } from "../../domain/validation";
import { bookings, customers, type Customer } from "../../db/schema";
import type { Db } from "./shop";

export type CustomerSort = "visits" | "recent" | "name";

export interface CustomerListRow {
  id: string;
  name: string;
  phone: string;
  visits: number;
  lastVisit: string | null;
  nextVisit: string | null;
}

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (ch) => `\\${ch}`);

/** Customers with visit counts from their bookings, filtered by name or phone digits. */
export async function listCustomers(
  db: Db,
  workspaceId: string,
  options: { query?: string; sort?: CustomerSort; clock: Clock },
): Promise<CustomerListRow[]> {
  const { clock } = options;
  const query = options.query?.trim() ?? "";
  const digits = phoneDigits(query);
  const matches = query
    ? or(
        ilike(customers.name, `%${escapeLike(query)}%`),
        digits.length >= 2 ? sql`regexp_replace(${customers.phone}, '\\D', '', 'g') like ${`%${digits}%`}` : undefined,
      )
    : undefined;

  const visited = sql`${bookings.status} = 'confirmed' and (${bookings.date} < ${clock.date} or (${bookings.date} = ${clock.date} and ${bookings.startMinute} <= ${clock.minute}))`;
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      visits: sql<number>`count(${bookings.id}) filter (where ${visited})`.mapWith(Number),
      lastVisit: sql<string | null>`(max(${bookings.date}) filter (where ${visited}))::text`,
      nextVisit: sql<
        string | null
      >`(min(${bookings.date}) filter (where ${bookings.status} <> 'cancelled' and (${bookings.date} > ${clock.date} or (${bookings.date} = ${clock.date} and ${bookings.startMinute} > ${clock.minute}))))::text`,
    })
    .from(customers)
    .leftJoin(bookings, and(eq(bookings.customerId, customers.id), eq(bookings.workspaceId, workspaceId)))
    .where(and(eq(customers.workspaceId, workspaceId), matches))
    .groupBy(customers.id)
    .orderBy(asc(customers.name));

  const byName = (a: CustomerListRow, b: CustomerListRow) => a.name.localeCompare(b.name, "ko");
  switch (options.sort ?? "visits") {
    case "name":
      return rows.sort(byName);
    case "recent":
      return rows.sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? "") || byName(a, b));
    case "visits":
      return rows.sort((a, b) => b.visits - a.visits || byName(a, b));
  }
}

export async function countCustomers(db: Db, workspaceId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(customers).where(eq(customers.workspaceId, workspaceId));
  return row?.n ?? 0;
}

export async function findCustomer(db: Db, workspaceId: string, id: string): Promise<Customer | undefined> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.workspaceId, workspaceId)))
    .limit(1);
  return customer;
}

/** A customer's bookings, newest first. */
export async function customerHistory(db: Db, workspaceId: string, customerId: string) {
  return db
    .select({
      id: bookings.id,
      date: bookings.date,
      startMinute: bookings.startMinute,
      durationMinutes: bookings.durationMinutes,
      serviceName: bookings.serviceName,
      price: bookings.price,
      status: bookings.status,
      source: bookings.source,
    })
    .from(bookings)
    .where(and(eq(bookings.workspaceId, workspaceId), eq(bookings.customerId, customerId)))
    .orderBy(desc(bookings.date), desc(bookings.startMinute));
}

/**
 * Finds the customer by phone (the shop's identity for a customer) or registers them.
 * `rename` updates the stored name (the owner typed it); a customer booking online does not rename.
 */
export async function upsertCustomer(
  db: Db,
  workspaceId: string,
  input: { name: string; phone: string },
  options: { rename: boolean },
): Promise<string> {
  const [row] = await db
    .insert(customers)
    .values({ workspaceId, name: input.name, phone: input.phone })
    .onConflictDoUpdate({
      target: [customers.workspaceId, customers.phone],
      set: options.rename ? { name: input.name } : { phone: input.phone },
    })
    .returning({ id: customers.id });
  return row.id;
}

async function phoneTaken(db: Db, workspaceId: string, phone: string, exceptId?: string): Promise<boolean> {
  const [row] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.workspaceId, workspaceId), eq(customers.phone, phone)))
    .limit(1);
  return Boolean(row && row.id !== exceptId);
}

export async function createCustomer(db: Db, workspaceId: string, input: CustomerInput): Promise<Customer> {
  if (await phoneTaken(db, workspaceId, input.phone)) {
    throw new UserError("이미 등록된 연락처예요. 고객 목록에서 찾아 주세요.");
  }
  const [customer] = await db
    .insert(customers)
    .values({ ...input, workspaceId })
    .returning();
  return customer;
}

export async function updateCustomer(db: Db, workspaceId: string, id: string, input: CustomerInput): Promise<Customer> {
  if (await phoneTaken(db, workspaceId, input.phone, id)) {
    throw new UserError("다른 고객이 이미 쓰고 있는 연락처예요.");
  }
  const [customer] = await db
    .update(customers)
    .set(input)
    .where(and(eq(customers.id, id), eq(customers.workspaceId, workspaceId)))
    .returning();
  if (!customer) throw new UserError("고객을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
  return customer;
}

/** Deletes a customer and (by cascade) their bookings. Returns how many bookings went with them. */
export async function deleteCustomer(db: Db, workspaceId: string, id: string): Promise<{ name: string; bookings: number }> {
  return db.transaction(async (tx) => {
    const [{ n }] = await tx
      .select({ n: count() })
      .from(bookings)
      .where(and(eq(bookings.workspaceId, workspaceId), eq(bookings.customerId, id)));
    const [customer] = await tx
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.workspaceId, workspaceId)))
      .returning({ name: customers.name });
    if (!customer) throw new UserError("고객을 찾을 수 없어요. 새로고침 후 다시 시도해 주세요.");
    return { name: customer.name, bookings: n };
  });
}
