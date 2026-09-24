import { boolean, date, index, integer, jsonb, pgSchema, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * 링크잇 (affiliate-marketing) tables, in the Postgres schema `affiliate_marketing`.
 * Money is integer won; commission rates are basis points (3.5% → 350).
 */
export const affiliateMarketingSchema = pgSchema("affiliate_marketing");

export const commissionModel = affiliateMarketingSchema.enum("commission_model", ["cps", "cpa", "cpc"]);
export const commissionType = affiliateMarketingSchema.enum("commission_type", ["percent", "fixed"]);
export const linkStatus = affiliateMarketingSchema.enum("link_status", ["active", "paused", "expired"]);
export const conversionStatus = affiliateMarketingSchema.enum("conversion_status", ["pending", "confirmed", "cancelled"]);
export const clickChannel = affiliateMarketingSchema.enum("click_channel", [
  "naver_blog",
  "tistory",
  "instagram",
  "threads",
  "x",
  "youtube",
  "kakao",
  "direct",
  "other",
]);
export const deviceKind = affiliateMarketingSchema.enum("device_kind", ["mobile", "tablet", "desktop"]);
export const articleKind = affiliateMarketingSchema.enum("article_kind", ["comparison", "ranking", "review"]);
export const contentSource = affiliateMarketingSchema.enum("content_source", ["claude", "template"]);

const workspaceId = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** Affiliate programs the workspace works with (쿠팡 파트너스, 텐핑…), with their reference terms. */
export const programs = affiliateMarketingSchema.table(
  "programs",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    name: text().notNull(),
    model: commissionModel().notNull(),
    /** Default rate for new CPS links, in basis points. */
    defaultRateBp: integer().notNull().default(0),
    /** Default payout per conversion for new CPA links, in won. */
    defaultFixedWon: integer().notNull().default(0),
    settlementCycle: text().notNull().default(""),
    minPayoutWon: integer().notNull().default(0),
    cookieWindow: text().notNull().default(""),
    bestChannels: text().notNull().default(""),
    bestCategories: text().notNull().default(""),
    notes: text().notNull().default(""),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("programs_workspace_idx").on(t.workspaceId, t.position)],
);

export const links = affiliateMarketingSchema.table(
  "links",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    programId: uuid().references(() => programs.id, { onDelete: "set null" }),
    /** Globally unique short code: `/affiliate-marketing/go/<code>`. */
    code: text().notNull(),
    productName: text().notNull(),
    category: text().notNull(),
    destinationUrl: text().notNull(),
    /** Product price for content drafts (optional). */
    priceWon: integer(),
    commissionType: commissionType().notNull().default("percent"),
    commissionRateBp: integer().notNull().default(0),
    commissionFixedWon: integer().notNull().default(0),
    status: linkStatus().notNull().default("active"),
    memo: text().notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("links_code_unique").on(t.code), index("links_workspace_idx").on(t.workspaceId, t.createdAt)],
);

/** One row per tracked redirect through `/go/<code>` (bots and link previews are not recorded). */
export const clicks = affiliateMarketingSchema.table(
  "clicks",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    linkId: uuid()
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    clickedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    channel: clickChannel().notNull(),
    /** Referrer host only (no path or query), e.g. "blog.naver.com". */
    referrerHost: text(),
    device: deviceKind().notNull(),
  },
  (t) => [
    index("clicks_workspace_time_idx").on(t.workspaceId, t.clickedAt),
    index("clicks_link_time_idx").on(t.linkId, t.clickedAt),
  ],
);

/** Orders reported by the program (entered by the marketer), with the commission they earn. */
export const conversions = affiliateMarketingSchema.table(
  "conversions",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    linkId: uuid()
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    orderedOn: date({ mode: "string" }).notNull(),
    orderAmountWon: integer().notNull(),
    commissionWon: integer().notNull(),
    /** True when the marketer typed the commission instead of computing it from the link's rate. */
    commissionOverridden: boolean().notNull().default(false),
    status: conversionStatus().notNull().default("pending"),
    channel: clickChannel(),
    note: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [
    index("conversions_workspace_day_idx").on(t.workspaceId, t.orderedOn),
    index("conversions_link_idx").on(t.linkId),
  ],
);

export interface ArticleInputItem {
  linkId: string | null;
  name: string;
  priceWon: number | null;
  rating: number | null;
  pros: string[];
  cons: string[];
  reason: string;
}

export interface ArticleInput {
  title: string;
  audience: string;
  summary: string;
  items: ArticleInputItem[];
}

/** Commerce content drafts (비교 리뷰 / 추천 리스트 / 상세 리뷰) saved to the library. */
export const articles = affiliateMarketingSchema.table(
  "articles",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    kind: articleKind().notNull(),
    title: text().notNull(),
    /** Light markdown: `## heading`, `- list`, `| table |`, paragraphs. */
    body: text().notNull(),
    input: jsonb().$type<ArticleInput>().notNull(),
    source: contentSource().notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("articles_workspace_idx").on(t.workspaceId, t.updatedAt)],
);

export interface SocialVariants {
  instagram: string;
  blog: string;
  x: string;
  threads: string;
}

/** Generated SNS post sets (one text per platform). */
export const socialPosts = affiliateMarketingSchema.table(
  "social_posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    linkId: uuid().references(() => links.id, { onDelete: "set null" }),
    productName: text().notNull(),
    variants: jsonb().$type<SocialVariants>().notNull(),
    source: contentSource().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("social_posts_workspace_idx").on(t.workspaceId, t.createdAt)],
);

/** Per-workspace preferences (one row). */
export const settings = affiliateMarketingSchema.table(
  "settings",
  {
    workspaceId: workspaceId(),
    monthlyGoalWon: integer().notNull().default(500_000),
  },
  (t) => [primaryKey({ columns: [t.workspaceId] })],
);
