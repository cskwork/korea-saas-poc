import { and, asc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { plans, publications } from "../../db/schema";
import type { PriceTable } from "../../domain/revenue";
import type { Tier } from "../../domain/tiers";
import type { Db } from "./db";

export async function getPublication(db: Db, workspaceId: string) {
  const [row] = await db.select().from(publications).where(eq(publications.workspaceId, workspaceId)).limit(1);
  if (!row) throw new Error("publication row missing for workspace");
  return row;
}

export type Publication = Awaited<ReturnType<typeof getPublication>>;

const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, pro: 2 };

export async function getPlans(db: Db, workspaceId: string) {
  const rows = await db.select().from(plans).where(eq(plans.workspaceId, workspaceId)).orderBy(asc(plans.price));
  return rows.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

export type Plan = Awaited<ReturnType<typeof getPlans>>[number];

export function priceTable(rows: readonly Pick<Plan, "tier" | "price">[]): PriceTable {
  const table: PriceTable = { free: 0, basic: 0, pro: 0 };
  for (const row of rows) table[row.tier] = row.price;
  return table;
}

export interface PublicationInput {
  name: string;
  description: string;
  editorName: string;
  sendHour: number;
  revenueGoal: number;
  paidGoal: number;
}

export async function updatePublication(db: Db, workspaceId: string, input: PublicationInput) {
  await db.update(publications).set(input).where(eq(publications.workspaceId, workspaceId));
}

export interface PlanInput {
  tier: Tier;
  name: string;
  price: number;
  summary: string;
  perks: string[];
}

export async function updatePlan(db: Db, workspaceId: string, input: PlanInput) {
  if (input.tier === "free" && input.price !== 0) throw new UserError("무료 플랜의 가격은 0원이에요.");
  if (input.tier !== "free" && input.price <= 0) throw new UserError("유료 플랜은 1원 이상이어야 해요.");
  const { tier, ...values } = input;
  const updated = await db
    .update(plans)
    .set(values)
    .where(and(eq(plans.workspaceId, workspaceId), eq(plans.tier, tier)))
    .returning({ id: plans.id });
  if (updated.length === 0) throw new UserError("플랜을 찾지 못했어요.");
}
