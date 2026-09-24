import { type AnyPgColumn, boolean, date, index, integer, pgSchema, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";
import { CONTENT_KINDS, LENGTHS, TONES } from "../domain/content";
import { ORDER_STATUSES } from "../domain/pipeline";
import { PLAN_IDS } from "../domain/plans";

export const s = pgSchema("ai_content_agency");

export const contentKind = s.enum("content_kind", CONTENT_KINDS);
export const tone = s.enum("tone", TONES);
export const contentLength = s.enum("content_length", LENGTHS);
export const orderStatus = s.enum("order_status", ORDER_STATUSES);
export const planId = s.enum("plan_id", PLAN_IDS);
/** Who produced a draft version: Claude, the template writer, or a person's edit. */
export const draftSource = s.enum("draft_source", ["claude", "template", "edit"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** A client's request (의뢰서) moving through 접수 → 작성중 → 검수 → 납품완료. */
export const orders = s.table(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    /** Per-workspace running number, shown as #007. */
    number: integer().notNull(),
    clientName: text().notNull(),
    industry: text().notNull(),
    contactName: text().notNull().default(""),
    contactEmail: text().notNull().default(""),
    kind: contentKind().notNull(),
    topic: text().notNull(),
    brief: text().notNull().default(""),
    keywords: text().array().notNull().default([]),
    tone: tone().notNull(),
    length: contentLength().notNull(),
    status: orderStatus().notNull().default("received"),
    dueDate: date({ mode: "string" }).notNull(),
    deliveredAt: timestamp({ withTimezone: true }),
    deliveredDraftId: uuid().references((): AnyPgColumn => drafts.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [
    uniqueIndex("orders_workspace_number_idx").on(t.workspaceId, t.number),
    index("orders_workspace_status_idx").on(t.workspaceId, t.status, t.dueDate),
  ],
);

/** Status history of an order (the stand's log). */
export const orderEvents = s.table(
  "order_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus().notNull(),
    note: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.workspaceId, t.orderId, t.createdAt)],
);

/** A piece of copy. Title and body mirror its latest version for listing and search. */
export const drafts = s.table(
  "drafts",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid().references((): AnyPgColumn => orders.id, { onDelete: "set null" }),
    kind: contentKind().notNull(),
    topic: text().notNull(),
    tone: tone().notNull(),
    length: contentLength().notNull(),
    keywords: text().array().notNull().default([]),
    title: text().notNull(),
    body: text().notNull(),
    currentVersion: integer().notNull().default(1),
    source: draftSource().notNull(),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [index("drafts_workspace_updated_idx").on(t.workspaceId, t.updatedAt), index("drafts_order_idx").on(t.orderId)],
);

/** Every version of a draft, never overwritten. */
export const draftVersions = s.table(
  "draft_versions",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    draftId: uuid()
      .notNull()
      .references(() => drafts.id, { onDelete: "cascade" }),
    version: integer().notNull(),
    title: text().notNull(),
    body: text().notNull(),
    source: draftSource().notNull(),
    note: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("draft_versions_draft_version_idx").on(t.draftId, t.version)],
);

/** Published cases, shown by industry. */
export const portfolioItems = s.table(
  "portfolio_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    industry: text().notNull(),
    kind: contentKind().notNull(),
    title: text().notNull(),
    clientLabel: text().notNull(),
    summary: text().notNull(),
    excerpt: text().notNull(),
    draftId: uuid().references(() => drafts.id, { onDelete: "set null" }),
    /** Seeded demonstration entries are labelled as samples in the UI. */
    isSample: boolean().notNull().default(false),
    publishedAt: createdAt(),
  },
  (t) => [index("portfolio_workspace_idx").on(t.workspaceId, t.industry)],
);

/** Plan selections; the latest row is the workspace's current plan. */
export const planChanges = s.table(
  "plan_changes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    plan: planId().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("plan_changes_workspace_idx").on(t.workspaceId, t.createdAt)],
);

/** Enterprise quote requests from the pricing page. */
export const inquiries = s.table("inquiries", {
  id: uuid().primaryKey().defaultRandom(),
  workspaceId: tenant(),
  companyName: text().notNull(),
  contactName: text().notNull(),
  email: text().notNull(),
  monthlyVolume: integer().notNull(),
  message: text().notNull().default(""),
  createdAt: createdAt(),
});

export type OrderRow = typeof orders.$inferSelect;
export type OrderEventRow = typeof orderEvents.$inferSelect;
export type DraftRow = typeof drafts.$inferSelect;
export type DraftVersionRow = typeof draftVersions.$inferSelect;
export type PortfolioRow = typeof portfolioItems.$inferSelect;
export type DraftSource = (typeof draftSource.enumValues)[number];
