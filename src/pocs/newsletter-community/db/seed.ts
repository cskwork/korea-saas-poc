import type { Database } from "@/core/db/connection";
import { seoulDateKey } from "@/core/format";
import { addDays, monthOf, monthRange, recentMonths, seoulInstant, seoulParts } from "../domain/dates";
import { wasPaying, wasSubscribed } from "../domain/revenue";
import { simulateEngagement, unitHash } from "../domain/simulation";
import { audienceTiers, isPaidTier, type Tier } from "../domain/tiers";
import type * as schema from "./schema";
import {
  comments,
  issues,
  membershipSales,
  plans,
  postLikes,
  posts,
  publications,
  sends,
  sponsorships,
  subscribers,
} from "./schema";
import {
  BOARD_MEMBERS,
  DRAFT_ISSUES,
  EMAIL_DOMAINS,
  GIVEN_NAMES,
  PUBLISHED_ISSUES,
  SAMPLE_MEMBERSHIP_ITEMS,
  SAMPLE_PLANS,
  SAMPLE_POSTS,
  SAMPLE_PUBLICATION,
  SAMPLE_SPONSORSHIPS,
  SCHEDULED_ISSUE,
  SURNAMES,
} from "./seed-content";

type Db = Database<typeof schema>;

const GENERATED_SUBSCRIBERS = 214;
const WAITLIST_DAYS = 21;
const SEND_TIME = "07:00";
const BATCH = 500;

/** Deterministic choice from a list for a seed string. */
const pick = <T>(items: readonly T[], seed: string): T => items[Math.floor(unitHash(seed) * items.length)];

/** The most recent Tuesday 07:00 (Seoul) at or before `now`, as a date key. */
function lastSendDay(now: Date): string {
  const { date, time } = seoulParts(now);
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const back = (weekday - 2 + 7) % 7;
  const candidate = addDays(date, -back);
  return back === 0 && time < SEND_TIME ? addDays(candidate, -7) : candidate;
}

interface SeedSubscriber {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  status: "active" | "unsubscribed";
  joinedOn: string;
  paidSince: string | null;
  unsubscribedOn: string | null;
}

function buildSubscribers(today: string, launch: string): SeedSubscriber[] {
  const waitlistStart = addDays(launch, -WAITLIST_DAYS);
  const span = Math.max(1, Math.round((Date.parse(today) - Date.parse(waitlistStart)) / 86_400_000));
  const used = new Set<string>();
  const list: SeedSubscriber[] = [];

  BOARD_MEMBERS.forEach((member, i) => {
    used.add(member.email);
    const joinedOn = addDays(waitlistStart, 2 + i * 3);
    list.push({
      id: crypto.randomUUID(),
      name: member.name,
      email: member.email,
      tier: member.tier,
      status: "active",
      joinedOn,
      paidSince: launch > joinedOn ? launch : joinedOn,
      unsubscribedOn: null,
    });
  });

  for (let i = 0; i < GENERATED_SUBSCRIBERS; i++) {
    const seed = `subscriber:${i}`;
    const [surname, surnameRoman] = pick(SURNAMES, `${seed}:surname`);
    const [given, givenRoman] = pick(GIVEN_NAMES, `${seed}:given`);
    let email = `${givenRoman}.${surnameRoman}@${pick(EMAIL_DOMAINS, `${seed}:domain`)}`;
    for (let n = 2; used.has(email); n++) email = email.replace(/(\d*)@/, `${n}@`);
    used.add(email);

    // Growth accelerates: recent days are denser than early ones.
    const daysAgo = Math.floor(span * Math.pow(unitHash(`${seed}:joined`), 1.35));
    const joinedOn = addDays(today, -daysAgo);
    const paid = unitHash(`${seed}:paid`) < 0.3;
    const tier: Tier = paid ? (unitHash(`${seed}:pro`) < 0.34 ? "pro" : "basic") : "free";
    const firstPaidDay = joinedOn > launch ? joinedOn : launch;
    const paidSince = paid ? addDays(firstPaidDay, Math.floor(unitHash(`${seed}:upgrade`) * 21)) : null;
    const effectivePaidSince = paidSince && paidSince <= today ? paidSince : paid ? today : null;

    const start = effectivePaidSince ?? joinedOn;
    const leftAfter = Math.floor(unitHash(`${seed}:left`) * Math.max(1, Math.round((Date.parse(today) - Date.parse(start)) / 86_400_000)));
    const churned = unitHash(`${seed}:churn`) < (paid ? 0.08 : 0.12) && leftAfter > 6;
    list.push({
      id: crypto.randomUUID(),
      name: `${surname}${given}`,
      email,
      tier,
      status: churned ? "unsubscribed" : "active",
      joinedOn,
      paidSince: effectivePaidSince,
      unsubscribedOn: churned ? addDays(start, leftAfter) : null,
    });
  }
  return list;
}

