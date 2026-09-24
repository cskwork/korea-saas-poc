import type { Database } from "@/core/db/connection";
import { chargesFor } from "../domain/billing";
import { PREMIUM_PRICE_WON } from "../domain/rules";
import { addDays, seoulDateKey, seoulInstant } from "../domain/time";
import {
  schema,
  channels as channelsTable,
  comments as commentsTable,
  likes as likesTable,
  meetups as meetupsTable,
  members as membersTable,
  membershipChanges,
  payments as paymentsTable,
  posts as postsTable,
  rsvps as rsvpsTable,
  settings,
} from "./schema";
import {
  BUILD_LOG,
  BUILD_LOG_COMMENTS,
  CHANNELS,
  COMMUNITY_AGE_DAYS,
  GENERIC_COMMENTS,
  GIVEN_NAMES,
  HEADLINES,
  MEETUPS,
  PEOPLE,
  POSTS,
  SURNAMES,
  type ChannelKey,
  type PostSeed,
} from "./seed-content";

type Db = Database<typeof schema>;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const GENERATED_MEMBERS = 29;

/** Deterministic PRNG (mulberry32) so every workspace gets the same community, shifted to its "now". */
function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  const between = (min: number, max: number) => min + (max - min) * next();
  const int = (min: number, max: number) => Math.floor(between(min, max + 1));
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)];
  const sample = <T>(items: readonly T[], count: number, weight: (item: T) => number = () => 1): T[] => {
    const pool = items.map((item) => ({ item, key: next() ** (1 / Math.max(weight(item), 0.0001)) }));
    return pool
      .sort((a, b) => b.key - a.key)
      .slice(0, count)
      .map((entry) => entry.item);
  };
  return { next, between, int, pick, sample };
}

interface SeedMember {
  id: string;
  key: string;
  /** How often this member likes and comments (lurkers are the long tail). */
  activity: number;
  role: "operator" | "member";
  joinedAt: Date;
  upgradedAt: Date | null;
  downgradedAt: Date | null;
}

const wasPremiumAt = (member: SeedMember, at: Date) =>
  member.role === "operator" ||
  (member.upgradedAt !== null &&
    member.upgradedAt.getTime() <= at.getTime() &&
    (member.downgradedAt === null || member.downgradedAt.getTime() > at.getTime()));

