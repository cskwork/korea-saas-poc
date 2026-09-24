import { and, asc, desc, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { UserError } from "@/core/actions";
import type { Database } from "@/core/db/connection";
import { seoulDateKey } from "@/core/format";
import { addDays, lastMonths } from "../domain/calendar";
import { OPEN_STATUSES, type OrderType, type PlanKind } from "../domain/catalog";
import type { PortfolioInput } from "../domain/inputs";
import { orderTotal } from "../domain/pricing";
import { DEFAULT_MONTHLY_GOAL, type DeliveredOrder } from "../domain/revenue";
import * as schema from "../db/schema";

/** Studio-wide data: goal, deliveries for analytics, price sheet, portfolio, tool usage. */

type Db = Database<typeof schema>;
const { orders, packages, portfolioItems, studioSettings } = schema;

export async function getMonthlyGoal(db: Db, workspaceId: string): Promise<number> {
  const [row] = await db
    .select({ monthlyGoal: studioSettings.monthlyGoal })
    .from(studioSettings)
    .where(eq(studioSettings.workspaceId, workspaceId))
    .limit(1);
  return row?.monthlyGoal ?? DEFAULT_MONTHLY_GOAL;
}

export async function setMonthlyGoal(db: Db, workspaceId: string, monthlyGoal: number): Promise<void> {
  await db
    .insert(studioSettings)
    .values({ workspaceId, monthlyGoal })
    .onConflictDoUpdate({ target: studioSettings.workspaceId, set: { monthlyGoal, updatedAt: new Date() } });
}

export interface Delivery extends DeliveredOrder {
  id: string;
  code: string;
  clientName: string;
  title: string;
}

/** Orders delivered in the last `months` Seoul months (including the current one), newest first. */
export async function listDeliveries(db: Db, workspaceId: string, today: string, months = 12): Promise<Delivery[]> {
  const firstMonth = lastMonths(today.slice(0, 7), months)[0];
  // One day of slack before the first Seoul month; exact bucketing happens on the Seoul day below.
  const since = new Date(`${addDays(`${firstMonth}-01`, -1)}T00:00:00Z`);
  const rows = await db
    .select({
      id: orders.id,
      code: orders.code,
      clientName: orders.clientName,
      title: orders.title,
      type: orders.type,
      plan: orders.plan,
      price: orders.price,
      extraFees: orders.extraFees,
      deliveredAt: orders.deliveredAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.workspaceId, workspaceId),
        eq(orders.status, "delivered"),
        isNotNull(orders.deliveredAt),
        gte(orders.deliveredAt, since),
      ),
    )
    .orderBy(desc(orders.deliveredAt));
  return rows
    .map((row) => ({
      id: row.id,
      code: row.code,
      clientName: row.clientName,
      title: row.title,
      type: row.type,
      plan: row.plan,
      total: orderTotal(row),
      deliveredOn: seoulDateKey(row.deliveredAt!),
    }))
    .filter((row) => row.deliveredOn.slice(0, 7) >= firstMonth);
}

/** Booked value of work not yet delivered. */
export async function openPipeline(db: Db, workspaceId: string): Promise<{ total: number; count: number }> {
  const rows = await db
    .select({ price: orders.price, extraFees: orders.extraFees })
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), inArray(orders.status, [...OPEN_STATUSES])));
  return { total: rows.reduce((acc, r) => acc + orderTotal(r), 0), count: rows.length };
}

export type PackageRecord = typeof packages.$inferSelect;

export async function listPackages(db: Db, workspaceId: string, kind?: PlanKind): Promise<PackageRecord[]> {
  return db
    .select()
    .from(packages)
    .where(
      kind
        ? and(eq(packages.workspaceId, workspaceId), eq(packages.kind, kind))
        : eq(packages.workspaceId, workspaceId),
    )
    .orderBy(asc(packages.sortOrder));
}

export async function updatePackage(
  db: Db,
  workspaceId: string,
  input: { id: string; price: number; revisionLimit: number | null; turnaroundDays: number; featured: boolean },
): Promise<PackageRecord> {
  const { id, ...values } = input;
  const [row] = await db
    .update(packages)
    .set(values)
    .where(and(eq(packages.id, id), eq(packages.workspaceId, workspaceId)))
    .returning();
  if (!row) throw new UserError("패키지를 찾을 수 없어요. 가격표를 새로고침해 주세요.");
  return row;
}

export type PortfolioRecord = typeof portfolioItems.$inferSelect;

export async function listPortfolio(db: Db, workspaceId: string, category?: OrderType): Promise<PortfolioRecord[]> {
  return db
    .select()
    .from(portfolioItems)
    .where(
      category
        ? and(eq(portfolioItems.workspaceId, workspaceId), eq(portfolioItems.category, category))
        : eq(portfolioItems.workspaceId, workspaceId),
    )
    .orderBy(desc(portfolioItems.createdAt));
}

export async function findPortfolioItem(db: Db, workspaceId: string, id: string): Promise<PortfolioRecord | undefined> {
  const [row] = await db
    .select()
    .from(portfolioItems)
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .limit(1);
  return row;
}

async function assertOwnOrder(db: Db, workspaceId: string, orderId: string | undefined) {
  if (!orderId) return;
  const [row] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.workspaceId, workspaceId)))
    .limit(1);
  if (!row) throw new UserError("연결할 주문을 찾을 수 없어요.");
}

function portfolioValues(input: PortfolioInput) {
  return {
    orderId: input.orderId ?? null,
    title: input.title,
    category: input.category,
    clientLabel: input.clientLabel,
    headline: input.headline,
    summary: input.summary,
    tools: input.tools,
    palette: input.palette,
  };
}

export async function createPortfolioItem(
  db: Db,
  workspaceId: string,
  input: PortfolioInput,
): Promise<PortfolioRecord> {
  await assertOwnOrder(db, workspaceId, input.orderId);
  const [row] = await db
    .insert(portfolioItems)
    .values({ ...portfolioValues(input), workspaceId })
    .returning();
  return row;
}

export async function updatePortfolioItem(
  db: Db,
  workspaceId: string,
  id: string,
  input: PortfolioInput,
): Promise<PortfolioRecord> {
  await assertOwnOrder(db, workspaceId, input.orderId);
  const [row] = await db
    .update(portfolioItems)
    .set(portfolioValues(input))
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .returning();
  if (!row) throw new UserError("포트폴리오 작업을 찾을 수 없어요.");
  return row;
}

export async function deletePortfolioItem(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(portfolioItems)
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .returning({ id: portfolioItems.id });
  if (deleted.length === 0) throw new UserError("포트폴리오 작업을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
}

/** Type and tools of every order, for the tool matrix's usage counts. */
export async function listOrderTools(db: Db, workspaceId: string): Promise<{ type: OrderType; tools: string[] }[]> {
  return db.select({ type: orders.type, tools: orders.tools }).from(orders).where(eq(orders.workspaceId, workspaceId));
}