async function insertInBatches<T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += BATCH) await insert(rows.slice(i, i + BATCH));
}

export async function seed(db: Db, workspaceId: string): Promise<void> {
  const now = new Date();
  const today = seoulDateKey(now);
  const newestSendDay = lastSendDay(now);
  const sendDays = PUBLISHED_ISSUES.map((_, i) => addDays(newestSendDay, -7 * (PUBLISHED_ISSUES.length - 1 - i)));
  const launch = sendDays[0];

  await db.insert(publications).values({ workspaceId, ...SAMPLE_PUBLICATION });
  await db.insert(plans).values(SAMPLE_PLANS.map((plan) => ({ workspaceId, ...plan })));

  const people = buildSubscribers(today, launch);
  await insertInBatches(people, (batch) =>
    db.insert(subscribers).values(
      batch.map((person) => ({
        workspaceId,
        ...person,
        source: unitHash(`${person.email}:source`) < 0.85 ? ("signup" as const) : ("manual" as const),
        createdAt: seoulInstant(person.joinedOn, "12:00"),
      })),
    ),
  );

  // Published issues and their sends: recipients are the people subscribed (and, for paid issues, paying) that morning.
  const published = PUBLISHED_ISSUES.map((content, i) => ({
    id: crypto.randomUUID(),
    number: i + 1,
    day: sendDays[i],
    publishedAt: seoulInstant(sendDays[i], SEND_TIME),
    content,
  }));
  await db.insert(issues).values(
    published.map(({ id, number, publishedAt, content }) => ({
      id,
      workspaceId,
      number,
      ...content,
      status: "published" as const,
      publishedAt,
      createdAt: new Date(publishedAt.getTime() - 5 * 86_400_000),
      updatedAt: publishedAt,
    })),
  );

  const sendRows = published.flatMap(({ id, day, publishedAt, content }) => {
    const tiers = audienceTiers(content.audience);
    return people
      .filter((person) => wasSubscribed(person, day) && tiers.includes(person.tier))
      .filter((person) => content.audience === "everyone" || wasPaying(person, day))
      .map((person) => ({
        workspaceId,
        issueId: id,
        subscriberId: person.id,
        email: person.email,
        tier: person.tier,
        sentAt: publishedAt,
        ...simulateEngagement({ issueId: id, recipientKey: person.id, tier: person.tier, sentAt: publishedAt }),
      }));
  });
  await insertInBatches(sendRows, (batch) => db.insert(sends).values(batch));

  const scheduledId = crypto.randomUUID();
  const nextSendDay = addDays(newestSendDay, 7);
  await db.insert(issues).values([
    {
      id: scheduledId,
      workspaceId,
      ...SCHEDULED_ISSUE,
      status: "scheduled",
      scheduledAt: seoulInstant(nextSendDay, SEND_TIME),
      createdAt: new Date(now.getTime() - 2 * 86_400_000),
      updatedAt: new Date(now.getTime() - 5 * 3_600_000),
    },
    ...DRAFT_ISSUES.map((content, i) => ({
      workspaceId,
      ...content,
      status: "draft" as const,
      createdAt: new Date(now.getTime() - (4 + i * 3) * 86_400_000),
      updatedAt: new Date(now.getTime() - (20 + i * 30) * 3_600_000),
    })),
  ]);

  // Sponsorships: settled and booked deals run in an issue of their month; the first booked one in the scheduled issue.
  const months = recentMonths(today, 6);
  const nextMonth = monthOf(addDays(monthRange(today.slice(0, 7)).end, 1));
  const placed = new Set<string>();
  const placement = (deal: (typeof SAMPLE_SPONSORSHIPS)[number], month: string) => {
    if (deal.status === "proposed") return null;
    if (deal.status === "booked" && deal.month === 0 && !placed.has(scheduledId)) return { id: scheduledId, day: nextSendDay };
    const issue = published.find((p) => p.day.startsWith(month) && !placed.has(p.id));
    return issue ? { id: issue.id, day: issue.day } : null;
  };
  await db.insert(sponsorships).values(
    SAMPLE_SPONSORSHIPS.map((deal, i) => {
      const month = deal.month >= 0 ? months[months.length - 1 - deal.month] : nextMonth;
      const issue = placement(deal, month);
      if (issue) placed.add(issue.id);
      const runOn = issue?.day ?? `${month}-${String(8 + i).padStart(2, "0")}`;
      return { workspaceId, ...deal, runOn, issueId: issue?.id ?? null, createdAt: seoulInstant(addDays(runOn, -14), "10:00") };
    }),
  );

  // Membership sales: a few per month after launch, bought by paying members.
  const payers = people.filter((person) => isPaidTier(person.tier));
  const sales = months.slice(1).flatMap((month, m) => {
    const { start, end } = monthRange(month);
    const count = 2 + Math.floor(unitHash(`sales:${m}`) * 4);
    return Array.from({ length: count }, (_, i) => {
      const item = pick(SAMPLE_MEMBERSHIP_ITEMS, `sale:${m}:${i}:item`);
      const buyer = pick(payers, `sale:${m}:${i}:buyer`);
      const lastDay = end < today ? end : today;
      const span = Math.max(0, Math.round((Date.parse(lastDay) - Date.parse(start)) / 86_400_000));
      const soldOn = addDays(start, Math.floor(unitHash(`sale:${m}:${i}:day`) * (span + 1)));
      return { workspaceId, ...item, buyerName: buyer.name, subscriberId: buyer.id, soldOn };
    });
  });
  await db.insert(membershipSales).values(sales.filter((sale) => sale.soldOn >= launch && sale.soldOn <= today));

  // The members' board.
  const members = people.slice(0, BOARD_MEMBERS.length);
  const author = (who: number | "editor") =>
    who === "editor"
      ? { authorName: SAMPLE_PUBLICATION.editorName, authorRole: "editor" as const, authorSubscriberId: null }
      : { authorName: members[who].name, authorRole: "member" as const, authorSubscriberId: members[who].id };
  const likers = [...new Set([...members.map((m) => m.id), ...payers.slice(0, 24).map((p) => p.id), "editor"])];

  for (const [i, post] of SAMPLE_POSTS.entries()) {
    const createdAt = new Date(now.getTime() - post.daysAgo * 86_400_000 - (i + 1) * 2_700_000);
    const [row] = await db
      .insert(posts)
      .values({
        workspaceId,
        category: post.category,
        title: post.title,
        body: post.body,
        pinned: post.pinned ?? false,
        createdAt,
        ...author(post.author),
      })
      .returning({ id: posts.id });
    if (post.comments.length > 0) {
      await db.insert(comments).values(
        post.comments.map((comment) => ({
          workspaceId,
          postId: row.id,
          body: comment.body,
          createdAt: new Date(Math.min(now.getTime() - 60_000, createdAt.getTime() + comment.hoursAfter * 3_600_000)),
          ...author(comment.author),
        })),
      );
    }
    const likeCount = Math.floor(unitHash(`likes:${i}`) * 14);
    const keys = likers.filter((key) => unitHash(`like:${i}:${key}`) < likeCount / likers.length);
    if (keys.length > 0) await db.insert(postLikes).values(keys.map((likerKey) => ({ workspaceId, postId: row.id, likerKey })));
  }
}
