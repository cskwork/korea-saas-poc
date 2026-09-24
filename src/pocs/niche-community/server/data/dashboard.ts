import "server-only";
import { and, desc, eq, gte } from "drizzle-orm";
import { channels, comments, meetups, members, membershipChanges, payments, posts, rsvps } from "../../db/schema";
import {
  activeMemberCount,
  activityByDay,
  activityHeadline,
  channelHeadline,
  cohortRetention,
  membershipByMonth,
  membershipHeadline,
  monthlyChurn,
  monthlyRecurringRevenue,
  mrrByMonth,
  mrrHeadline,
  nextMonthRetention,
  retentionHeadline,
  revenueByMonth,
  type ActivityRow,
} from "../../domain/analytics";
import { lastDayKeys, lastMonthKeys, monthStart, seoulMonthKey } from "../../domain/time";
import type { Db } from "./db";
import { loadActivityIndex } from "./members";
import { loadLedger, settleRenewals } from "./membership";

const DAY = 86_400_000;

export type RecentKind = "join" | "post" | "comment" | "upgrade" | "downgrade" | "rsvp";

export interface RecentActivity {
  kind: RecentKind;
  at: Date;
  memberId: string;
  nickname: string;
  /** Post or meetup title, when the activity has one. */
  subject: string | null;
  /** Post id or meetup id to link to. */
  targetId: string | null;
}

