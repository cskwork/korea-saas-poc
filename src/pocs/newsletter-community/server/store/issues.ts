import { and, asc, count, desc, eq, ilike, inArray, isNotNull, lte, max, ne, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { issues, publications, sends, sponsorships, subscribers } from "../../db/schema";
import { dueIssues, nextIssueNumber, publishProblems, type Category, type IssueStatus } from "../../domain/issues";
import { cumulativeOpensByHour, simulateEngagement, summarizeEngagement } from "../../domain/simulation";
import { AUDIENCES, audienceTiers, TIERS, type Audience, type Tier } from "../../domain/tiers";
import type { Db } from "./db";

export interface IssueInput {
  title: string;
  lede: string;
  body: string;
  category: Category;
  audience: Audience;
}

export interface IssueFilter {
  status?: IssueStatus;
  q?: string;
}

const statusOrder = sql`case ${issues.status} when 'scheduled' then 0 when 'draft' then 1 else 2 end`;

/** Per-issue engagement aggregated in SQL (opens/clicks counted only once their simulated time has passed). */
function engagementSubquery(db: Db, workspaceId: string, now: Date) {
  return db
    .select({
      issueId: sends.issueId,
      recipients: count().as("recipients"),
      opens: sql<number>`count(*) filter (where ${lte(sends.openedAt, now)})`.mapWith(Number).as("opens"),
      clicks: sql<number>`count(*) filter (where ${lte(sends.clickedAt, now)})`.mapWith(Number).as("clicks"),
    })
    .from(sends)
    .where(eq(sends.workspaceId, workspaceId))
    .groupBy(sends.issueId)
    .as("engagement");
}

export async function listIssues(db: Db, workspaceId: string, filter: IssueFilter, now: Date) {
  const engagement = engagementSubquery(db, workspaceId, now);
  const conditions: (SQL | undefined)[] = [eq(issues.workspaceId, workspaceId)];
  if (filter.status) conditions.push(eq(issues.status, filter.status));
  const q = filter.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(or(ilike(issues.title, pattern), ilike(issues.lede, pattern)));
  }
  const rows = await db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      lede: issues.lede,
      category: issues.category,
      audience: issues.audience,
      status: issues.status,
      scheduledAt: issues.scheduledAt,
      publishedAt: issues.publishedAt,
      updatedAt: issues.updatedAt,
      recipients: engagement.recipients,
      opens: engagement.opens,
      clicks: engagement.clicks,
    })
    .from(issues)
    .leftJoin(engagement, eq(engagement.issueId, issues.id))
    .where(and(...conditions))
    .orderBy(statusOrder, sql`${issues.scheduledAt} asc nulls last`, sql`${issues.number} desc nulls last`, desc(issues.updatedAt));
  return rows.map((row) => ({
    ...row,
    recipients: Number(row.recipients ?? 0),
    opens: Number(row.opens ?? 0),
    clicks: Number(row.clicks ?? 0),
  }));
}

export type IssueListRow = Awaited<ReturnType<typeof listIssues>>[number];

export async function issueStatusCounts(db: Db, workspaceId: string): Promise<Record<IssueStatus, number>> {
  const rows = await db
    .select({ status: issues.status, n: count() })
    .from(issues)
    .where(eq(issues.workspaceId, workspaceId))
    .groupBy(issues.status);
  const counts: Record<IssueStatus, number> = { draft: 0, scheduled: 0, published: 0 };
  for (const row of rows) counts[row.status] = row.n;
  return counts;
}

/** The 호수 the next published issue will take. */
export async function nextNumber(db: Db, workspaceId: string): Promise<number> {
  const [{ top }] = await db.select({ top: max(issues.number) }).from(issues).where(eq(issues.workspaceId, workspaceId));
  return nextIssueNumber(top);
}

export async function getIssue(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)))
    .limit(1);
  return row ?? null;
}

export type Issue = NonNullable<Awaited<ReturnType<typeof getIssue>>>;

/** Active subscribers each audience would reach right now. */
export async function recipientCounts(db: Db, workspaceId: string): Promise<Record<Audience, number>> {
  const rows = await db
    .select({ tier: subscribers.tier, n: count() })
    .from(subscribers)
    .where(and(eq(subscribers.workspaceId, workspaceId), eq(subscribers.status, "active")))
    .groupBy(subscribers.tier);
  const byTier: Record<Tier, number> = { free: 0, basic: 0, pro: 0 };
  for (const row of rows) byTier[row.tier] = row.n;
  return Object.fromEntries(
    AUDIENCES.map((audience) => [audience, audienceTiers(audience).reduce((sum, tier) => sum + byTier[tier], 0)]),
  ) as Record<Audience, number>;
}

