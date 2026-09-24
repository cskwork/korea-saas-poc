import { boolean, date, index, integer, pgSchema, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * 펴냄 (newsletter-community): one solo editor's publication per workspace.
 * Every table carries `workspaceId`; intra-module references cascade or set null
 * so a workspace reset can delete tables in any order.
 */
export const newsletterCommunity = pgSchema("newsletter_community");

export const tierEnum = newsletterCommunity.enum("tier", ["free", "basic", "pro"]);
export const subscriberStatusEnum = newsletterCommunity.enum("subscriber_status", ["active", "unsubscribed"]);
export const subscriberSourceEnum = newsletterCommunity.enum("subscriber_source", ["manual", "signup", "import"]);
export const issueStatusEnum = newsletterCommunity.enum("issue_status", ["draft", "scheduled", "published"]);
export const audienceEnum = newsletterCommunity.enum("audience", ["everyone", "paid", "pro"]);
export const issueCategoryEnum = newsletterCommunity.enum("issue_category", [
  "tech",
  "business",
  "marketing",
  "design",
  "lifestyle",
]);
export const boardCategoryEnum = newsletterCommunity.enum("board_category", ["notice", "discussion", "question"]);
export const authorRoleEnum = newsletterCommunity.enum("author_role", ["editor", "member"]);
export const sponsorshipStatusEnum = newsletterCommunity.enum("sponsorship_status", ["proposed", "booked", "paid"]);

const workspaceId = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

/** The publication's masthead and goals (one row per workspace). */
export const publications = newsletterCommunity.table("publications", {
  id: uuid().primaryKey().defaultRandom(),
  workspaceId: workspaceId().unique(),
  name: text().notNull(),
  description: text().notNull(),
  editorName: text().notNull(),
  /** Default send hour (Asia/Seoul) offered when scheduling. */
  sendHour: integer().notNull().default(7),
  revenueGoal: integer().notNull(),
  paidGoal: integer().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Price and perks per tier; the plans page and MRR read these rows. */
export const plans = newsletterCommunity.table(
  "plans",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    tier: tierEnum().notNull(),
    name: text().notNull(),
    price: integer().notNull(),
    summary: text().notNull(),
    perks: text().array().notNull(),
  },
  (t) => [unique().on(t.workspaceId, t.tier)],
);

export const subscribers = newsletterCommunity.table(
  "subscribers",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    name: text().notNull(),
    email: text().notNull(),
    tier: tierEnum().notNull(),
    status: subscriberStatusEnum().notNull().default("active"),
    source: subscriberSourceEnum().notNull(),
    joinedOn: date({ mode: "string" }).notNull(),
    /** Start of the current paid stint; null for free subscribers. */
    paidSince: date({ mode: "string" }),
    unsubscribedOn: date({ mode: "string" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.workspaceId, t.email), index().on(t.workspaceId, t.joinedOn)],
);

export const issues = newsletterCommunity.table(
  "issues",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    /** 호수: assigned when the issue is published. */
    number: integer(),
    title: text().notNull(),
    /** Preheader / standfirst shown under the title and in the archive. */
    lede: text().notNull().default(""),
    body: text().notNull().default(""),
    category: issueCategoryEnum().notNull(),
    audience: audienceEnum().notNull(),
    status: issueStatusEnum().notNull().default("draft"),
    scheduledAt: timestamp({ withTimezone: true }),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.workspaceId, t.number), index().on(t.workspaceId, t.status)],
);

/** One row per recipient of a published issue. Opens/clicks are simulated sample timestamps. */
export const sends = newsletterCommunity.table(
  "sends",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    issueId: uuid()
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    subscriberId: uuid().references(() => subscribers.id, { onDelete: "set null" }),
    email: text().notNull(),
    tier: tierEnum().notNull(),
    sentAt: timestamp({ withTimezone: true }).notNull(),
    openedAt: timestamp({ withTimezone: true }),
    clickedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index().on(t.workspaceId, t.issueId), index().on(t.subscriberId)],
);

export const sponsorships = newsletterCommunity.table(
  "sponsorships",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    sponsorName: text().notNull(),
    message: text().notNull(),
    amount: integer().notNull(),
    runOn: date({ mode: "string" }).notNull(),
    status: sponsorshipStatusEnum().notNull().default("proposed"),
    issueId: uuid().references(() => issues.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.workspaceId, t.runOn)],
);

export const membershipSales = newsletterCommunity.table(
  "membership_sales",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    item: text().notNull(),
    buyerName: text().notNull(),
    amount: integer().notNull(),
    soldOn: date({ mode: "string" }).notNull(),
    subscriberId: uuid().references(() => subscribers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.workspaceId, t.soldOn)],
);

export const posts = newsletterCommunity.table(
  "posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    category: boardCategoryEnum().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    authorName: text().notNull(),
    authorRole: authorRoleEnum().notNull(),
    authorSubscriberId: uuid().references(() => subscribers.id, { onDelete: "set null" }),
    pinned: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt)],
);

export const comments = newsletterCommunity.table(
  "comments",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    postId: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    body: text().notNull(),
    authorName: text().notNull(),
    authorRole: authorRoleEnum().notNull(),
    authorSubscriberId: uuid().references(() => subscribers.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.postId)],
);

/** `likerKey` is "editor" or a subscriber id: one like per person per post. */
export const postLikes = newsletterCommunity.table(
  "post_likes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    postId: uuid()
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    likerKey: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.postId, t.likerKey)],
);
