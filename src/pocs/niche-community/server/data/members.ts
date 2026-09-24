import "server-only";
import { and, asc, eq, lte, ne } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { comments, likes, meetups, members, posts, rsvps } from "../../db/schema";
import { evaluateBadges, earnedBadges, nextBadge, type BadgeStatus } from "../../domain/badges";
import type { ProfileInput } from "../../domain/inputs";
import type { Role, Tier } from "../../domain/rules";
import type { Db } from "./db";

export interface MemberActivity {
  postDates: Date[];
  commentDates: Date[];
  likeReceivedDates: Date[];
  likeGivenDates: Date[];
  attendedMeetupDates: Date[];
  rsvpDates: Date[];
}

const emptyActivity = (): MemberActivity => ({
  postDates: [],
  commentDates: [],
  likeReceivedDates: [],
  likeGivenDates: [],
  attendedMeetupDates: [],
  rsvpDates: [],
});

/** Every member's activity timestamps in one pass (badges, "last active", active-member counts). */
export async function loadActivityIndex(db: Db, workspaceId: string, now: Date): Promise<Map<string, MemberActivity>> {
  const [postRows, commentRows, likeRows, rsvpRows] = await Promise.all([
    db.select({ memberId: posts.authorId, at: posts.createdAt }).from(posts).where(eq(posts.workspaceId, workspaceId)),
    db.select({ memberId: comments.authorId, at: comments.createdAt }).from(comments).where(eq(comments.workspaceId, workspaceId)),
    db
      .select({ giverId: likes.memberId, receiverId: posts.authorId, at: likes.createdAt })
      .from(likes)
      .innerJoin(posts, eq(posts.id, likes.postId))
      .where(eq(likes.workspaceId, workspaceId)),
    db
      .select({ memberId: rsvps.memberId, at: rsvps.createdAt, startsAt: meetups.startsAt })
      .from(rsvps)
      .innerJoin(meetups, eq(meetups.id, rsvps.meetupId))
      .where(eq(rsvps.workspaceId, workspaceId)),
  ]);
  const index = new Map<string, MemberActivity>();
  const of = (memberId: string) => {
    let activity = index.get(memberId);
    if (!activity) index.set(memberId, (activity = emptyActivity()));
    return activity;
  };
  for (const row of postRows) of(row.memberId).postDates.push(row.at);
  for (const row of commentRows) of(row.memberId).commentDates.push(row.at);
  for (const row of likeRows) {
    of(row.receiverId).likeReceivedDates.push(row.at);
    of(row.giverId).likeGivenDates.push(row.at);
  }
  for (const row of rsvpRows) {
    of(row.memberId).rsvpDates.push(row.at);
    if (row.startsAt.getTime() <= now.getTime()) of(row.memberId).attendedMeetupDates.push(row.startsAt);
  }
  return index;
}

export function lastActiveAt(activity: MemberActivity | undefined): Date | null {
  if (!activity) return null;
  const all = [...activity.postDates, ...activity.commentDates, ...activity.likeGivenDates, ...activity.rsvpDates];
  return all.length ? new Date(Math.max(...all.map((date) => date.getTime()))) : null;
}

async function communityOpenedAt(db: Db, workspaceId: string): Promise<Date> {
  const [first] = await db
    .select({ joinedAt: members.joinedAt })
    .from(members)
    .where(eq(members.workspaceId, workspaceId))
    .orderBy(asc(members.joinedAt))
    .limit(1);
  return first?.joinedAt ?? new Date();
}

function badgesFor(
  member: { role: Role; tier: Tier; joinedAt: Date; premiumSince: Date | null },
  activity: MemberActivity | undefined,
  openedAt: Date,
): BadgeStatus[] {
  const a = activity ?? emptyActivity();
  return evaluateBadges({
    role: member.role,
    tier: member.tier,
    joinedAt: member.joinedAt,
    premiumSince: member.premiumSince,
    communityOpenedAt: openedAt,
    postDates: a.postDates,
    commentDates: a.commentDates,
    likeReceivedDates: a.likeReceivedDates,
    attendedMeetupDates: a.attendedMeetupDates,
  });
}

