import { boolean, date, index, integer, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * 스타트업 빌더스 — tables in the `niche_community` Postgres schema.
 * Every table is scoped to a workspace (the tenant); intra-module references cascade
 * so a reset can delete tables in any order.
 */
export const s = pgSchema("niche_community");

export const memberRole = s.enum("member_role", ["operator", "member"]);
export const memberTier = s.enum("member_tier", ["free", "premium"]);
export const channelAccess = s.enum("channel_access", ["open", "premium"]);
export const membershipChangeKind = s.enum("membership_change_kind", ["upgrade", "downgrade"]);
export const meetupFormat = s.enum("meetup_format", ["offline", "online"]);

const workspaceId = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const members = s.table(
  "members",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    nickname: text().notNull(),
    /** One line: what they do ("AI 스타트업 대표 · 시리즈A 준비 중"). */
    headline: text().notNull().default(""),
    bio: text().notNull().default(""),
    role: memberRole().notNull().default("member"),
    tier: memberTier().notNull().default("free"),
    joinedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    /** Start of the current premium period; null while free. */
    premiumSince: timestamp({ withTimezone: true }),
  },
  (t) => [index("nc_members_workspace_idx").on(t.workspaceId, t.joinedAt)],
);

/** One row per workspace: whose name tag the visitor is wearing (demo persona). */
export const settings = s.table("settings", {
  workspaceId: uuid()
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  actingMemberId: uuid().references(() => members.id, { onDelete: "set null" }),
  updatedAt: createdAt(),
});

export const channels = s.table(
  "channels",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    name: text().notNull(),
    description: text().notNull().default(""),
    access: channelAccess().notNull().default("open"),
    /** Key into the curated channel icon set (see components/channelIcons). */
    icon: text().notNull().default("message"),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("nc_channels_workspace_idx").on(t.workspaceId, t.position)],
);

export const posts = s.table(
  "posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    channelId: uuid()
      .notNull()
      .references(() => channels.id, { onDelete: "cascade" }),
    authorId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    title: text().notNull(),
    body: text().notNull(),
    premiumOnly: boolean().notNull().default(false),
    pinned: boolean().notNull().default(false),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [
    index("nc_posts_workspace_created_idx").on(t.workspaceId, t.createdAt),
    index("nc_posts_channel_idx").on(t.channelId),
    index("nc_posts_author_idx").on(t.authorId),
  ],
);

export const comments = s.table(
  "comments",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    postId: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    body: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("nc_comments_post_idx").on(t.postId, t.createdAt), index("nc_comments_author_idx").on(t.authorId)],
);

export const likes = s.table(
  "likes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    postId: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    memberId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("nc_likes_post_member_uq").on(t.postId, t.memberId), index("nc_likes_member_idx").on(t.memberId)],
);

/** Every tier change, for the membership ledger and churn/retention. */
export const membershipChanges = s.table(
  "membership_changes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    memberId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    kind: membershipChangeKind().notNull(),
    occurredAt: createdAt(),
  },
  (t) => [index("nc_membership_changes_workspace_idx").on(t.workspaceId, t.occurredAt)],
);

/** One row per charged premium period (simulated payments: nothing is really billed). */
export const payments = s.table(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    memberId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    amountWon: integer().notNull(),
    periodStart: date({ mode: "string" }).notNull(),
    periodEnd: date({ mode: "string" }).notNull(),
    paidAt: createdAt(),
  },
  (t) => [
    uniqueIndex("nc_payments_member_period_uq").on(t.memberId, t.periodStart),
    index("nc_payments_workspace_idx").on(t.workspaceId, t.paidAt),
  ],
);

export const meetups = s.table(
  "meetups",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    title: text().notNull(),
    description: text().notNull().default(""),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    durationMinutes: integer().notNull().default(120),
    location: text().notNull(),
    format: meetupFormat().notNull().default("offline"),
    capacity: integer().notNull(),
    access: channelAccess().notNull().default("open"),
    createdAt: createdAt(),
  },
  (t) => [index("nc_meetups_workspace_idx").on(t.workspaceId, t.startsAt)],
);

export const rsvps = s.table(
  "rsvps",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    meetupId: uuid()
      .notNull()
      .references(() => meetups.id, { onDelete: "cascade" }),
    memberId: uuid()
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("nc_rsvps_meetup_member_uq").on(t.meetupId, t.memberId), index("nc_rsvps_member_idx").on(t.memberId)],
);

export const schema = {
  s,
  memberRole,
  memberTier,
  channelAccess,
  membershipChangeKind,
  meetupFormat,
  members,
  settings,
  channels,
  posts,
  comments,
  likes,
  membershipChanges,
  payments,
  meetups,
  rsvps,
};

export type Member = typeof members.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Meetup = typeof meetups.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type MemberTier = (typeof memberTier.enumValues)[number];
export type MemberRole = (typeof memberRole.enumValues)[number];
export type ChannelAccess = (typeof channelAccess.enumValues)[number];