/** Inserts the sample community for a new workspace, relative to `now`. */
export async function seedCommunity(db: Db, workspaceId: string, now: Date = new Date()): Promise<void> {
  const random = createRandom(0x5eed_0924);
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const today = seoulDateKey(now);

  /* members */
  const seedMembers: SeedMember[] = [];
  const memberRows: (typeof membersTable.$inferInsert)[] = [];
  const byKey = new Map<string, SeedMember>();

  const addMember = (
    key: string,
    row: Omit<typeof membersTable.$inferInsert, "id" | "workspaceId" | "tier" | "premiumSince" | "joinedAt">,
    joinedAt: Date,
    upgradedAt: Date | null,
    downgradedAt: Date | null,
    activity: number,
  ) => {
    const member: SeedMember = { id: crypto.randomUUID(), key, activity, role: row.role ?? "member", joinedAt, upgradedAt, downgradedAt };
    const premium = upgradedAt !== null && downgradedAt === null;
    memberRows.push({
      ...row,
      id: member.id,
      workspaceId,
      joinedAt,
      tier: member.role === "operator" || premium ? "premium" : "free",
      premiumSince: premium ? upgradedAt : null,
    });
    seedMembers.push(member);
    byKey.set(key, member);
  };

  for (const person of PEOPLE) {
    const joinedAt = ago(person.joinedDaysAgo * DAY + random.int(1, 10) * HOUR);
    const upgradedAt = person.premium ? ago(person.premium.upgradedDaysAgo * DAY + random.int(1, 8) * HOUR) : null;
    const downgradedAt =
      person.premium?.downgradedDaysAgo !== undefined ? ago(person.premium.downgradedDaysAgo * DAY + random.int(1, 8) * HOUR) : null;
    addMember(
      person.key,
      { nickname: person.nickname, headline: person.headline, bio: person.bio, role: person.role },
      joinedAt,
      upgradedAt,
      downgradedAt,
      1,
    );
  }

  const usedNames = new Set(PEOPLE.map((person) => person.nickname));
  for (let i = 0; i < GENERATED_MEMBERS; i++) {
    let nickname = "";
    do nickname = `${random.pick(SURNAMES)}${random.pick(GIVEN_NAMES)}`;
    while (usedNames.has(nickname));
    usedNames.add(nickname);
    // Skewed toward recent joins: the community is still growing.
    const joinedDaysAgo = Math.max(1, Math.round((COMMUNITY_AGE_DAYS - 4) * random.next() ** 1.5));
    const joinedAt = ago(joinedDaysAgo * DAY + random.int(0, 20) * HOUR);
    let upgradedAt: Date | null = null;
    let downgradedAt: Date | null = null;
    if (joinedDaysAgo > 6 && random.next() < 0.36) {
      const upgradedDaysAgo = random.int(2, joinedDaysAgo - 2);
      upgradedAt = ago(upgradedDaysAgo * DAY + random.int(0, 12) * HOUR);
      // Some leave within their first month, some after a few renewals.
      if (upgradedDaysAgo > 40 && random.next() < 0.4) {
        const stayedDays = random.int(12, Math.min(upgradedDaysAgo - 5, 100));
        downgradedAt = ago((upgradedDaysAgo - stayedDays) * DAY + random.int(0, 12) * HOUR);
      }
    }
    // A third of any community only reads: they never like, comment or RSVP.
    const roll = random.next();
    const activity = roll < 0.3 ? 0 : roll < 0.7 ? 0.5 : 1;
    addMember(
      `generated-${i}`,
      { nickname, headline: random.pick(HEADLINES), role: "member" },
      joinedAt,
      upgradedAt,
      downgradedAt,
      activity,
    );
  }

  await db.insert(membersTable).values(memberRows);
  const operator = byKey.get("operator");
  if (!operator) throw new Error("seed: operator missing");
  await db.insert(settings).values({ workspaceId, actingMemberId: operator.id });

  /* membership history and payments */
  const changeRows: (typeof membershipChanges.$inferInsert)[] = [];
  const paymentRows: (typeof paymentsTable.$inferInsert)[] = [];
  for (const member of seedMembers) {
    if (!member.upgradedAt) continue;
    changeRows.push({ workspaceId, memberId: member.id, kind: "upgrade", occurredAt: member.upgradedAt });
    const through = member.downgradedAt ? addDays(seoulDateKey(member.downgradedAt), -1) : today;
    if (member.downgradedAt) {
      changeRows.push({ workspaceId, memberId: member.id, kind: "downgrade", occurredAt: member.downgradedAt });
    }
    for (const charge of chargesFor(member.upgradedAt, through, now)) {
      paymentRows.push({ workspaceId, memberId: member.id, amountWon: PREMIUM_PRICE_WON, ...charge });
    }
  }
  await db.insert(membershipChanges).values(changeRows);
  await db.insert(paymentsTable).values(paymentRows);

  /* channels */
  const channelIds = new Map<ChannelKey, { id: string; premium: boolean }>();
  await db.insert(channelsTable).values(
    CHANNELS.map((channel, position) => {
      const id = crypto.randomUUID();
      channelIds.set(channel.key, { id, premium: channel.access === "premium" });
      return { id, workspaceId, name: channel.name, description: channel.description, access: channel.access, icon: channel.icon, position };
    }),
  );

  /* posts */
  const buildLogs: PostSeed[] = Array.from({ length: BUILD_LOG.weeks }, (_, index) => {
    const week = BUILD_LOG.weeks - index;
    const signups = BUILD_LOG.signups[week - 1];
    const paid = BUILD_LOG.paid[week - 1];
    const previous = week > 1 ? BUILD_LOG.signups[week - 2] : 0;
    return {
      channel: BUILD_LOG.channel,
      author: BUILD_LOG.author,
      hoursAgo: BUILD_LOG.latestHoursAgo + index * 7 * 24,
      appeal: 5 + Math.round(week * 1.2),
      title: `빌드 로그 ${week}주차: 가입 ${signups}명, 유료 ${paid}명`,
      body: `이번 주 한 일: ${BUILD_LOG.focus[week - 1]}.

숫자
- 누적 가입 ${signups}명 (지난주보다 ${signups - previous}명 증가)
- 유료 고객 ${paid}명

다음 주에는 이번 주 실험의 결과를 보고 다음 한 가지를 정하겠습니다. 피드백은 언제든 댓글로 주세요.`,
    };
  });

  interface SeedPost {
    id: string;
    seed: PostSeed;
    authorId: string;
    createdAt: Date;
    premiumOnly: boolean;
  }
  const seedPosts: SeedPost[] = [];
  const postRows: (typeof postsTable.$inferInsert)[] = [];
  for (const post of [...POSTS, ...buildLogs]) {
    const author = byKey.get(post.author);
    const channel = channelIds.get(post.channel);
    if (!author || !channel) throw new Error(`seed: unknown author/channel for "${post.title}"`);
    const createdAt = ago(post.hoursAgo * HOUR + random.int(0, 50) * 60_000);
    const id = crypto.randomUUID();
    const premiumOnly = channel.premium || Boolean(post.premiumOnly);
    seedPosts.push({ id, seed: post, authorId: author.id, createdAt, premiumOnly });
    postRows.push({
      id,
      workspaceId,
      channelId: channel.id,
      authorId: author.id,
      title: post.title,
      body: post.body,
      premiumOnly,
      pinned: Boolean(post.pinned),
      createdAt,
      updatedAt: createdAt,
    });
  }
  await db.insert(postsTable).values(postRows);

  /* comments and likes */
  const commentRows: (typeof commentsTable.$inferInsert)[] = [];
  const likeRows: (typeof likesTable.$inferInsert)[] = [];
  const latest = (at: Date) => (at.getTime() > now.getTime() - 5 * 60_000 ? ago(random.int(5, 30) * 60_000) : at);
  const minjun = byKey.get("minjun");

  for (const post of seedPosts) {
    const eligible = seedMembers.filter(
      (member) =>
        member.id !== post.authorId &&
        member.activity > 0 &&
        member.joinedAt.getTime() < post.createdAt.getTime() &&
        (!post.premiumOnly || wasPremiumAt(member, post.createdAt)),
    );
    for (const comment of post.seed.comments ?? []) {
      const author = byKey.get(comment.author);
      if (!author) continue;
      commentRows.push({
        workspaceId,
        postId: post.id,
        authorId: author.id,
        body: comment.body,
        createdAt: latest(new Date(post.createdAt.getTime() + comment.hoursAfter * HOUR)),
      });
    }
    const isBuildLog = post.seed.author === BUILD_LOG.author && post.seed.title.startsWith("빌드 로그");
    const extra = isBuildLog ? random.int(1, 3) : random.int(0, 2);
    const span = now.getTime() - post.createdAt.getTime();
    for (const author of random.sample(eligible, extra, (member) => (member.id === minjun?.id ? 6 : member.activity))) {
      commentRows.push({
        workspaceId,
        postId: post.id,
        authorId: author.id,
        body: random.pick(isBuildLog ? BUILD_LOG_COMMENTS : GENERIC_COMMENTS),
        createdAt: latest(new Date(post.createdAt.getTime() + span * random.next() ** 2)),
      });
    }
    const likeCount = Math.min(Math.round(eligible.length * 0.75), Math.round(post.seed.appeal * random.between(0.75, 1.2)));
    for (const liker of random.sample(eligible, likeCount, (member) => member.activity)) {
      likeRows.push({
        workspaceId,
        postId: post.id,
        memberId: liker.id,
        createdAt: latest(new Date(post.createdAt.getTime() + span * random.next() ** 3)),
      });
    }
  }
  await db.insert(commentsTable).values(commentRows);
  await db.insert(likesTable).values(likeRows);

  /* meetups and RSVPs */
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const daysToSaturday = (6 - weekday + 7) % 7 || 7;
  const regulars = new Set(["seoyeon", "jihoon", "minjun", "haeun", "subin", "operator"]);
  const meetupRows: (typeof meetupsTable.$inferInsert)[] = [];
  const rsvpRows: (typeof rsvpsTable.$inferInsert)[] = [];
  for (const meetup of MEETUPS) {
    const offset =
      meetup.day === "saturday" ? daysToSaturday : meetup.day === "past-saturday" ? daysToSaturday - 14 : meetup.day;
    const startsAt = seoulInstant(addDays(today, offset), meetup.time);
    const createdAt = new Date(Math.min(startsAt.getTime() - 20 * DAY, now.getTime() - DAY));
    const id = crypto.randomUUID();
    meetupRows.push({
      id,
      workspaceId,
      title: meetup.title === "월간 데모데이" ? `${Number(addDays(today, offset).slice(5, 7))}월 데모데이` : meetup.title,
      description: meetup.description,
      startsAt,
      durationMinutes: meetup.durationMinutes,
      location: meetup.location,
      format: meetup.format,
      capacity: meetup.capacity,
      access: meetup.access,
      createdAt,
    });
    const upcoming = startsAt.getTime() > now.getTime();
    const eligible = seedMembers.filter(
      (member) =>
        member.activity > 0 &&
        member.joinedAt.getTime() < createdAt.getTime() &&
        !(upcoming && member.role === "operator") &&
        (meetup.access === "open" || wasPremiumAt(member, upcoming ? now : startsAt)),
    );
    const attendees = random.sample(eligible, Math.min(meetup.going, eligible.length), (member) =>
      regulars.has(member.key) ? 5 : member.activity,
    );
    const rsvpWindowEnd = Math.min(startsAt.getTime(), now.getTime());
    for (const member of attendees) {
      rsvpRows.push({
        workspaceId,
        meetupId: id,
        memberId: member.id,
        createdAt: new Date(createdAt.getTime() + (rsvpWindowEnd - createdAt.getTime()) * random.next()),
      });
    }
  }
  await db.insert(meetupsTable).values(meetupRows);
  await db.insert(rsvpsTable).values(rsvpRows);
}
