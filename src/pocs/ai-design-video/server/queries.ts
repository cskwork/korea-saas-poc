import "server-only";
import { seoulDateKey } from "@/core/format";
import { getModuleContext } from "@/core/modules/context";
import { subjectOf } from "../domain/brief";
import { lastMonths } from "../domain/calendar";
import type { OrderType, PlanKind } from "../domain/catalog";
import { goalProgress } from "../domain/revenue";
import { aiDesignVideo } from "../module";
import * as orderData from "./order-data";
import * as studioData from "./studio-data";

/** Reads for the module's pages. Each resolves the visitor's workspace and seeds it on first use. */

const context = () => getModuleContext(aiDesignVideo);

export async function getDashboard() {
  const { db, workspaceId } = await context();
  const today = seoulDateKey();
  const month = today.slice(0, 7);
  const [openOrders, counts, deliveries, goal] = await Promise.all([
    orderData.listOrders(db, workspaceId, { status: "open", sort: "due" }),
    orderData.countOrdersByStatus(db, workspaceId),
    studioData.listDeliveries(db, workspaceId, today, 2),
    studioData.getMonthlyGoal(db, workspaceId),
  ]);
  const thisMonth = deliveries.filter((d) => d.deliveredOn.startsWith(month));
  const achieved = thisMonth.reduce((acc, d) => acc + d.total, 0);
  return {
    today,
    counts,
    deliveredThisMonth: thisMonth.length,
    openOrders,
    progress: goalProgress(achieved, goal, today),
    recentDeliveries: deliveries.slice(0, 5),
  };
}

export async function getOrders(filter: orderData.OrderFilter) {
  const { db, workspaceId } = await context();
  const [orders, counts] = await Promise.all([
    orderData.listOrders(db, workspaceId, filter),
    orderData.countOrdersByStatus(db, workspaceId),
  ]);
  return { orders, counts, today: seoulDateKey() };
}

export async function getOrder(id: string) {
  const { db, workspaceId } = await context();
  const detail = await orderData.getOrderDetail(db, workspaceId, id);
  if (!detail) return null;
  // A fresh intake (only the 접수 event, minutes old) gets a pointer to the next step.
  const justCreated = detail.events.length === 1 && Date.now() - detail.order.createdAt.getTime() < 10 * 60_000;
  return { detail, today: seoulDateKey(), justCreated };
}

export async function getOrderFormData(orderId?: string) {
  const { db, workspaceId } = await context();
  const [packages, order] = await Promise.all([
    studioData.listPackages(db, workspaceId),
    orderId ? orderData.findOrder(db, workspaceId, orderId) : Promise.resolve(undefined),
  ]);
  return { packages, order, today: seoulDateKey() };
}

export async function getRevenue() {
  const { db, workspaceId } = await context();
  const today = seoulDateKey();
  const [deliveries, goal, pipeline] = await Promise.all([
    studioData.listDeliveries(db, workspaceId, today, 12),
    studioData.getMonthlyGoal(db, workspaceId),
    studioData.openPipeline(db, workspaceId),
  ]);
  const month = today.slice(0, 7);
  const achieved = deliveries.filter((d) => d.deliveredOn.startsWith(month)).reduce((acc, d) => acc + d.total, 0);
  return { today, months: lastMonths(month, 12), deliveries, progress: goalProgress(achieved, goal, today), pipeline };
}

export async function getPackages(kind?: PlanKind) {
  const { db, workspaceId } = await context();
  return studioData.listPackages(db, workspaceId, kind);
}

export async function getPortfolio(category?: OrderType) {
  const { db, workspaceId } = await context();
  return studioData.listPortfolio(db, workspaceId, category);
}

export async function getPortfolioItem(id: string) {
  const { db, workspaceId } = await context();
  return (await studioData.findPortfolioItem(db, workspaceId, id)) ?? null;
}

/** A portfolio entry prefilled from a delivered order and its latest brief. */
export async function getPortfolioDraftFromOrder(orderId: string) {
  const { db, workspaceId } = await context();
  const detail = await orderData.getOrderDetail(db, workspaceId, orderId);
  if (!detail) return null;
  const { order, briefs } = detail;
  const brief = briefs[0];
  return {
    orderId: order.id,
    title: order.title,
    category: order.type,
    clientLabel: order.clientName,
    headline: (brief?.copyLines[0] ?? subjectOf(order.title)).slice(0, 40),
    summary: order.brief.slice(0, 400),
    tools: order.tools,
    palette: brief?.concepts[0]?.palette ?? [],
  };
}

export async function getToolUsage() {
  const { db, workspaceId } = await context();
  return studioData.listOrderTools(db, workspaceId);
}
