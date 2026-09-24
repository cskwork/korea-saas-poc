import { and, asc, desc, eq, ilike, inArray, isNull, like, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import type { Database } from "@/core/db/connection";
import type { BriefContent } from "../domain/brief";
import { ORDER_STATUSES, OPEN_STATUSES, type OrderStatus, type OrderType } from "../domain/catalog";
import type { OrderInput } from "../domain/inputs";
import { nextOrderCode, orderCodePrefix } from "../domain/order-code";
import { findTransition, planRevision, WorkflowError, type TransitionKind } from "../domain/workflow";
import * as schema from "../db/schema";

/**
 * Order data functions. Every function takes the tenant explicitly and matches
 * it on every read and write, so they can be exercised directly in tests.
 */

type Db = Database<typeof schema>;
const { orders, orderEvents, revisions, briefs, packages, portfolioItems } = schema;

export type OrderRecord = typeof orders.$inferSelect;
export type OrderSummary = Pick<
  OrderRecord,
  | "id"
  | "code"
  | "clientName"
  | "type"
  | "title"
  | "brief"
  | "status"
  | "dueDate"
  | "price"
  | "extraFees"
  | "revisionLimit"
  | "revisionsUsed"
  | "plan"
  | "packageName"
  | "quantity"
  | "rush"
  | "deliveredAt"
  | "createdAt"
> & { hasBrief: boolean };

const summaryColumns = {
  id: orders.id,
  code: orders.code,
  clientName: orders.clientName,
  type: orders.type,
  title: orders.title,
  brief: orders.brief,
  status: orders.status,
  dueDate: orders.dueDate,
  price: orders.price,
  extraFees: orders.extraFees,
  revisionLimit: orders.revisionLimit,
  revisionsUsed: orders.revisionsUsed,
  plan: orders.plan,
  packageName: orders.packageName,
  quantity: orders.quantity,
  rush: orders.rush,
  deliveredAt: orders.deliveredAt,
  createdAt: orders.createdAt,
};

async function withBriefFlags(
  db: Db,
  workspaceId: string,
  rows: Omit<OrderSummary, "hasBrief">[],
): Promise<OrderSummary[]> {
  if (rows.length === 0) return [];
  const withBriefs = await db
    .selectDistinct({ orderId: briefs.orderId })
    .from(briefs)
    .where(
      and(
        eq(briefs.workspaceId, workspaceId),
        inArray(
          briefs.orderId,
          rows.map((r) => r.id),
        ),
      ),
    );
  const ids = new Set(withBriefs.map((b) => b.orderId));
  return rows.map((row) => ({ ...row, hasBrief: ids.has(row.id) }));
}

export type OrderSort = "due" | "recent" | "amount";

export interface OrderFilter {
  status?: OrderStatus | "open";
  type?: OrderType;
  q?: string;
  sort?: OrderSort;
  limit?: number;
}

function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function listOrders(db: Db, workspaceId: string, filter: OrderFilter = {}): Promise<OrderSummary[]> {
  const conditions: SQL[] = [eq(orders.workspaceId, workspaceId)];
  if (filter.status === "open") conditions.push(inArray(orders.status, [...OPEN_STATUSES]));
  else if (filter.status) conditions.push(eq(orders.status, filter.status));
  if (filter.type) conditions.push(eq(orders.type, filter.type));
  const q = filter.q?.trim();
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push(or(ilike(orders.clientName, pattern), ilike(orders.title, pattern), ilike(orders.code, pattern))!);
  }
  const order =
    filter.sort === "recent"
      ? [desc(orders.createdAt)]
      : filter.sort === "amount"
        ? [desc(sql`${orders.price} + ${orders.extraFees}`), desc(orders.createdAt)]
        : [asc(orders.dueDate), asc(orders.code)];
  const rows = await db
    .select(summaryColumns)
    .from(orders)
    .where(and(...conditions))
    .orderBy(...order)
    .limit(filter.limit ?? 200);
  return withBriefFlags(db, workspaceId, rows);
}

