import { and, asc, count, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import { listings, orders, type Order } from "../../db/schema";
import type { SmartStoreDb } from "../../db/types";
import { CUSTOMER_NAMES, REGIONS } from "../../db/seed-data";
import { feeRateBp } from "../../domain/categories";
import {
  ORDER_STATUSES,
  canCancel,
  makeOrderNumber,
  nextOrderStatus,
  normalizeTrackingNumber,
  orderAmounts,
  type Courier,
  type OrderAmounts,
  type OrderStatus,
} from "../../domain/orders";
import { PAGE_SIZE, containsPattern } from "./shared";

export interface OrderEntry extends Order {
  amounts: OrderAmounts;
}

export type StatusCounts = Record<OrderStatus, number>;

const withAmounts = (order: Order): OrderEntry => ({ ...order, amounts: orderAmounts(order) });

export async function orderStatusCounts(db: SmartStoreDb, workspaceId: string): Promise<StatusCounts> {
  const rows = await db
    .select({ status: orders.status, count: count() })
    .from(orders)
    .where(eq(orders.workspaceId, workspaceId))
    .groupBy(orders.status);
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as StatusCounts;
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

export interface OrderFilters {
  status?: OrderStatus;
  query?: string;
  page: number;
}

export async function listOrders(db: SmartStoreDb, workspaceId: string, filters: OrderFilters) {
  const conditions: SQL[] = [eq(orders.workspaceId, workspaceId)];
  if (filters.status) conditions.push(eq(orders.status, filters.status));
  const query = filters.query?.trim();
  if (query) {
    const pattern = containsPattern(query);
    conditions.push(
      or(
        ilike(orders.productName, pattern),
        ilike(orders.customerName, pattern),
        ilike(orders.orderNo, pattern),
        ilike(orders.trackingNumber, pattern),
      )!,
    );
  }
  const where = and(...conditions);
  const [{ total }] = await db.select({ total: count() }).from(orders).where(where);
  const pages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));
  const page = Math.min(Math.max(filters.page, 1), pages);
  // Work queue order: the oldest waiting order first while filtering by an open status.
  const openStatus = filters.status === "new" || filters.status === "confirmed";
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(openStatus ? asc(orders.orderedAt) : desc(orders.orderedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { rows: rows.map(withAmounts), total: Number(total), page, pages };
}

/** New orders waiting for 발주 확인, oldest first. */
export async function waitingOrders(db: SmartStoreDb, workspaceId: string, limit: number): Promise<OrderEntry[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), eq(orders.status, "new")))
    .orderBy(asc(orders.orderedAt))
    .limit(limit);
  return rows.map(withAmounts);
}

/** Orders placed on or after `since` (for analytics). */
export async function ordersSince(db: SmartStoreDb, workspaceId: string, since: Date) {
  return db
    .select({
      orderedAt: orders.orderedAt,
      status: orders.status,
      category: orders.category,
      productName: orders.productName,
      listingId: orders.listingId,
      quantity: orders.quantity,
      unitPrice: orders.unitPrice,
      unitCost: orders.unitCost,
      shippingCost: orders.shippingCost,
      feeRateBp: orders.feeRateBp,
    })
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), gte(orders.orderedAt, since)));
}

export interface TestOrderInput {
  listingId: string;
  quantity: number;
}

/** Places a test order on a selling listing, as a buyer would on SmartStore. */
export async function createTestOrder(
  db: SmartStoreDb,
  workspaceId: string,
  input: TestOrderInput,
  random: () => number = Math.random,
  now: Date = new Date(),
): Promise<Order> {
  const [listing] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.id, input.listingId)))
    .limit(1);
  if (!listing) throw new UserError("주문할 상품을 찾을 수 없어요.");
  if (listing.status !== "selling") throw new UserError("판매중지한 상품은 주문을 받을 수 없어요.");

  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const [order] = await db
    .insert(orders)
    .values({
      workspaceId,
      orderNo: makeOrderNumber(seoulDateKey(now), random()),
      listingId: listing.id,
      productName: listing.title,
      category: listing.category,
      customerName: pick(CUSTOMER_NAMES),
      region: pick(REGIONS),
      quantity: input.quantity,
      unitPrice: listing.price,
      unitCost: listing.cost,
      shippingCost: listing.shippingCost,
      feeRateBp: feeRateBp(listing.category),
      isTest: true,
      orderedAt: now,
    })
    .returning();
  return order;
}

async function findOrder(db: SmartStoreDb, workspaceId: string, id: string): Promise<Order> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), eq(orders.id, id)))
    .limit(1);
  if (!order) throw new UserError("주문을 찾을 수 없어요. 새로고침해 주세요.");
  return order;
}

export interface AdvanceInput {
  id: string;
  /** Required when moving 발주확인 → 배송중. */
  courier?: Courier;
  trackingNumber?: string;
}

/** Moves an order to its next status; the status it moves from must still be current. */
export async function advanceOrder(
  db: SmartStoreDb,
  workspaceId: string,
  input: AdvanceInput,
  now: Date = new Date(),
): Promise<Order> {
  const order = await findOrder(db, workspaceId, input.id);
  const next = nextOrderStatus(order.status);
  if (!next) throw new UserError("이미 처리가 끝난 주문이에요.");

  const patch: Partial<Order> = { status: next };
  if (next === "confirmed") patch.confirmedAt = now;
  if (next === "delivered") patch.deliveredAt = now;
  if (next === "shipping") {
    const tracking = normalizeTrackingNumber(input.trackingNumber ?? "");
    if (!input.courier) throw new UserError("택배사를 골라 주세요.");
    if (!tracking) throw new UserError("송장번호는 숫자 10~14자리예요.");
    Object.assign(patch, { shippedAt: now, courier: input.courier, trackingNumber: tracking });
  }

  const [updated] = await db
    .update(orders)
    .set(patch)
    .where(and(eq(orders.workspaceId, workspaceId), eq(orders.id, order.id), eq(orders.status, order.status)))
    .returning();
  if (!updated) throw new UserError("다른 곳에서 주문 상태가 바뀌었어요. 새로고침해 주세요.");
  return updated;
}

export async function cancelOrder(
  db: SmartStoreDb,
  workspaceId: string,
  id: string,
  now: Date = new Date(),
): Promise<Order> {
  const order = await findOrder(db, workspaceId, id);
  if (!canCancel(order.status)) throw new UserError("발송한 뒤에는 취소할 수 없어요. 반품으로 처리해 주세요.");
  const [updated] = await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: now })
    .where(and(eq(orders.workspaceId, workspaceId), eq(orders.id, order.id), eq(orders.status, order.status)))
    .returning();
  if (!updated) throw new UserError("다른 곳에서 주문 상태가 바뀌었어요. 새로고침해 주세요.");
  return updated;
}
