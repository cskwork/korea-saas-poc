import { and, desc, eq, inArray } from "drizzle-orm";
import { seoulDateKey } from "@/core/format";
import { drafts, orders } from "../../db/schema";
import { countCharacters } from "../../domain/content";
import { monthKey } from "../../domain/dates";
import {
  buildTimeline,
  deliveryPerformance,
  headlineCounts,
  kindMix,
  ordersThisMonth,
  pipelineCounts,
  weeklyThroughput,
  type OrderFacts,
} from "../../domain/stats";
import type { Db } from "./db";
import { currentPlan } from "./plans";

export interface StandOrder extends OrderFacts {
  id: string;
  number: number;
  clientName: string;
  topic: string;
}

/** Everything the 현황 page shows, computed from the workspace's orders and drafts. */
export async function loadDashboard(db: Db, workspaceId: string, now: Date = new Date()) {
  const today = seoulDateKey(now);
  const [orderRows, plan, recentDrafts] = await Promise.all([
    db
      .select({
        id: orders.id,
        number: orders.number,
        clientName: orders.clientName,
        topic: orders.topic,
        kind: orders.kind,
        status: orders.status,
        dueDate: orders.dueDate,
        createdAt: orders.createdAt,
        deliveredAt: orders.deliveredAt,
        deliveredDraftId: orders.deliveredDraftId,
      })
      .from(orders)
      .where(eq(orders.workspaceId, workspaceId)),
    currentPlan(db, workspaceId),
    db
      .select({
        id: drafts.id,
        kind: drafts.kind,
        title: drafts.title,
        body: drafts.body,
        source: drafts.source,
        currentVersion: drafts.currentVersion,
        updatedAt: drafts.updatedAt,
      })
      .from(drafts)
      .where(eq(drafts.workspaceId, workspaceId))
      .orderBy(desc(drafts.updatedAt))
      .limit(5),
  ]);

  const facts: StandOrder[] = orderRows.map((row) => ({
    id: row.id,
    number: row.number,
    clientName: row.clientName,
    topic: row.topic,
    kind: row.kind,
    status: row.status,
    dueDate: row.dueDate,
    createdOn: seoulDateKey(row.createdAt),
    deliveredOn: row.deliveredAt ? seoulDateKey(row.deliveredAt) : null,
  }));

  // Output this month, measured the way writing work is sold: characters and 원고지 매수.
  const month = monthKey(today);
  const deliveredThisMonth = orderRows.filter((row) => row.deliveredAt && monthKey(seoulDateKey(row.deliveredAt)) === month);
  const deliveredIds = deliveredThisMonth.flatMap((row) => (row.deliveredDraftId ? [row.deliveredDraftId] : []));
  const deliveredBodies = deliveredIds.length
    ? await db
        .select({ body: drafts.body })
        .from(drafts)
        .where(and(eq(drafts.workspaceId, workspaceId), inArray(drafts.id, deliveredIds)))
    : [];
  const deliveredCharacters = deliveredBodies.reduce((sum, row) => sum + countCharacters(row.body).withSpaces, 0);

  return {
    today,
    headline: headlineCounts(facts, today),
    timeline: buildTimeline(facts, today),
    pipeline: pipelineCounts(facts),
    performance: deliveryPerformance(facts),
    throughput: weeklyThroughput(facts, today, 8),
    kindMix: kindMix(facts),
    usage: { plan, used: ordersThisMonth(facts, today) },
    output: { orders: deliveredThisMonth.length, characters: deliveredCharacters },
    recentDrafts,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;