export async function createIssue(db: Db, workspaceId: string, input: IssueInput, now: Date) {
  const [row] = await db
    .insert(issues)
    .values({ workspaceId, ...input, status: "draft", createdAt: now, updatedAt: now })
    .returning({ id: issues.id });
  return row.id;
}

async function requireIssue(db: Db, workspaceId: string, id: string) {
  const issue = await getIssue(db, workspaceId, id);
  if (!issue) throw new UserError("호를 찾지 못했어요. 이미 삭제되었을 수 있어요.");
  return issue;
}

export async function updateIssue(db: Db, workspaceId: string, id: string, input: IssueInput, now: Date) {
  const issue = await requireIssue(db, workspaceId, id);
  if (issue.status === "published" && input.audience !== issue.audience) {
    throw new UserError("이미 발송한 호는 받는 사람을 바꿀 수 없어요.");
  }
  await db
    .update(issues)
    .set({ ...input, updatedAt: now })
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)));
}

export async function scheduleIssue(db: Db, workspaceId: string, id: string, at: Date, now: Date) {
  const issue = await requireIssue(db, workspaceId, id);
  if (issue.status === "published") throw new UserError("이미 발행한 호예요.");
  const [problem] = publishProblems(issue);
  if (problem) throw new UserError(problem);
  if (at.getTime() <= now.getTime() + 60_000) throw new UserError("예약 시각은 지금보다 뒤로 골라 주세요.");
  await db
    .update(issues)
    .set({ status: "scheduled", scheduledAt: at, updatedAt: now })
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)));
}

export async function unscheduleIssue(db: Db, workspaceId: string, id: string, now: Date) {
  const issue = await requireIssue(db, workspaceId, id);
  if (issue.status !== "scheduled") throw new UserError("예약된 호가 아니에요.");
  await db
    .update(issues)
    .set({ status: "draft", scheduledAt: null, updatedAt: now })
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)));
}

const SEND_BATCH = 500;

/**
 * Publishes an issue: assigns the next 호수 and records one send per active
 * subscriber whose tier the audience covers, with simulated engagement.
 * `at` is the publication instant (the scheduled time for due issues).
 */
export async function publishIssue(db: Db, workspaceId: string, id: string, at: Date) {
  return db.transaction(async (tx) => {
    // Serialises publishing per workspace so issue numbers never collide.
    await tx.select({ id: publications.id }).from(publications).where(eq(publications.workspaceId, workspaceId)).for("update");

    const [issue] = await tx
      .select()
      .from(issues)
      .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)))
      .limit(1);
    if (!issue) throw new UserError("호를 찾지 못했어요. 이미 삭제되었을 수 있어요.");
    if (issue.status === "published") throw new UserError("이미 발행한 호예요.");
    const [problem] = publishProblems(issue);
    if (problem) throw new UserError(problem);

    const [{ top }] = await tx.select({ top: max(issues.number) }).from(issues).where(eq(issues.workspaceId, workspaceId));
    const number = nextIssueNumber(top);
    await tx
      .update(issues)
      .set({ status: "published", number, publishedAt: at, scheduledAt: null, updatedAt: at })
      .where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id)));

    const recipients = await tx
      .select({ id: subscribers.id, email: subscribers.email, tier: subscribers.tier })
      .from(subscribers)
      .where(
        and(
          eq(subscribers.workspaceId, workspaceId),
          eq(subscribers.status, "active"),
          inArray(subscribers.tier, [...audienceTiers(issue.audience)]),
        ),
      );
    for (let i = 0; i < recipients.length; i += SEND_BATCH) {
      await tx.insert(sends).values(
        recipients.slice(i, i + SEND_BATCH).map((r) => ({
          workspaceId,
          issueId: id,
          subscriberId: r.id,
          email: r.email,
          tier: r.tier,
          sentAt: at,
          ...simulateEngagement({ issueId: id, recipientKey: r.id, tier: r.tier, sentAt: at }),
        })),
      );
    }
    return { number, recipients: recipients.length };
  });
}

/** Publishes scheduled issues whose time has passed (run lazily whenever the module is visited). */
export async function publishDueIssues(db: Db, workspaceId: string, now: Date) {
  const scheduled = await db
    .select({ id: issues.id, status: issues.status, scheduledAt: issues.scheduledAt })
    .from(issues)
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.status, "scheduled"), lte(issues.scheduledAt, now)));
  let published = 0;
  for (const issue of dueIssues(scheduled, now)) {
    try {
      await publishIssue(db, workspaceId, issue.id, issue.scheduledAt ?? now);
      published += 1;
    } catch (error) {
      // A concurrent request may have published it first, or it was emptied after scheduling.
      if (!(error instanceof UserError)) throw error;
    }
  }
  return published;
}

