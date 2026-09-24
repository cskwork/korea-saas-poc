import { eq } from "drizzle-orm";
import type { Database } from "@/core/db/connection";
import { seoulDateKey } from "@/core/format";
import { addDays } from "../domain/dates";
import { statusIndex } from "../domain/pipeline";
import { writeTemplateDraft } from "../domain/templates";
import { SEED_CASES, SEED_CLIENTS, SEED_ORDERS, type SeedOrder } from "./seed-data";
import * as schema from "./schema";
import type { DraftSource } from "./schema";

type Db = Database<typeof schema>;

/** A Seoul wall-clock time on a calendar day, as an instant. */
function at(dayKey: string, hour: number, minute = 0): Date {
  return new Date(`${dayKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+09:00`);
}

/**
 * Demo data for a new workspace: a pro plan, sixteen sample orders spread across the
 * pipeline around today, their drafts with version history, and nine sample cases.
 */
export async function seedAgency(db: Db, workspaceId: string, now: Date = new Date()): Promise<void> {
  const today = seoulDateKey(now);
  const day = (offset: number) => addDays(today, offset);
  // Sample history never lies in the future, whatever the hour of the first visit.
  const past = (instant: Date) => (instant.getTime() < now.getTime() ? instant : new Date(now.getTime() - 10 * 60_000));

  await db.insert(schema.planChanges).values([
    { workspaceId, plan: "starter", createdAt: at(day(-70), 10) },
    { workspaceId, plan: "pro", createdAt: at(day(-40), 15, 20) },
  ]);

  const ordered = [...SEED_ORDERS].sort((a, b) => a.created - b.created);
  const orderRows: (typeof schema.orders.$inferInsert)[] = [];
  const eventRows: (typeof schema.orderEvents.$inferInsert)[] = [];
  const draftRows: (typeof schema.drafts.$inferInsert)[] = [];
  const versionRows: (typeof schema.draftVersions.$inferInsert)[] = [];
  const deliveredDrafts = new Map<string, string>();

  ordered.forEach((seed, index) => {
    const orderId = crypto.randomUUID();
    const client = SEED_CLIENTS[seed.client];
    const receivedAt = past(at(day(seed.created), 9 + (index % 4), (index * 17) % 60));
    const timeline = statusTimeline(seed, day, receivedAt, past);

    orderRows.push({
      id: orderId,
      workspaceId,
      number: index + 1,
      clientName: client.name,
      industry: client.industry,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      kind: seed.kind,
      topic: seed.topic,
      brief: seed.brief,
      keywords: seed.keywords,
      tone: seed.tone,
      length: seed.length,
      status: seed.status,
      dueDate: day(seed.due),
      deliveredAt: timeline.delivered ?? null,
      createdAt: receivedAt,
      updatedAt: timeline.delivered ?? timeline.review ?? timeline.writing ?? receivedAt,
    });

    eventRows.push({ workspaceId, orderId, status: "received", note: "의뢰서 접수", createdAt: receivedAt });
    if (timeline.writing) eventRows.push({ workspaceId, orderId, status: "writing", note: "시안 작성 시작", createdAt: timeline.writing });
    if (timeline.review) eventRows.push({ workspaceId, orderId, status: "review", note: "검수 요청", createdAt: timeline.review });
    if (timeline.delivered) eventRows.push({ workspaceId, orderId, status: "delivered", note: "고객에게 납품", createdAt: timeline.delivered });

    if (!timeline.writing) return;
    const draftId = crypto.randomUUID();
    const brief = { ...seed, clientName: client.name, industry: client.industry };
    const first = writeTemplateDraft(brief);
    const versions: { title: string; body: string; source: DraftSource; note: string; createdAt: Date }[] = [
      { ...first, source: "template", note: "처음 작성", createdAt: timeline.writing },
    ];
    if (seed.final && timeline.review) {
      versions.push({ ...seed.final, source: "edit", note: "검수 반영: 확인 필요 항목 채움", createdAt: timeline.review });
    }
    const latest = versions[versions.length - 1];
    draftRows.push({
      id: draftId,
      workspaceId,
      orderId,
      kind: seed.kind,
      topic: seed.topic,
      tone: seed.tone,
      length: seed.length,
      keywords: seed.keywords,
      title: latest.title,
      body: latest.body,
      currentVersion: versions.length,
      source: latest.source,
      createdAt: timeline.writing,
      updatedAt: latest.createdAt,
    });
    versions.forEach((v, i) =>
      versionRows.push({
        workspaceId,
        draftId,
        version: i + 1,
        title: v.title,
        body: v.body,
        source: v.source,
        note: v.note,
        createdAt: v.createdAt,
      }),
    );
    if (seed.status === "delivered") deliveredDrafts.set(orderId, draftId);
  });

  // Orders first (drafts point at them), then drafts, then the delivered-draft links.
  await db.insert(schema.orders).values(orderRows);
  await db.insert(schema.orderEvents).values(eventRows);
  await db.insert(schema.drafts).values(draftRows);
  await db.insert(schema.draftVersions).values(versionRows);
  for (const [orderId, draftId] of deliveredDrafts) {
    await db.update(schema.orders).set({ deliveredDraftId: draftId }).where(eq(schema.orders.id, orderId));
  }

  await db.insert(schema.portfolioItems).values(
    SEED_CASES.map((c) => ({
      workspaceId,
      industry: c.industry,
      kind: c.kind,
      title: c.title,
      clientLabel: c.clientLabel,
      summary: c.summary,
      excerpt: c.excerpt,
      isSample: true,
      publishedAt: past(at(day(c.published), 11)),
    })),
  );
}

/** When a sample order entered each status, consistent with its created/due/delivered days. */
function statusTimeline(seed: SeedOrder, day: (offset: number) => string, receivedAt: Date, past: (instant: Date) => Date) {
  const reached = (status: SeedOrder["status"]) => statusIndex(seed.status) >= statusIndex(status);
  const reviewDay =
    seed.delivered !== undefined
      ? Math.max(seed.created + 1, seed.delivered - 1)
      : Math.max(seed.created + 1, Math.min(-1, seed.due - 1));
  return {
    writing: reached("writing") ? past(new Date(receivedAt.getTime() + 3 * 3_600_000)) : undefined,
    review: reached("review") ? past(at(day(reviewDay), 16, 40)) : undefined,
    delivered: reached("delivered") && seed.delivered !== undefined ? past(at(day(seed.delivered), 17, 30)) : undefined,
  };
}
