import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { drafts, portfolioItems } from "../../db/schema";
import { excerpt, type ContentKind } from "../../domain/content";
import type { Db } from "./db";
import { findOrder } from "./orders";

export interface CaseFilters {
  industry?: string;
  kind?: ContentKind;
}

export async function listCases(db: Db, workspaceId: string, filters: CaseFilters = {}) {
  const conditions: SQL[] = [eq(portfolioItems.workspaceId, workspaceId)];
  if (filters.industry) conditions.push(eq(portfolioItems.industry, filters.industry));
  if (filters.kind) conditions.push(eq(portfolioItems.kind, filters.kind));
  const [items, industries] = await Promise.all([
    db
      .select()
      .from(portfolioItems)
      .where(and(...conditions))
      .orderBy(desc(portfolioItems.publishedAt)),
    db
      .select({ industry: portfolioItems.industry, value: count() })
      .from(portfolioItems)
      .where(eq(portfolioItems.workspaceId, workspaceId))
      .groupBy(portfolioItems.industry),
  ]);
  const total = industries.reduce((sum, row) => sum + row.value, 0);
  return { items, industryCounts: new Map(industries.map((row) => [row.industry, row.value])), total };
}

/** Publishes a delivered order's copy as a case on the 사례 board. */
export async function publishCase(
  db: Db,
  workspaceId: string,
  input: { orderId: string; title: string; summary: string },
): Promise<{ id: string }> {
  const order = await findOrder(db, workspaceId, input.orderId);
  if (!order) throw new UserError("의뢰를 찾을 수 없어요.");
  if (order.status !== "delivered" || !order.deliveredDraftId) throw new UserError("납품을 마친 의뢰만 사례로 올릴 수 있어요.");
  const [draft] = await db
    .select({ id: drafts.id, body: drafts.body })
    .from(drafts)
    .where(and(eq(drafts.id, order.deliveredDraftId), eq(drafts.workspaceId, workspaceId)))
    .limit(1);
  if (!draft) throw new UserError("납품한 원고를 찾을 수 없어요.");
  const existing = await db
    .select({ id: portfolioItems.id })
    .from(portfolioItems)
    .where(and(eq(portfolioItems.workspaceId, workspaceId), eq(portfolioItems.draftId, draft.id)))
    .limit(1);
  if (existing.length > 0) throw new UserError("이 원고는 이미 사례에 올라가 있어요.");

  const [row] = await db
    .insert(portfolioItems)
    .values({
      workspaceId,
      industry: order.industry,
      kind: order.kind,
      title: input.title,
      clientLabel: order.clientName,
      summary: input.summary,
      excerpt: excerpt(draft.body, 140),
      draftId: draft.id,
    })
    .returning({ id: portfolioItems.id });
  return row;
}

export async function findCaseForDraft(db: Db, workspaceId: string, draftId: string) {
  const [row] = await db
    .select({ id: portfolioItems.id, title: portfolioItems.title })
    .from(portfolioItems)
    .where(and(eq(portfolioItems.workspaceId, workspaceId), eq(portfolioItems.draftId, draftId)))
    .limit(1);
  return row ?? null;
}

export async function deleteCase(db: Db, workspaceId: string, caseId: string): Promise<void> {
  const deleted = await db
    .delete(portfolioItems)
    .where(and(eq(portfolioItems.id, caseId), eq(portfolioItems.workspaceId, workspaceId)))
    .returning({ id: portfolioItems.id });
  if (deleted.length === 0) throw new UserError("사례를 찾을 수 없어요.");
}