export async function countOrdersByStatus(db: Db, workspaceId: string): Promise<Record<OrderStatus, number>> {
  const rows = await db
    .select({ status: orders.status, count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.workspaceId, workspaceId))
    .groupBy(orders.status);
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

export async function findOrder(db: Db, workspaceId: string, id: string): Promise<OrderRecord | undefined> {
  const [row] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.workspaceId, workspaceId)))
    .limit(1);
  return row;
}

async function requireOrder(db: Db, workspaceId: string, id: string): Promise<OrderRecord> {
  const order = await findOrder(db, workspaceId, id);
  if (!order) throw new UserError("주문을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  return order;
}

export async function getOrderDetail(db: Db, workspaceId: string, id: string) {
  const order = await findOrder(db, workspaceId, id);
  if (!order) return null;
  const scoped = (table: typeof revisions | typeof orderEvents | typeof briefs) =>
    and(eq(table.workspaceId, workspaceId), eq(table.orderId, id));
  const [rounds, events, briefRows, published] = await Promise.all([
    db.select().from(revisions).where(scoped(revisions)).orderBy(asc(revisions.round)),
    db.select().from(orderEvents).where(scoped(orderEvents)).orderBy(asc(orderEvents.createdAt)),
    db.select().from(briefs).where(scoped(briefs)).orderBy(desc(briefs.createdAt)),
    db
      .select({ id: portfolioItems.id })
      .from(portfolioItems)
      .where(and(eq(portfolioItems.workspaceId, workspaceId), eq(portfolioItems.orderId, id)))
      .limit(1),
  ]);
  return { order, revisions: rounds, events, briefs: briefRows, portfolioItemId: published[0]?.id ?? null };
}

export type OrderDetail = NonNullable<Awaited<ReturnType<typeof getOrderDetail>>>;

async function resolvePackage(db: Db, workspaceId: string, input: OrderInput) {
  if (!input.packageId) return { packageId: null, packageName: "직접 견적", plan: "single" as const, type: input.type };
  const [pkg] = await db
    .select()
    .from(packages)
    .where(and(eq(packages.id, input.packageId), eq(packages.workspaceId, workspaceId)))
    .limit(1);
  if (!pkg) throw new UserError("선택한 패키지를 찾을 수 없어요. 가격표를 새로고침해 주세요.");
  // A single-order package fixes what gets made; a subscription leaves the type to the order.
  return { packageId: pkg.id, packageName: pkg.name, plan: pkg.kind, type: pkg.orderType ?? input.type };
}

function orderValues(input: OrderInput) {
  return {
    title: input.title,
    clientName: input.clientName,
    clientContact: input.clientContact,
    brief: input.brief,
    referenceLinks: input.referenceLinks,
    dueDate: input.dueDate,
    quantity: input.quantity,
    rush: input.rush,
    price: input.price,
    revisionLimit: input.revisionLimit,
    tools: input.tools,
  };
}

export async function createOrder(db: Db, workspaceId: string, input: OrderInput, today: string): Promise<OrderRecord> {
  const pkg = await resolvePackage(db, workspaceId, input);
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ code: orders.code })
      .from(orders)
      .where(and(eq(orders.workspaceId, workspaceId), like(orders.code, `${orderCodePrefix(today)}%`)));
    const [order] = await tx
      .insert(orders)
      .values({
        ...orderValues(input),
        ...pkg,
        workspaceId,
        code: nextOrderCode(
          today,
          existing.map((e) => e.code),
        ),
        status: "received",
      })
      .returning();
    await tx.insert(orderEvents).values({ workspaceId, orderId: order.id, toStatus: "received", note: "주문 접수" });
    return order;
  });
}

export async function updateOrder(db: Db, workspaceId: string, id: string, input: OrderInput): Promise<OrderRecord> {
  const current = await requireOrder(db, workspaceId, id);
  // An unchanged package keeps its intake snapshot (name, plan) even if the price sheet changed since.
  const pkg =
    input.packageId === (current.packageId ?? undefined)
      ? { packageId: current.packageId, packageName: current.packageName, plan: current.plan, type: input.type }
      : await resolvePackage(db, workspaceId, input);
  const [order] = await db
    .update(orders)
    .set({ ...orderValues(input), ...pkg, updatedAt: new Date() })
    .where(and(eq(orders.id, id), eq(orders.workspaceId, workspaceId)))
    .returning();
  return order;
}

