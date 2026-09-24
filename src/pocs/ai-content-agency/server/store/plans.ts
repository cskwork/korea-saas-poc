import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { inquiries, orders, planChanges } from "../../db/schema";
import { monthRange, seoulMidnight } from "../../domain/dates";
import type { InquiryInput } from "../../domain/inputs";
import { DEFAULT_PLAN, PLANS, type PlanId } from "../../domain/plans";
import type { Db } from "./db";

export async function currentPlan(db: Db, workspaceId: string): Promise<PlanId> {
  const [row] = await db
    .select({ plan: planChanges.plan })
    .from(planChanges)
    .where(eq(planChanges.workspaceId, workspaceId))
    .orderBy(desc(planChanges.createdAt))
    .limit(1);
  return row?.plan ?? DEFAULT_PLAN;
}

export async function planHistory(db: Db, workspaceId: string, limit = 6) {
  return db
    .select({ id: planChanges.id, plan: planChanges.plan, createdAt: planChanges.createdAt })
    .from(planChanges)
    .where(eq(planChanges.workspaceId, workspaceId))
    .orderBy(desc(planChanges.createdAt))
    .limit(limit);
}

/** Orders received in today's Seoul calendar month: what the plan quota counts. */
export async function ordersReceivedThisMonth(db: Db, workspaceId: string, today: string): Promise<number> {
  const { start, next } = monthRange(today);
  const [row] = await db
    .select({ value: count() })
    .from(orders)
    .where(
      and(
        eq(orders.workspaceId, workspaceId),
        gte(orders.createdAt, seoulMidnight(start)),
        lt(orders.createdAt, seoulMidnight(next)),
      ),
    );
  return row?.value ?? 0;
}

export async function selectPlan(db: Db, workspaceId: string, plan: PlanId): Promise<void> {
  if ((await currentPlan(db, workspaceId)) === plan) {
    throw new UserError(`이미 ${PLANS[plan].name} 요금제를 쓰고 있어요.`);
  }
  await db.insert(planChanges).values({ workspaceId, plan });
}

export async function createInquiry(db: Db, workspaceId: string, input: InquiryInput): Promise<void> {
  await db.insert(inquiries).values({ workspaceId, ...input });
}

export async function recentInquiries(db: Db, workspaceId: string, limit = 3) {
  return db
    .select({ id: inquiries.id, companyName: inquiries.companyName, monthlyVolume: inquiries.monthlyVolume, createdAt: inquiries.createdAt })
    .from(inquiries)
    .where(eq(inquiries.workspaceId, workspaceId))
    .orderBy(desc(inquiries.createdAt))
    .limit(limit);
}
