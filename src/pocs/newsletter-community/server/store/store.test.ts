import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { seoulDateKey } from "@/core/format";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "../../db/schema";
import { newsletterCommunity } from "../../module";
import type { BoardActor } from "../../domain/board";
import { parseSubscriberCsv } from "../../domain/csv";
import { addComment, createPost, getPost, listPosts, setLike } from "./board";
import { deskOverview } from "./desk";
import {
  createIssue,
  deleteIssue,
  getIssue,
  getPublishedIssue,
  issueReport,
  listIssues,
  listPublishedIssues,
  publishDueIssues,
  publishIssue,
  recipientCounts,
  scheduleIssue,
} from "./issues";
import { revenueOverview } from "./revenue";
import {
  changeSubscription,
  createSubscriber,
  deleteSubscriber,
  importSubscribers,
  listSubscribers,
  signUp,
  subscriberCounts,
} from "./subscribers";

const editor: BoardActor = { role: "editor", name: "윤서하" };

describe("newsletter-community store (PGlite)", () => {
  let t: TestDatabase<typeof schema>;
  const now = new Date();
  const today = seoulDateKey(now);

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, newsletterCommunity, t.workspaceId);
  });
  afterAll(() => t.close());

  it("seeds a living publication relative to today", async () => {
    const published = await listPublishedIssues(t.db, t.workspaceId);
    expect(published.map((issue) => issue.number)).toEqual(Array.from({ length: 20 }, (_, i) => 20 - i));
    expect(published[0].publishedAt!.getTime()).toBeLessThanOrEqual(now.getTime());

    const lineup = await listIssues(t.db, t.workspaceId, {}, now);
    expect(lineup[0].status).toBe("scheduled");
    expect(lineup.filter((issue) => issue.status === "draft")).toHaveLength(2);
    const sent = lineup.filter((issue) => issue.status === "published");
    expect(sent.every((issue) => issue.recipients > 0 && issue.opens <= issue.recipients)).toBe(true);

    const counts = await subscriberCounts(t.db, t.workspaceId);
    expect(counts.total).toBe(220);
    expect(counts.byTier.basic + counts.byTier.pro).toBeGreaterThan(30);
  });

  it("computes revenue from rows", async () => {
    const overview = await revenueOverview(t.db, t.workspaceId, today);
    expect(overview.series).toHaveLength(6);
    expect(overview.mrr).toBeGreaterThan(0);
    // This month's subscription income also bills people who left during the month.
    expect(overview.series[5].subscription).toBeGreaterThanOrEqual(overview.mrr);
    expect(overview.series[5].total).toBe(
      overview.series[5].subscription + overview.series[5].sponsorship + overview.series[5].membership,
    );
    expect(overview.arpu).toBeGreaterThan(9_000);
  });

  it("publishes an issue to the matching tiers with a new number", async () => {
    const id = await createIssue(
      t.db,
      t.workspaceId,
      { title: "테스트 호", lede: "", body: "유료 구독자에게만 가는 본문입니다. 스무 글자가 넘어요.", category: "tech", audience: "paid" },
      now,
    );
    const recipients = await recipientCounts(t.db, t.workspaceId);
    const result = await publishIssue(t.db, t.workspaceId, id, now);
    expect(result).toEqual({ number: 21, recipients: recipients.paid });

    const issue = await getIssue(t.db, t.workspaceId, id);
    expect(issue?.status).toBe("published");
    const report = await issueReport(t.db, t.workspaceId, issue!, new Date(now.getTime() + 72 * 3_600_000));
    expect(report?.summary.recipients).toBe(recipients.paid);
    expect(report?.recipients.every((row) => row.tier !== "free")).toBe(true);
    expect(report?.summary.opens).toBeGreaterThan(0);

    await expect(publishIssue(t.db, t.workspaceId, id, now)).rejects.toThrow("이미 발행한 호예요.");
    await expect(deleteIssue(t.db, t.workspaceId, id)).rejects.toThrow("발행한 호는 지울 수 없어요");
  });

  it("publishes due scheduled issues lazily", async () => {
    const id = await createIssue(
      t.db,
      t.workspaceId,
      { title: "예약 테스트", lede: "", body: "예약 발행을 확인하는 본문입니다. 충분히 길게 씁니다.", category: "business", audience: "everyone" },
      now,
    );
    await scheduleIssue(t.db, t.workspaceId, id, new Date(now.getTime() + 10 * 60_000), now);
    const later = new Date(now.getTime() + 11 * 60_000);
    // The seeded scheduled issue is due next Tuesday, so only this one is published.
    expect(await publishDueIssues(t.db, t.workspaceId, later)).toBe(1);
    const issue = await getIssue(t.db, t.workspaceId, id);
    expect(issue?.status).toBe("published");
    expect(issue?.publishedAt?.getTime()).toBe(now.getTime() + 10 * 60_000);
    expect(await getPublishedIssue(t.db, t.workspaceId, issue!.number!)).not.toBeNull();
  });

  it("rejects scheduling in the past", async () => {
    const id = await createIssue(
      t.db,
      t.workspaceId,
      { title: "과거 예약", lede: "", body: "지난 시각으로 예약하면 안 되는 본문입니다.", category: "tech", audience: "everyone" },
      now,
    );
    await expect(scheduleIssue(t.db, t.workspaceId, id, new Date(now.getTime() - 60_000), now)).rejects.toThrow(
      "예약 시각은 지금보다 뒤로",
    );
  });

  it("keeps workspaces apart", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, newsletterCommunity, other);
    const [mine] = await listPublishedIssues(t.db, t.workspaceId);
    expect(await getIssue(t.db, other, mine.id)).toBeNull();
    await expect(deleteSubscriber(t.db, other, crypto.randomUUID())).rejects.toThrow("구독자를 찾지 못했어요.");
  });

  it("searches, filters and imports subscribers", async () => {
    const found = await listSubscribers(t.db, t.workspaceId, { q: "minsu.kim" }, now);
    expect(found.rows.map((row) => row.name)).toEqual(["김민수"]);
    expect(found.rows[0].lastOpenedAt === null || found.rows[0].lastOpenedAt instanceof Date).toBe(true);

    const pro = await listSubscribers(t.db, t.workspaceId, { tier: "pro", status: "active", sort: "opened" }, now);
    expect(pro.rows.every((row) => row.tier === "pro" && row.status === "active")).toBe(true);

    const parsed = parseSubscriberCsv("이름,이메일,등급\n새독자,new.reader@example.com,베이직\n김민수,minsu.kim@example.com,프로\n");
    const result = await importSubscribers(t.db, t.workspaceId, parsed.rows, today);
    expect(result).toEqual({ added: 1, skipped: 1 });

    await expect(
      createSubscriber(t.db, t.workspaceId, { name: "중복", email: "NEW.reader@example.com", tier: "free", source: "manual" }, today),
    ).rejects.toThrow("이미 명부에 있는 이메일이에요.");
  });

  it("tracks paid stints through tier and status changes", async () => {
    const created = await createSubscriber(
      t.db,
      t.workspaceId,
      { name: "전환독자", email: "convert@example.com", tier: "free", source: "manual" },
      today,
    );
    expect(created.paidSince).toBeNull();
    const upgraded = await changeSubscription(t.db, t.workspaceId, created.id, { tier: "pro" }, today);
    expect(upgraded.paidSince).toBe(today);
    const left = await changeSubscription(t.db, t.workspaceId, created.id, { status: "unsubscribed" }, today);
    expect(left.unsubscribedOn).toBe(today);
    expect(left.paidSince).toBe(today);
  });

  it("signs readers up from the public form and upgrades known emails", async () => {
    const first = await signUp(t.db, t.workspaceId, { name: "구독자", email: "Signup@Example.com", tier: "free" }, today);
    expect(first.created).toBe(true);
    const again = await signUp(t.db, t.workspaceId, { name: "구독자", email: "signup@example.com", tier: "basic" }, today);
    expect(again.created).toBe(false);
    expect(again.subscriber.tier).toBe("basic");
    expect(again.subscriber.paidSince).toBe(today);
  });

  it("runs the board: members post, comment and like once", async () => {
    const [member] = await t.db
      .select()
      .from(schema.subscribers)
      .where(and(eq(schema.subscribers.workspaceId, t.workspaceId), eq(schema.subscribers.email, "yujin.choi@example.com")));
    const actor: BoardActor = { role: "member", name: member.name, subscriberId: member.id, tier: member.tier, active: true };
    const postId = await createPost(t.db, t.workspaceId, actor, { category: "question", title: "질문", body: "본문" }, now);
    await expect(
      createPost(t.db, t.workspaceId, actor, { category: "notice", title: "공지", body: "본문" }, now),
    ).rejects.toThrow("공지는 에디터만");

    await addComment(t.db, t.workspaceId, editor, postId, "답글", now);
    expect((await setLike(t.db, t.workspaceId, actor, postId, true)).likeCount).toBe(1);
    expect((await setLike(t.db, t.workspaceId, actor, postId, true)).likeCount).toBe(1);
    expect((await setLike(t.db, t.workspaceId, editor, postId, true)).likeCount).toBe(2);

    const detail = await getPost(t.db, t.workspaceId, postId, actor);
    expect(detail?.comments).toHaveLength(1);
    expect(detail?.liked).toBe(true);

    const free: BoardActor = { ...actor, tier: "free" };
    await expect(addComment(t.db, t.workspaceId, free, postId, "무료", now)).rejects.toThrow("유료 구독자");

    const list = await listPosts(t.db, t.workspaceId, { viewer: actor });
    expect(list[0].pinned).toBe(true);
    expect(list.find((post) => post.id === postId)).toMatchObject({ commentCount: 1, likeCount: 2, liked: true });
  });

  it("assembles the desk", async () => {
    const desk = await deskOverview(t.db, t.workspaceId, editor, now, today);
    expect(desk.nextIssue?.status).toBe("scheduled");
    expect(desk.circulation).toHaveLength(26);
    expect(desk.circulation[25].total).toBeGreaterThan(desk.circulation[0].total);
    expect(desk.board.length).toBeGreaterThan(0);
  });

  it("resets to fresh demo data", async () => {
    await resetModule(t.db, newsletterCommunity, t.workspaceId);
    const counts = await subscriberCounts(t.db, t.workspaceId);
    expect(counts.total).toBe(220);
    expect(await listPublishedIssues(t.db, t.workspaceId)).toHaveLength(20);
  });
});