/** Everything the operator dashboard shows, computed from this workspace's rows. */
export async function loadDashboard(db: Db, workspaceId: string, now: Date) {
  await settleRenewals(db, workspaceId, now);
  const months = lastMonthKeys(now, 6);
  const days = lastDayKeys(now, 14);
  const since = monthStart(months[0]);

  const [memberRows, changeRows, paymentRows, postRows, commentRows, channelRows, rsvpRows, activity, ledger] =
    await Promise.all([
      db
        .select({ id: members.id, nickname: members.nickname, role: members.role, tier: members.tier, joinedAt: members.joinedAt })
        .from(members)
        .where(eq(members.workspaceId, workspaceId)),
      db
        .select({ memberId: membershipChanges.memberId, kind: membershipChanges.kind, occurredAt: membershipChanges.occurredAt })
        .from(membershipChanges)
        .where(eq(membershipChanges.workspaceId, workspaceId)),
      db
        .select({
          memberId: payments.memberId,
          amountWon: payments.amountWon,
          periodStart: payments.periodStart,
          paidAt: payments.paidAt,
        })
        .from(payments)
        .where(eq(payments.workspaceId, workspaceId)),
      db
        .select({ id: posts.id, title: posts.title, authorId: posts.authorId, channelId: posts.channelId, createdAt: posts.createdAt })
        .from(posts)
        .where(eq(posts.workspaceId, workspaceId))
        .orderBy(desc(posts.createdAt)),
      db
        .select({ authorId: comments.authorId, createdAt: comments.createdAt, postId: posts.id, postTitle: posts.title })
        .from(comments)
        .innerJoin(posts, eq(posts.id, comments.postId))
        .where(and(eq(comments.workspaceId, workspaceId), gte(comments.createdAt, since)))
        .orderBy(desc(comments.createdAt)),
      db
        .select({ id: channels.id, name: channels.name, access: channels.access, position: channels.position })
        .from(channels)
        .where(eq(channels.workspaceId, workspaceId)),
      db
        .select({ memberId: rsvps.memberId, createdAt: rsvps.createdAt, meetupId: meetups.id, title: meetups.title })
        .from(rsvps)
        .innerJoin(meetups, eq(meetups.id, rsvps.meetupId))
        .where(eq(rsvps.workspaceId, workspaceId))
        .orderBy(desc(rsvps.createdAt))
        .limit(10),
      loadActivityIndex(db, workspaceId, now),
      loadLedger(db, workspaceId, 8),
    ]);

  const regular = memberRows.filter((member) => member.role === "member");
  const premiumNow = regular.filter((member) => member.tier === "premium").length;
  const thisMonth = seoulMonthKey(now);
  const newThisMonth = regular.filter((member) => seoulMonthKey(member.joinedAt) === thisMonth).length;

  const regularIds = new Set(regular.map((member) => member.id));
  const activityRows: ActivityRow[] = [...activity.entries()]
    .filter(([memberId]) => regularIds.has(memberId))
    .flatMap(([memberId, a]) =>
      [...a.postDates, ...a.commentDates, ...a.likeGivenDates, ...a.rsvpDates].map((at) => ({ memberId, at })),
    );
  const active30 = activeMemberCount(activityRows, new Date(now.getTime() - 30 * DAY));
  const active7 = activeMemberCount(activityRows, new Date(now.getTime() - 7 * DAY));

  const collected = revenueByMonth(paymentRows, months);
  const membership = membershipByMonth(memberRows, changeRows, months, now);
  const mrr = mrrByMonth(membership);
  const daily = activityByDay(
    postRows.map((row) => row.createdAt),
    commentRows.map((row) => row.createdAt),
    days,
  );
  const cohorts = cohortRetention(paymentRows, months);
  const retention = nextMonthRetention(cohorts);
  const churn = monthlyChurn(memberRows, changeRows, now);

  const monthAgo = now.getTime() - 30 * DAY;
  const channelActivity = channelRows
    .sort((a, b) => a.position - b.position)
    .map((channel) => ({
      ...channel,
      posts: postRows.filter((post) => post.channelId === channel.id && post.createdAt.getTime() >= monthAgo).length,
    }));

  const nickname = new Map(memberRows.map((member) => [member.id, member.nickname]));
  const recent: RecentActivity[] = [
    ...memberRows.map((member) => ({
      kind: "join" as const,
      at: member.joinedAt,
      memberId: member.id,
      nickname: member.nickname,
      subject: null,
      targetId: null,
    })),
    ...postRows.slice(0, 10).map((post) => ({
      kind: "post" as const,
      at: post.createdAt,
      memberId: post.authorId,
      nickname: nickname.get(post.authorId) ?? "",
      subject: post.title,
      targetId: post.id,
    })),
    ...commentRows.slice(0, 10).map((comment) => ({
      kind: "comment" as const,
      at: comment.createdAt,
      memberId: comment.authorId,
      nickname: nickname.get(comment.authorId) ?? "",
      subject: comment.postTitle,
      targetId: comment.postId,
    })),
    ...ledger.changes.map((change) => ({
      kind: change.kind,
      at: change.at,
      memberId: change.memberId,
      nickname: change.nickname,
      subject: null,
      targetId: null,
    })),
    ...rsvpRows.map((rsvp) => ({
      kind: "rsvp" as const,
      at: rsvp.createdAt,
      memberId: rsvp.memberId,
      nickname: nickname.get(rsvp.memberId) ?? "",
      subject: rsvp.title,
      targetId: rsvp.meetupId,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return {
    summary: {
      members: regular.length,
      premium: premiumNow,
      free: regular.length - premiumNow,
      newThisMonth,
      mrr: monthlyRecurringRevenue(premiumNow),
      collectedThisMonth: collected.at(-1)?.amount ?? 0,
      paymentsThisMonth: paymentRows.filter((payment) => seoulMonthKey(payment.paidAt) === thisMonth).length,
      active7,
      active30,
      activeRate: regular.length ? active30 / regular.length : 0,
      churn,
      retention,
    },
    mrr: { series: mrr, headline: mrrHeadline(mrr) },
    membership: { series: membership, headline: membershipHeadline(membership.at(-1), newThisMonth) },
    activity: { series: daily, headline: activityHeadline(daily) },
    cohorts: { rows: cohorts, months, headline: retentionHeadline(retention) },
    channels: { rows: channelActivity, headline: channelHeadline(channelActivity, 30) },
    recent,
    ledger,
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>;