export type DirectoryFilter = "all" | "premium" | "free" | "operator";

export interface DirectoryEntry {
  id: string;
  nickname: string;
  headline: string;
  role: Role;
  tier: Tier;
  joinedAt: Date;
  postCount: number;
  commentCount: number;
  badgeCount: number;
  lastActiveAt: Date | null;
}

export async function loadDirectory(
  db: Db,
  workspaceId: string,
  filter: DirectoryFilter,
  search: string,
  now: Date,
): Promise<{ entries: DirectoryEntry[]; counts: Record<DirectoryFilter, number> }> {
  const [rows, activity, openedAt] = await Promise.all([
    db
      .select({
        id: members.id,
        nickname: members.nickname,
        headline: members.headline,
        role: members.role,
        tier: members.tier,
        joinedAt: members.joinedAt,
        premiumSince: members.premiumSince,
      })
      .from(members)
      .where(and(eq(members.workspaceId, workspaceId), lte(members.joinedAt, now)))
      .orderBy(asc(members.joinedAt)),
    loadActivityIndex(db, workspaceId, now),
    communityOpenedAt(db, workspaceId),
  ]);
  const counts: Record<DirectoryFilter, number> = {
    all: rows.length,
    operator: rows.filter((row) => row.role === "operator").length,
    premium: rows.filter((row) => row.role === "member" && row.tier === "premium").length,
    free: rows.filter((row) => row.role === "member" && row.tier === "free").length,
  };
  const term = search.trim().toLowerCase();
  const entries = rows
    .filter((row) => {
      if (filter === "operator" && row.role !== "operator") return false;
      if ((filter === "premium" || filter === "free") && (row.role !== "member" || row.tier !== filter)) return false;
      return !term || row.nickname.toLowerCase().includes(term) || row.headline.toLowerCase().includes(term);
    })
    .map((row) => {
      const a = activity.get(row.id);
      return {
        id: row.id,
        nickname: row.nickname,
        headline: row.headline,
        role: row.role,
        tier: row.tier,
        joinedAt: row.joinedAt,
        postCount: a?.postDates.length ?? 0,
        commentCount: a?.commentDates.length ?? 0,
        badgeCount: earnedBadges(badgesFor(row, a, openedAt)).length,
        lastActiveAt: lastActiveAt(a),
      };
    })
    .sort((a, b) => (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0));
  return { entries, counts };
}

export async function loadProfile(db: Db, workspaceId: string, memberId: string, now: Date) {
  const [member] = await db
    .select({
      id: members.id,
      nickname: members.nickname,
      headline: members.headline,
      bio: members.bio,
      role: members.role,
      tier: members.tier,
      joinedAt: members.joinedAt,
      premiumSince: members.premiumSince,
    })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.workspaceId, workspaceId)))
    .limit(1);
  if (!member) return null;
  const [activity, openedAt] = await Promise.all([loadActivityIndex(db, workspaceId, now), communityOpenedAt(db, workspaceId)]);
  const a = activity.get(member.id);
  const badges = badgesFor(member, a, openedAt);
  return {
    member,
    badges,
    earned: earnedBadges(badges),
    next: nextBadge(badges),
    stats: {
      posts: a?.postDates.length ?? 0,
      comments: a?.commentDates.length ?? 0,
      likesReceived: a?.likeReceivedDates.length ?? 0,
      meetups: a?.attendedMeetupDates.length ?? 0,
    },
    lastActiveAt: lastActiveAt(a),
  };
}

export async function updateProfile(db: Db, workspaceId: string, memberId: string, input: ProfileInput) {
  const [taken] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.workspaceId, workspaceId), eq(members.nickname, input.nickname), ne(members.id, memberId)))
    .limit(1);
  if (taken) throw new UserError("다른 멤버가 쓰고 있는 닉네임이에요.");
  await db
    .update(members)
    .set(input)
    .where(and(eq(members.id, memberId), eq(members.workspaceId, workspaceId)));
}
