import { and, asc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import type { PlanCategory } from "../../domain/labels";
import { clients, portfolioItems, projects, servicePlans } from "../../db/schema";
import type { Db } from "../db";
import { assertOwnedOrNull } from "./owned";

/** Portfolio entries and the price list: what the public profile page shows. */

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type ServicePlan = typeof servicePlans.$inferSelect;

export async function listPortfolio(db: Db, workspaceId: string, onlyPublished = false): Promise<PortfolioItem[]> {
  const conditions = [eq(portfolioItems.workspaceId, workspaceId)];
  if (onlyPublished) conditions.push(eq(portfolioItems.published, true));
  return db
    .select()
    .from(portfolioItems)
    .where(and(...conditions))
    .orderBy(asc(portfolioItems.position), asc(portfolioItems.createdAt));
}

export interface PortfolioInput {
  title: string;
  summary: string;
  role: string;
  outcome: string;
  stack: string[];
  url: string;
  period: string;
  published: boolean;
  projectId: string | null;
}

export async function createPortfolioItem(db: Db, workspaceId: string, input: PortfolioInput): Promise<string> {
  await assertOwnedOrNull(db, workspaceId, projects, input.projectId, "연결할 프로젝트를 찾을 수 없어요.");
  const existing = await db.select({ id: portfolioItems.id }).from(portfolioItems).where(eq(portfolioItems.workspaceId, workspaceId));
  const [row] = await db
    .insert(portfolioItems)
    .values({ workspaceId, ...input, position: existing.length })
    .returning({ id: portfolioItems.id });
  return row.id;
}

export async function updatePortfolioItem(db: Db, workspaceId: string, id: string, input: PortfolioInput): Promise<void> {
  await assertOwnedOrNull(db, workspaceId, projects, input.projectId, "연결할 프로젝트를 찾을 수 없어요.");
  const updated = await db
    .update(portfolioItems)
    .set(input)
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .returning({ id: portfolioItems.id });
  if (updated.length === 0) throw new UserError("포트폴리오 항목을 찾을 수 없어요.");
}

export async function setPortfolioPublished(db: Db, workspaceId: string, id: string, published: boolean): Promise<void> {
  const updated = await db
    .update(portfolioItems)
    .set({ published })
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .returning({ id: portfolioItems.id });
  if (updated.length === 0) throw new UserError("포트폴리오 항목을 찾을 수 없어요.");
}

export async function deletePortfolioItem(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(portfolioItems)
    .where(and(eq(portfolioItems.id, id), eq(portfolioItems.workspaceId, workspaceId)))
    .returning({ id: portfolioItems.id });
  if (deleted.length === 0) throw new UserError("포트폴리오 항목을 찾을 수 없어요.");
}

/** Swaps an entry with its neighbour (-1 up, +1 down). */
export async function movePortfolioItem(db: Db, workspaceId: string, id: string, direction: -1 | 1): Promise<void> {
  await db.transaction(async (tx) => {
    const list = await tx
      .select({ id: portfolioItems.id })
      .from(portfolioItems)
      .where(eq(portfolioItems.workspaceId, workspaceId))
      .orderBy(asc(portfolioItems.position), asc(portfolioItems.createdAt));
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) throw new UserError("포트폴리오 항목을 찾을 수 없어요.");
    const swap = index + direction;
    if (swap < 0 || swap >= list.length) return;
    [list[index], list[swap]] = [list[swap], list[index]];
    for (const [position, item] of list.entries()) {
      await tx
        .update(portfolioItems)
        .set({ position })
        .where(and(eq(portfolioItems.id, item.id), eq(portfolioItems.workspaceId, workspaceId)));
    }
  });
}

/** Done projects that have no portfolio entry yet, with their client, to start an entry from. */
export async function portfolioCandidates(db: Db, workspaceId: string) {
  const [done, items] = await Promise.all([
    db
      .select({ id: projects.id, title: projects.title, description: projects.description, company: clients.company })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.status, "done"))),
    db.select({ projectId: portfolioItems.projectId }).from(portfolioItems).where(eq(portfolioItems.workspaceId, workspaceId)),
  ]);
  const used = new Set(items.map((item) => item.projectId));
  return done.filter((project) => !used.has(project.id));
}

// ---------------------------------------------------------------------------------------------
// Price list

export async function listPlans(db: Db, workspaceId: string): Promise<ServicePlan[]> {
  return db
    .select()
    .from(servicePlans)
    .where(eq(servicePlans.workspaceId, workspaceId))
    .orderBy(asc(servicePlans.category), asc(servicePlans.position), asc(servicePlans.createdAt));
}

export interface PlanInput {
  category: PlanCategory;
  name: string;
  price: number;
  delivery: string;
  features: string[];
  featured: boolean;
}

export async function createPlan(db: Db, workspaceId: string, input: PlanInput): Promise<void> {
  const existing = await db
    .select({ id: servicePlans.id })
    .from(servicePlans)
    .where(and(eq(servicePlans.workspaceId, workspaceId), eq(servicePlans.category, input.category)));
  await db.transaction(async (tx) => {
    if (input.featured) await clearFeatured(tx as unknown as Db, workspaceId, input.category);
    await tx.insert(servicePlans).values({ workspaceId, ...input, position: existing.length });
  });
}

export async function updatePlan(db: Db, workspaceId: string, id: string, input: PlanInput): Promise<void> {
  await db.transaction(async (tx) => {
    if (input.featured) await clearFeatured(tx as unknown as Db, workspaceId, input.category);
    const updated = await tx
      .update(servicePlans)
      .set(input)
      .where(and(eq(servicePlans.id, id), eq(servicePlans.workspaceId, workspaceId)))
      .returning({ id: servicePlans.id });
    if (updated.length === 0) throw new UserError("요금 항목을 찾을 수 없어요.");
  });
}

/** One recommended plan per category. */
async function clearFeatured(db: Db, workspaceId: string, category: PlanCategory) {
  await db
    .update(servicePlans)
    .set({ featured: false })
    .where(and(eq(servicePlans.workspaceId, workspaceId), eq(servicePlans.category, category)));
}

export async function deletePlan(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(servicePlans)
    .where(and(eq(servicePlans.id, id), eq(servicePlans.workspaceId, workspaceId)))
    .returning({ id: servicePlans.id });
  if (deleted.length === 0) throw new UserError("요금 항목을 찾을 수 없어요.");
}
