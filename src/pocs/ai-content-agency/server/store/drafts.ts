import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { draftVersions, drafts, orderEvents, orders, type DraftRow, type DraftSource } from "../../db/schema";
import type { ContentKind, Length, Tone } from "../../domain/content";
import type { DraftContent } from "../../domain/templates";
import type { Db } from "./db";
import { findOrder, likePattern } from "./orders";

export const DRAFT_SORTS = ["recent", "oldest", "longest"] as const;
export type DraftSort = (typeof DRAFT_SORTS)[number];

export interface DraftFilters {
  q?: string;
  kind?: ContentKind;
  sort?: DraftSort;
}

export async function listDrafts(db: Db, workspaceId: string, filters: DraftFilters = {}) {
  const conditions: SQL[] = [eq(drafts.workspaceId, workspaceId)];
  const q = filters.q?.trim();
  if (q) {
    const pattern = likePattern(q);
    conditions.push(or(ilike(drafts.title, pattern), ilike(drafts.topic, pattern), ilike(drafts.body, pattern), ilike(orders.clientName, pattern))!);
  }
  if (filters.kind) conditions.push(eq(drafts.kind, filters.kind));
  const order =
    filters.sort === "oldest"
      ? [asc(drafts.updatedAt)]
      : filters.sort === "longest"
        ? [desc(sql`char_length(${drafts.body})`), desc(drafts.updatedAt)]
        : [desc(drafts.updatedAt)];

  return db
    .select({
      id: drafts.id,
      kind: drafts.kind,
      title: drafts.title,
      topic: drafts.topic,
      body: drafts.body,
      source: drafts.source,
      currentVersion: drafts.currentVersion,
      updatedAt: drafts.updatedAt,
      orderId: orders.id,
      orderNumber: orders.number,
      clientName: orders.clientName,
    })
    .from(drafts)
    .leftJoin(orders, and(eq(orders.id, drafts.orderId), eq(orders.workspaceId, workspaceId)))
    .where(and(...conditions))
    .orderBy(...order)
    .limit(200);
}

export async function findDraft(db: Db, workspaceId: string, draftId: string): Promise<DraftRow | null> {
  const [row] = await db
    .select()
    .from(drafts)
    .where(and(eq(drafts.id, draftId), eq(drafts.workspaceId, workspaceId)))
    .limit(1);
  return row ?? null;
}

export async function getDraftDetail(db: Db, workspaceId: string, draftId: string) {
  const draft = await findDraft(db, workspaceId, draftId);
  if (!draft) return null;
  const [versions, order] = await Promise.all([
    db
      .select()
      .from(draftVersions)
      .where(and(eq(draftVersions.workspaceId, workspaceId), eq(draftVersions.draftId, draftId)))
      .orderBy(desc(draftVersions.version)),
    draft.orderId ? findOrder(db, workspaceId, draft.orderId) : Promise.resolve(null),
  ]);
  return { draft, versions, order };
}

export interface NewDraft {
  kind: ContentKind;
  topic: string;
  tone: Tone;
  length: Length;
  keywords: string[];
  orderId: string | null;
  content: DraftContent;
  source: DraftSource;
  note: string;
}

/**
 * Saves a new draft as version 1. Writing a draft for a request that is still 접수
 * starts it (작성중).
 */
export async function createDraft(db: Db, workspaceId: string, input: NewDraft): Promise<{ id: string }> {
  const order = input.orderId ? await findOrder(db, workspaceId, input.orderId) : null;
  if (input.orderId && !order) throw new UserError("연결할 의뢰를 찾을 수 없어요.");

  return db.transaction(async (tx) => {
    const [draft] = await tx
      .insert(drafts)
      .values({
        workspaceId,
        orderId: order?.id ?? null,
        kind: input.kind,
        topic: input.topic,
        tone: input.tone,
        length: input.length,
        keywords: input.keywords,
        title: input.content.title,
        body: input.content.body,
        source: input.source,
      })
      .returning({ id: drafts.id });
    await tx.insert(draftVersions).values({
      workspaceId,
      draftId: draft.id,
      version: 1,
      title: input.content.title,
      body: input.content.body,
      source: input.source,
      note: input.note,
    });
    if (order?.status === "received") {
      await tx
        .update(orders)
        .set({ status: "writing", updatedAt: new Date() })
        .where(and(eq(orders.id, order.id), eq(orders.workspaceId, workspaceId)));
      await tx.insert(orderEvents).values({ workspaceId, orderId: order.id, status: "writing", note: "시안 작성 시작" });
    }
    return draft;
  });
}

export interface NewVersion {
  content: DraftContent;
  source: DraftSource;
  note: string;
  brief?: { tone: Tone; length: Length; keywords: string[] };
}

/** Appends a version (rewrite, edit or restore); earlier versions are never changed. */
export async function addVersion(db: Db, workspaceId: string, draftId: string, input: NewVersion): Promise<{ version: number }> {
  return db.transaction(async (tx) => {
    const [draft] = await tx
      .select({ currentVersion: drafts.currentVersion, title: drafts.title, body: drafts.body })
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.workspaceId, workspaceId)))
      .for("update");
    if (!draft) throw new UserError("원고를 찾을 수 없어요.");
    if (draft.title === input.content.title && draft.body === input.content.body) {
      throw new UserError("바뀐 내용이 없어요.");
    }
    const version = draft.currentVersion + 1;
    await tx.insert(draftVersions).values({
      workspaceId,
      draftId,
      version,
      title: input.content.title,
      body: input.content.body,
      source: input.source,
      note: input.note,
    });
    await tx
      .update(drafts)
      .set({
        title: input.content.title,
        body: input.content.body,
        source: input.source,
        currentVersion: version,
        updatedAt: new Date(),
        ...input.brief,
      })
      .where(and(eq(drafts.id, draftId), eq(drafts.workspaceId, workspaceId)));
    return { version };
  });
}

/** Brings back an earlier version's words as a new version, keeping who wrote them. */
export async function restoreVersion(db: Db, workspaceId: string, draftId: string, version: number): Promise<{ version: number }> {
  const [previous] = await db
    .select()
    .from(draftVersions)
    .where(and(eq(draftVersions.workspaceId, workspaceId), eq(draftVersions.draftId, draftId), eq(draftVersions.version, version)))
    .limit(1);
  if (!previous) throw new UserError("되돌릴 버전을 찾을 수 없어요.");
  return addVersion(db, workspaceId, draftId, {
    content: { title: previous.title, body: previous.body },
    source: previous.source,
    note: `v${version}로 되돌림`,
  });
}

export async function linkDraftToOrder(db: Db, workspaceId: string, draftId: string, orderId: string | null): Promise<void> {
  if (orderId && !(await findOrder(db, workspaceId, orderId))) throw new UserError("연결할 의뢰를 찾을 수 없어요.");
  const updated = await db
    .update(drafts)
    .set({ orderId, updatedAt: new Date() })
    .where(and(eq(drafts.id, draftId), eq(drafts.workspaceId, workspaceId)))
    .returning({ id: drafts.id });
  if (updated.length === 0) throw new UserError("원고를 찾을 수 없어요.");
}

export async function deleteDraft(db: Db, workspaceId: string, draftId: string): Promise<void> {
  const deleted = await db
    .delete(drafts)
    .where(and(eq(drafts.id, draftId), eq(drafts.workspaceId, workspaceId)))
    .returning({ id: drafts.id });
  if (deleted.length === 0) throw new UserError("원고를 찾을 수 없어요.");
}