export async function deleteOrder(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(orders)
    .where(and(eq(orders.id, id), eq(orders.workspaceId, workspaceId)))
    .returning({ id: orders.id });
  if (deleted.length === 0) throw new UserError("주문을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
}

function workflowGuard<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    if (error instanceof WorkflowError) throw new UserError(error.message);
    throw error;
  }
}

const TRANSITION_NOTE: Record<Exclude<TransitionKind, "request-revision">, string> = {
  start: "시안 작업 시작",
  deliver: "최종 파일 전달",
  rework: "수정 반영 시작",
  reopen: "납품 되돌림",
};

/** Moves an order along the workflow (start, deliver, rework, reopen). Change requests go through `requestRevision`. */
export async function transitionOrder(db: Db, workspaceId: string, id: string, to: OrderStatus): Promise<OrderRecord> {
  const order = await requireOrder(db, workspaceId, id);
  const transition = findTransition(order.status, to);
  if (!transition || transition.kind === "request-revision") {
    throw new UserError("지금 단계에서는 그렇게 옮길 수 없어요. 화면을 새로고침해 주세요.");
  }
  const kind = transition.kind;
  const now = new Date();
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orders)
      .set({
        status: to,
        updatedAt: now,
        deliveredAt: to === "delivered" ? now : kind === "reopen" ? null : order.deliveredAt,
      })
      // Matching the current status too makes a double submit a no-op instead of a double move.
      .where(and(eq(orders.id, id), eq(orders.workspaceId, workspaceId), eq(orders.status, order.status)))
      .returning();
    if (!updated) throw new UserError("다른 곳에서 이미 상태가 바뀌었어요. 화면을 새로고침해 주세요.");
    if (kind === "rework") {
      await tx
        .update(revisions)
        .set({ resolvedAt: now })
        .where(and(eq(revisions.workspaceId, workspaceId), eq(revisions.orderId, id), isNull(revisions.resolvedAt)));
    }
    await tx
      .insert(orderEvents)
      .values({ workspaceId, orderId: id, fromStatus: order.status, toStatus: to, note: TRANSITION_NOTE[kind] });
    return updated;
  });
}

export async function requestRevision(
  db: Db,
  workspaceId: string,
  input: { orderId: string; note: string; extraConfirmed: boolean; extraFee: number },
): Promise<{ round: number; extraFee: number }> {
  const order = await requireOrder(db, workspaceId, input.orderId);
  const plan = workflowGuard(() => planRevision(order, input));
  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(orders)
      .set({
        status: "revision",
        revisionsUsed: plan.round,
        extraFees: order.extraFees + plan.extraFee,
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, order.id), eq(orders.workspaceId, workspaceId), eq(orders.status, order.status)))
      .returning({ id: orders.id });
    if (!updated) throw new UserError("다른 곳에서 이미 상태가 바뀌었어요. 화면을 새로고침해 주세요.");
    await tx.insert(revisions).values({
      workspaceId,
      orderId: order.id,
      round: plan.round,
      note: input.note,
      extraFee: plan.extraFee,
    });
    await tx.insert(orderEvents).values({
      workspaceId,
      orderId: order.id,
      fromStatus: order.status,
      toStatus: "revision",
      note: `수정 ${plan.round}차: ${input.note}`,
    });
  });
  return plan;
}

export async function saveBrief(
  db: Db,
  workspaceId: string,
  orderId: string,
  content: BriefContent,
  source: "claude" | "template",
) {
  await requireOrder(db, workspaceId, orderId);
  const [row] = await db
    .insert(briefs)
    .values({ workspaceId, orderId, source, ...content })
    .returning();
  return row;
}

export async function deleteBrief(db: Db, workspaceId: string, briefId: string): Promise<{ orderId: string }> {
  const [row] = await db
    .delete(briefs)
    .where(and(eq(briefs.id, briefId), eq(briefs.workspaceId, workspaceId)))
    .returning({ orderId: briefs.orderId });
  if (!row) throw new UserError("콘티를 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  return row;
}
