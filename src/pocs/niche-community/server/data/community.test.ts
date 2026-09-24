import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { UserError } from "@/core/actions";
import { members, payments, posts, schema } from "../../db/schema";
import { parseFeedQuery } from "../../domain/inputs";
import { PREMIUM_PRICE_WON, type Viewer } from "../../domain/rules";
import { nicheCommunity } from "../../module";
import { createChannel, deleteChannel, loadChannels, moveChannel } from "./channels";
import { loadDashboard } from "./dashboard";
import { createMeetup, loadMeetup, loadMeetups, loadNextMeetup, setRsvp } from "./meetups";
import { loadDirectory, loadProfile, updateProfile } from "./members";
import { changeTier, loadMembership, settleRenewals } from "./membership";
import { addComment, countPostsToday, createPost, deleteComment, deletePost, loadFeed, loadNeighbors, loadPost, toggleLike, updatePost } from "./posts";
import { loadPersonaOptions, loadViewer, switchPersona } from "./viewer";

const feed = (params: Record<string, string> = {}) => parseFeedQuery(params);

describe("niche-community data layer", () => {
  let t: TestDatabase<typeof schema>;
  let operator: Viewer;
  let freeMember: Viewer;
  let premiumMember: Viewer;
  const now = new Date();

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, nicheCommunity, t.workspaceId);
    operator = await loadViewer(t.db, t.workspaceId);
    const all = await t.db.select().from(members).where(eq(members.workspaceId, t.workspaceId));
    const pick = (nickname: string) => {
      const member = all.find((row) => row.nickname === nickname);
      if (!member) throw new Error(`missing ${nickname}`);
      return { id: member.id, role: member.role, tier: member.tier };
    };
    freeMember = pick("윤지아");
    premiumMember = pick("박지훈");
  });
  afterAll(() => t.close());

  it("seeds a community with the operator as the default persona", async () => {
    expect(operator.role).toBe("operator");
    const channels = await loadChannels(t.db, t.workspaceId);
    expect(channels.map((channel) => channel.name)).toEqual(["자유게시판", "창업 이야기", "기술 토론", "마케팅 전략", "투자·펀딩", "멘토링"]);
    expect(channels.reduce((sum, channel) => sum + channel.postCount, 0)).toBeGreaterThan(30);
    const options = await loadPersonaOptions(t.db, t.workspaceId);
    expect(options[0].role).toBe("operator");
    expect(options.some((option) => option.tier === "free")).toBe(true);
  });

  it("switches persona only to members of the same workspace", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, nicheCommunity, other);
    const foreign = await loadViewer(t.db, other);
    await expect(switchPersona(t.db, t.workspaceId, foreign.id)).rejects.toBeInstanceOf(UserError);
    const switched = await switchPersona(t.db, t.workspaceId, freeMember.id);
    expect((await loadViewer(t.db, t.workspaceId)).id).toBe(switched.id);
    await switchPersona(t.db, t.workspaceId, operator.id);
  });

  it("gates premium-only posts for free members and keeps their bodies out of search", async () => {
    const asFree = await loadFeed(t.db, t.workspaceId, freeMember, feed({ limit: "120" }));
    const locked = asFree.items.filter((item) => item.locked);
    expect(locked.length).toBeGreaterThan(0);
    expect(locked.every((item) => item.excerpt === null && item.premiumOnly)).toBe(true);

    const asPremium = await loadFeed(t.db, t.workspaceId, premiumMember, feed({ limit: "120" }));
    expect(asPremium.items.some((item) => item.locked)).toBe(false);

    // "SKIP LOCKED" appears only in an open post; "우선매수권" only inside a premium post body.
    expect((await loadFeed(t.db, t.workspaceId, freeMember, feed({ q: "우선매수권" }))).items).toHaveLength(0);
    expect((await loadFeed(t.db, t.workspaceId, premiumMember, feed({ q: "우선매수권" }))).items).toHaveLength(1);

    const lockedPost = await loadPost(t.db, t.workspaceId, freeMember, locked[0].id);
    expect(lockedPost?.body).toBeNull();
    expect(lockedPost?.comments).toEqual([]);
  });

  it("filters, sorts and pages the feed, and finds neighbours for 발표 모드", async () => {
    const channels = await loadChannels(t.db, t.workspaceId);
    const tech = channels.find((channel) => channel.name === "기술 토론");
    const onlyTech = await loadFeed(t.db, t.workspaceId, operator, feed({ channel: tech?.id ?? "" }));
    expect(onlyTech.items.every((item) => item.channel.id === tech?.id)).toBe(true);

    const latest = await loadFeed(t.db, t.workspaceId, operator, feed());
    expect(latest.items[0].pinned).toBe(true);
    expect(latest.hasMore).toBe(true);
    expect(latest.items).toHaveLength(12);

    const popular = await loadFeed(t.db, t.workspaceId, operator, feed({ sort: "popular" }));
    const score = (item: (typeof popular.items)[number]) => item.likeCount + 2 * item.commentCount;
    expect(score(popular.items[0])).toBeGreaterThanOrEqual(score(popular.items[1]));

    const second = latest.items[1];
    const neighbors = await loadNeighbors(t.db, t.workspaceId, operator, feed(), second.id);
    expect(neighbors).toMatchObject({ index: 1, previousId: latest.items[0].id, nextId: latest.items[2].id });
  });

  it("enforces the free daily post limit and premium channels", async () => {
    const channels = await loadChannels(t.db, t.workspaceId);
    const open = channels.find((channel) => channel.access === "open");
    const premium = channels.find((channel) => channel.access === "premium");
    if (!open || !premium) throw new Error("channels missing");
    const input = { channelId: open.id, title: "오늘의 질문", body: "고객 인터뷰 질문지를 봐 주실 분?", premiumOnly: false };

    await expect(createPost(t.db, t.workspaceId, freeMember, { ...input, channelId: premium.id }, now)).rejects.toThrow(
      "프리미엄 멤버만",
    );
    const alreadyToday = await countPostsToday(t.db, t.workspaceId, freeMember.id, now);
    for (let i = alreadyToday; i < 3; i++) await createPost(t.db, t.workspaceId, freeMember, input, now);
    await expect(createPost(t.db, t.workspaceId, freeMember, input, now)).rejects.toThrow("하루 3개");

    // Premium members are unlimited; posts in premium channels are always premium-only.
    const id = await createPost(t.db, t.workspaceId, premiumMember, { ...input, channelId: premium.id }, now);
    expect((await loadPost(t.db, t.workspaceId, premiumMember, id))?.premiumOnly).toBe(true);
  });

  it("lets authors edit and delete their posts and the operator moderate", async () => {
    const channels = await loadChannels(t.db, t.workspaceId);
    const id = await createPost(
      t.db,
      t.workspaceId,
      premiumMember,
      { channelId: channels[0].id, title: "처음 제목", body: "본문입니다.", premiumOnly: false },
      now,
    );
    await expect(
      updatePost(t.db, t.workspaceId, freeMember, { id, channelId: channels[0].id, title: "남의 글", body: "수정", premiumOnly: false }, now),
    ).rejects.toThrow("내가 쓴 글만");
    await updatePost(
      t.db,
      t.workspaceId,
      premiumMember,
      { id, channelId: channels[0].id, title: "고친 제목", body: "고친 본문", premiumOnly: true },
      new Date(now.getTime() + 120_000),
    );
    const edited = await loadPost(t.db, t.workspaceId, premiumMember, id);
    expect(edited).toMatchObject({ title: "고친 제목", premiumOnly: true, edited: true });

    await expect(deletePost(t.db, t.workspaceId, freeMember, id)).rejects.toThrow();
    await deletePost(t.db, t.workspaceId, operator, id);
    expect(await loadPost(t.db, t.workspaceId, operator, id)).toBeNull();
  });

  it("toggles likes and manages comments with ownership checks", async () => {
    const { items } = await loadFeed(t.db, t.workspaceId, freeMember, feed());
    const open = items.find((item) => !item.locked);
    const locked = (await loadFeed(t.db, t.workspaceId, freeMember, feed({ limit: "120" }))).items.find((item) => item.locked);
    if (!open || !locked) throw new Error("posts missing");

    const liked = await toggleLike(t.db, t.workspaceId, freeMember, open.id);
    const unliked = await toggleLike(t.db, t.workspaceId, freeMember, open.id);
    expect(liked.liked).not.toBe(unliked.liked);
    expect(Math.abs(liked.count - unliked.count)).toBe(1);
    await expect(toggleLike(t.db, t.workspaceId, freeMember, locked.id)).rejects.toThrow("프리미엄");

    const commentId = await addComment(t.db, t.workspaceId, freeMember, open.id, "좋은 글 감사합니다");
    await expect(deleteComment(t.db, t.workspaceId, premiumMember, commentId)).rejects.toThrow("내가 쓴 댓글만");
    expect(await deleteComment(t.db, t.workspaceId, operator, commentId)).toBe(open.id);
  });

  it("lets only the operator manage channels, and deleting cascades posts", async () => {
    const input = { name: "채용", description: "초기 팀 채용 이야기", access: "open" as const, icon: "briefcase" as const };
    await expect(createChannel(t.db, t.workspaceId, freeMember, input)).rejects.toThrow("운영자");
    const id = await createChannel(t.db, t.workspaceId, operator, input);
    await expect(createChannel(t.db, t.workspaceId, operator, input)).rejects.toThrow("같은 이름");
    await moveChannel(t.db, t.workspaceId, operator, id, "up");
    const ordered = await loadChannels(t.db, t.workspaceId);
    expect(ordered.at(-2)?.id).toBe(id);

    await createPost(t.db, t.workspaceId, operator, { channelId: id, title: "채용 공고", body: "백엔드 개발자를 찾습니다", premiumOnly: false }, now);
    expect(await deleteChannel(t.db, t.workspaceId, operator, id)).toBe(1);
    expect((await t.db.select().from(posts).where(eq(posts.channelId, id))).length).toBe(0);
  });

  it("records upgrades with a payment and downgrades without one", async () => {
    const before = await loadMembership(t.db, t.workspaceId, freeMember.id, now);
    await expect(changeTier(t.db, t.workspaceId, operator, "upgrade", now)).rejects.toThrow("운영자");
    await changeTier(t.db, t.workspaceId, freeMember, "upgrade", now);
    const after = await loadMembership(t.db, t.workspaceId, freeMember.id, now);
    expect(after?.tier).toBe("premium");
    expect(after?.payments.length).toBe((before?.payments.length ?? 0) + 1);
    expect(after?.payments[0].amountWon).toBe(PREMIUM_PRICE_WON);
    expect(after?.period?.periodStart).toBe(after?.payments[0].periodStart);

    const upgraded = { ...freeMember, tier: "premium" as const };
    await expect(changeTier(t.db, t.workspaceId, upgraded, "upgrade", now)).rejects.toThrow("이미 프리미엄");
    await changeTier(t.db, t.workspaceId, upgraded, "downgrade", new Date(now.getTime() + 60_000));
    const downgraded = await loadMembership(t.db, t.workspaceId, freeMember.id, new Date(now.getTime() + 60_000));
    expect(downgraded?.tier).toBe("free");
    expect(downgraded?.payments.length).toBe(after?.payments.length);
    expect(downgraded?.changes.map((change) => change.kind).slice(0, 2)).toEqual(["downgrade", "upgrade"]);
  });

  it("settles renewals idempotently as months pass", async () => {
    const later = new Date(now.getTime() + 40 * 86_400_000);
    const first = await settleRenewals(t.db, t.workspaceId, later);
    expect(first).toBeGreaterThan(0);
    expect(await settleRenewals(t.db, t.workspaceId, later)).toBe(0);
    await t.db.delete(payments).where(and(eq(payments.workspaceId, t.workspaceId)));
  });

  it("handles meetup RSVPs with capacity, tier and time rules", async () => {
    const meetups = await loadMeetups(t.db, t.workspaceId, freeMember);
    const full = meetups.find((meetup) => meetup.access === "premium" && meetup.startsAt > now);
    const past = meetups.find((meetup) => meetup.startsAt < now);
    const next = await loadNextMeetup(t.db, t.workspaceId, freeMember, now);
    if (!full || !past || !next) throw new Error("meetups missing");

    await expect(setRsvp(t.db, t.workspaceId, freeMember, full.id, true, now)).rejects.toThrow("프리미엄");
    await expect(setRsvp(t.db, t.workspaceId, freeMember, past.id, true, now)).rejects.toThrow("이미 시작했거나");

    const date = new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);
    const id = await createMeetup(
      t.db,
      t.workspaceId,
      operator,
      { title: "작은 커피챗", description: "", date, time: "19:00", durationMinutes: 60, location: "성수", format: "offline", capacity: 2, access: "open" },
      now,
    );
    await setRsvp(t.db, t.workspaceId, freeMember, id, true, now);
    await setRsvp(t.db, t.workspaceId, premiumMember, id, true, now);
    await expect(setRsvp(t.db, t.workspaceId, operator, id, true, now)).rejects.toThrow("자리가 모두");
    await setRsvp(t.db, t.workspaceId, premiumMember, id, false, now);
    const detail = await loadMeetup(t.db, t.workspaceId, freeMember, id);
    expect(detail).toMatchObject({ going: 1, viewerGoing: true });
    expect(detail?.attendees.map((attendee) => attendee.id)).toEqual([freeMember.id]);
  });

  it("computes the dashboard from rows (MRR = premium members × price)", async () => {
    // Earlier tests changed tiers up to a minute after \`now\`.
    const data = await loadDashboard(t.db, t.workspaceId, new Date(now.getTime() + 120_000));
    const premiumRows = await t.db
      .select()
      .from(members)
      .where(and(eq(members.workspaceId, t.workspaceId), eq(members.role, "member"), eq(members.tier, "premium")));
    expect(data.summary.premium).toBe(premiumRows.length);
    expect(data.summary.mrr).toBe(premiumRows.length * PREMIUM_PRICE_WON);
    expect(data.mrr.series).toHaveLength(6);
    expect(data.mrr.series.at(-1)?.amount).toBe(premiumRows.length * PREMIUM_PRICE_WON);
    expect(data.summary.collectedThisMonth).toBeGreaterThan(0);
    expect(data.membership.series.at(-1)?.premium).toBe(premiumRows.length);
    expect(data.activity.series).toHaveLength(14);
    expect(data.cohorts.rows.every((row) => row.retained[0] === 1)).toBe(true);
    expect(data.recent.length).toBeGreaterThan(0);
  });

  it("derives profiles, badges and the directory", async () => {
    const directory = await loadDirectory(t.db, t.workspaceId, "premium", "", now);
    expect(directory.entries.every((entry) => entry.tier === "premium" && entry.role === "member")).toBe(true);
    expect(directory.counts.all).toBe(directory.counts.operator + directory.counts.premium + directory.counts.free);

    const writer = (await loadDirectory(t.db, t.workspaceId, "all", "이서연", now)).entries[0];
    const profile = await loadProfile(t.db, t.workspaceId, writer.id, now);
    expect(profile?.earned.map((badge) => badge.key)).toEqual(expect.arrayContaining(["firstPost", "writer"]));

    await expect(updateProfile(t.db, t.workspaceId, writer.id, { nickname: "박지훈", headline: "", bio: "" })).rejects.toThrow("닉네임");
    await updateProfile(t.db, t.workspaceId, writer.id, { nickname: "이서연", headline: "1인 SaaS 대표", bio: "" });
    expect((await loadProfile(t.db, t.workspaceId, writer.id, now))?.member.headline).toBe("1인 SaaS 대표");
  });

  it("keeps tenants isolated and resets to the demo data", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, nicheCommunity, other);
    const otherViewer = await loadViewer(t.db, other);
    const mine = await loadFeed(t.db, t.workspaceId, operator, feed());
    expect(await loadPost(t.db, other, otherViewer, mine.items[0].id)).toBeNull();

    await resetModule(t.db, nicheCommunity, t.workspaceId);
    const channels = await loadChannels(t.db, t.workspaceId);
    expect(channels.map((channel) => channel.name)).not.toContain("채용");
    expect((await loadViewer(t.db, t.workspaceId)).role).toBe("operator");
  });
});