export async function deleteIssue(db: Db, workspaceId: string, id: string) {
  const issue = await requireIssue(db, workspaceId, id);
  if (issue.status === "published") {
    throw new UserError("발행한 호는 지울 수 없어요. 내용을 고쳐 다시 저장할 수는 있어요.");
  }
  await db.delete(issues).where(and(eq(issues.workspaceId, workspaceId), eq(issues.id, id), ne(issues.status, "published")));
}

/** The send report of a published issue: totals, per-tier split, the open curve and recipients. */
export async function issueReport(db: Db, workspaceId: string, issue: Issue, now: Date) {
  if (issue.status !== "published" || !issue.publishedAt) return null;
  const rows = await db
    .select({
      id: sends.id,
      email: sends.email,
      tier: sends.tier,
      openedAt: sends.openedAt,
      clickedAt: sends.clickedAt,
      name: subscribers.name,
    })
    .from(sends)
    .leftJoin(subscribers, eq(subscribers.id, sends.subscriberId))
    .where(and(eq(sends.workspaceId, workspaceId), eq(sends.issueId, issue.id)))
    .orderBy(sql`${sends.openedAt} asc nulls last`, asc(sends.email));

  const visible = rows.map((row) => ({
    ...row,
    openedAt: row.openedAt && row.openedAt <= now ? row.openedAt : null,
    clickedAt: row.clickedAt && row.clickedAt <= now ? row.clickedAt : null,
  }));
  return {
    summary: summarizeEngagement(rows, now),
    byTier: TIERS.map((tier) => ({ tier, ...summarizeEngagement(rows.filter((row) => row.tier === tier), now) })).filter(
      (entry) => entry.recipients > 0,
    ),
    curve: cumulativeOpensByHour(rows, issue.publishedAt, now, 48),
    recipients: visible,
  };
}

export type IssueReport = NonNullable<Awaited<ReturnType<typeof issueReport>>>;

// ---- public letter -------------------------------------------------------

export async function listPublishedIssues(db: Db, workspaceId: string) {
  return db
    .select({
      id: issues.id,
      number: issues.number,
      title: issues.title,
      lede: issues.lede,
      category: issues.category,
      audience: issues.audience,
      publishedAt: issues.publishedAt,
    })
    .from(issues)
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.status, "published"), isNotNull(issues.number)))
    .orderBy(desc(issues.number));
}

export type PublishedIssueSummary = Awaited<ReturnType<typeof listPublishedIssues>>[number];

export async function getPublishedIssue(db: Db, workspaceId: string, number: number) {
  const [row] = await db
    .select()
    .from(issues)
    .where(and(eq(issues.workspaceId, workspaceId), eq(issues.status, "published"), eq(issues.number, number)))
    .limit(1);
  return row ?? null;
}

/** The sponsorship placed in an issue, if any. */
export async function sponsorshipForIssue(db: Db, workspaceId: string, issueId: string) {
  const [row] = await db
    .select({ id: sponsorships.id, sponsorName: sponsorships.sponsorName, message: sponsorships.message })
    .from(sponsorships)
    .where(and(eq(sponsorships.workspaceId, workspaceId), eq(sponsorships.issueId, issueId)))
    .limit(1);
  return row ?? null;
}

/** Sponsorships the editor can place in an issue: unplaced ones plus the one already in it. */
export async function placeableSponsorships(db: Db, workspaceId: string, issueId: string | null) {
  const placement = issueId ? or(sql`${sponsorships.issueId} is null`, eq(sponsorships.issueId, issueId)) : sql`${sponsorships.issueId} is null`;
  return db
    .select({
      id: sponsorships.id,
      sponsorName: sponsorships.sponsorName,
      message: sponsorships.message,
      amount: sponsorships.amount,
      runOn: sponsorships.runOn,
      issueId: sponsorships.issueId,
    })
    .from(sponsorships)
    .where(and(eq(sponsorships.workspaceId, workspaceId), placement))
    .orderBy(asc(sponsorships.runOn));
}

/** Places one sponsorship in the issue (or none), releasing any other placed there before. */
export async function placeSponsorship(db: Db, workspaceId: string, issueId: string, sponsorshipId: string | null) {
  await db.transaction(async (tx) => {
    await tx
      .update(sponsorships)
      .set({ issueId: null })
      .where(and(eq(sponsorships.workspaceId, workspaceId), eq(sponsorships.issueId, issueId)));
    if (!sponsorshipId) return;
    const placed = await tx
      .update(sponsorships)
      .set({ issueId })
      .where(
        and(
          eq(sponsorships.workspaceId, workspaceId),
          eq(sponsorships.id, sponsorshipId),
          sql`${sponsorships.issueId} is null`,
        ),
      )
      .returning({ id: sponsorships.id });
    if (placed.length === 0) throw new UserError("다른 호에 이미 실린 광고예요.");
  });
}
