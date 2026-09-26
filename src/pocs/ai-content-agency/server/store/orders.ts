import { and, asc, count, desc, eq, ilike, inArray, max, ne, or, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { drafts, orderEvents, orders, type OrderRow } from "../../db/schema";
import type { ContentKind } from "../../domain/content";
import type { OrderEditInput, OrderInput } from "../../domain/inputs";
import { josa } from "../../domain/korean";
import { STATUS_LABEL, canMove, statusIndex, type OrderStatus } from "../../domain/pipeline";
import { checkOrderAllowance, kindNotInPlan } from "../../domain/plans";
import type { Db } from "./db";
import { currentPlan, ordersReceivedThisMonth } from "./plans";

export interface OrderFilters {
  q?: string;
  kind?: ContentKind;
}

export type OrderListItem = Pick<
  OrderRow,
  "id" | "number" | "clientName" | "industry" | "kind" | "topic" | "status" | "dueDate" | "createdAt" | "deliveredAt"
> & { draftCount: number };

/** Escapes LIKE wildcards in user input. */
export function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function listOrders(db: Db, workspaceId: string, filters: OrderFilters = {}): Promise<OrderListItem[]> {
  const conditions: SQL[] = [eq(orders.workspaceId, workspaceId)];
  const q = filters.q?.trim();
  if (q) conditions.push(or(ilike(orders.clientName, likePattern(q)), ilike(orders.topic, likePattern(q)))!);
  if (filters.kind) conditions.push(eq(orders.kind, filters.kind));

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      clientName: orders.clientName,
      industry: orders.industry,
      kind: orders.kind,
      topic: orders.topic,
      status: orders.status,
      dueDate: orders.dueDate,
      createdAt: orders.createdAt,
      deliveredAt: orders.deliveredAt,
    })
    .from(orders)
    .where(and(...conditions))
    .orderBy(asc(orders.dueDate), asc(orders.number));

  const counts = rows.length
    ? await db
        .select({ orderId: drafts.orderId, value: count() })
        .from(drafts)
        .where(and(eq(drafts.workspaceId, workspaceId), inArray(drafts.orderId, rows.map((r) => r.id))))
        .groupBy(drafts.orderId)
    : [];
  const byOrder = new Map(counts.map((c) => [c.orderId, c.value]));
  return rows.map((row) => ({ ...row, draftCount: byOrder.get(row.id) ?? 0 }));
}

/** Orders still in the pipeline, for "which request is this draft for?" pickers. */
export async function listOpenOrders(db: Db, workspaceId: string) {
  return db
    .select({
      id: orders.id,
      number: orders.number,
      clientName: orders.clientName,
      industry: orders.industry,
      kind: orders.kind,
      topic: orders.topic,
      brief: orders.brief,
      keywords: orders.keywords,
      tone: orders.tone,
      length: orders.length,
      status: orders.status,
      dueDate: orders.dueDate,
    })
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), ne(orders.status, "delivered")))
    .orderBy(asc(orders.dueDate), asc(orders.number));
}

export async function findOrder(db: Db, workspaceId: string, orderId: string): Promise<OrderRow | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.workspaceId, workspaceId)))
    .limit(1);
  return row ?? null;
}

export async function getOrderDetail(db: Db, workspaceId: string, orderId: string) {
  const order = await findOrder(db, workspaceId, orderId);
  if (!order) return null;
  const [events, orderDrafts] = await Promise.all([
    db
      .select({ id: orderEvents.id, status: orderEvents.status, note: orderEvents.note, createdAt: orderEvents.createdAt })
      .from(orderEvents)
      .where(and(eq(orderEvents.workspaceId, workspaceId), eq(orderEvents.orderId, orderId)))
      .orderBy(asc(orderEvents.createdAt)),
    db
      .select({
        id: drafts.id,
        title: drafts.title,
        body: drafts.body,
        currentVersion: drafts.currentVersion,
        source: drafts.source,
        updatedAt: drafts.updatedAt,
      })
      .from(drafts)
      .where(and(eq(drafts.workspaceId, workspaceId), eq(drafts.orderId, orderId)))
      .orderBy(desc(drafts.updatedAt)),
  ]);
  return { order, events, drafts: orderDrafts };
}

async function nextOrderNumber(db: Db, workspaceId: string): Promise<number> {
  const [row] = await db.select({ value: max(orders.number) }).from(orders).where(eq(orders.workspaceId, workspaceId));
  return (row?.value ?? 0) + 1;
}

/** Takes a request into the pipeline (접수), within the workspace's plan. */
export async function createOrder(db: Db, workspaceId: string, input: OrderInput, today: string): Promise<{ id: string; number: number }> {
  const [plan, used] = await Promise.all([currentPlan(db, workspaceId), ordersReceivedThisMonth(db, workspaceId, today)]);
  const allowance = checkOrderAllowance(plan, input.kind, used);
  if (!allowance.ok) throw new UserError(allowance.reason);

  // The running number is unique per workspace; a concurrent insert that takes it retries once.
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        const number = await nextOrderNumber(tx, workspaceId);
        const [row] = await tx
          .insert(orders)
          .values({ workspaceId, number, ...input })
          .returning({ id: orders.id, number: orders.number });
        await tx.insert(orderEvents).values({ workspaceId, orderId: row.id, status: "received", note: "의뢰서 접수" });
        return row;
      });
    } catch (error) {
      if (attempt > 0 || !isUniqueViolation(error)) throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: unknown; cause?: { code?: unknown } } | null)?.code ?? (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  return code === "23505";
}

/** Corrects a request. Switching it to another kind of content needs a plan that takes that kind. */
export async function updateOrder(db: Db, workspaceId: string, input: OrderEditInput): Promise<void> {
  const { orderId, ...fields } = input;
  const order = await findOrder(db, workspaceId, orderId);
  if (!order) throw new UserError("의뢰를 찾을 수 없어요.");
  if (fields.kind !== order.kind) {
    const reason = kindNotInPlan(await currentPlan(db, workspaceId), fields.kind);
    if (reason) throw new UserError(reason);
  }
  const updated = await db
    .update(orders)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.workspaceId, workspaceId)))
    .returning({ id: orders.id });
  if (updated.length === 0) throw new UserError("의뢰를 찾을 수 없어요.");
}

export interface MoveResult {
  status: OrderStatus;
  message: string;
}

/**
 * Moves an order one step along the pipeline. Delivering needs a draft of this order:
 * the one named, or the most recently edited.
 */
export async function moveOrder(
  db: Db,
  workspaceId: string,
  input: { orderId: string; to: OrderStatus; draftId?: string },
): Promise<MoveResult> {
  const order = await findOrder(db, workspaceId, input.orderId);
  if (!order) throw new UserError("의뢰를 찾을 수 없어요.");
  if (order.status === input.to) throw new UserError(`이미 ${STATUS_LABEL[input.to]} 단계예요.`);
  if (!canMove(order.status, input.to)) throw new UserError("의뢰는 한 단계씩 옮길 수 있어요.");

  let deliveredDraftId: string | null = null;
  if (input.to === "delivered") {
    const [draft] = await db
      .select({ id: drafts.id })
      .from(drafts)
      .where(
        and(
          eq(drafts.workspaceId, workspaceId),
          eq(drafts.orderId, order.id),
          input.draftId ? eq(drafts.id, input.draftId) : undefined,
        ),
      )
      .orderBy(desc(drafts.updatedAt))
      .limit(1);
    if (!draft) {
      throw new UserError(input.draftId ? "이 의뢰에 연결된 원고가 아니에요." : "납품할 원고가 없어요. 먼저 시안을 써 주세요.");
    }
    deliveredDraftId = draft.id;
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: input.to,
        updatedAt: now,
        deliveredAt: input.to === "delivered" ? now : null,
        deliveredDraftId,
      })
      .where(and(eq(orders.id, order.id), eq(orders.workspaceId, workspaceId)));
    await tx.insert(orderEvents).values({ workspaceId, orderId: order.id, status: input.to, note: moveNote(order.status, input.to) });
  });
  return { status: input.to, message: `${order.clientName} 의뢰를 ${josa(STATUS_LABEL[input.to], "으로/로")} 옮겼어요.` };
}

function moveNote(from: OrderStatus, to: OrderStatus): string {
  if (to === "delivered") return "고객에게 납품";
  if (from === "delivered") return "납품 취소, 검수로 되돌림";
  if (statusIndex(to) < statusIndex(from)) return `${josa(STATUS_LABEL[to], "으로/로")} 되돌림`;
  return to === "writing" ? "시안 작성 시작" : "검수 요청";
}

export async function deleteOrder(db: Db, workspaceId: string, orderId: string): Promise<void> {
  const deleted = await db
    .delete(orders)
    .where(and(eq(orders.id, orderId), eq(orders.workspaceId, workspaceId)))
    .returning({ id: orders.id });
  if (deleted.length === 0) throw new UserError("의뢰를 찾을 수 없어요.");
}
