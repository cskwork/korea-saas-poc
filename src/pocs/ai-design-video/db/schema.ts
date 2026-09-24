import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";
import type { BriefConcept, StoryboardCut } from "../domain/brief";

/** 크리에이트잇: orders, their revision rounds and history, AI briefs, portfolio, price sheet. */
export const s = pgSchema("ai_design_video");

export const orderType = s.enum("order_type", [
  "thumbnail",
  "banner",
  "detail_page",
  "short_form",
  "video_edit",
  "logo",
  "bundle",
]);
export const orderStatus = s.enum("order_status", ["received", "drafting", "revision", "delivered"]);
export const planKind = s.enum("plan_kind", ["single", "subscription"]);
export const briefSource = s.enum("brief_source", ["claude", "template"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const textList = () =>
  text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`);

/** The price sheet: single-order packages and monthly subscriptions. */
export const packages = s.table(
  "packages",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    kind: planKind().notNull(),
    /** What a single package produces; subscriptions cover several types and leave it empty. */
    orderType: orderType(),
    name: text().notNull(),
    price: integer().notNull(),
    unit: text().notNull(),
    summary: text().notNull(),
    includes: textList(),
    /** Revision rounds included; null means unlimited. */
    revisionLimit: integer(),
    turnaroundDays: integer().notNull(),
    featured: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.kind, t.sortOrder)],
);

export const orders = s.table(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    /** Human reference, ORD-YYYYMMDD-NNN (Seoul date of intake). */
    code: text().notNull(),
    clientName: text().notNull(),
    clientContact: text().notNull().default(""),
    type: orderType().notNull(),
    title: text().notNull(),
    brief: text().notNull().default(""),
    referenceLinks: textList(),
    packageId: uuid().references(() => packages.id, { onDelete: "set null" }),
    /** Package name and plan at intake, kept when the package is later edited or removed. */
    packageName: text().notNull(),
    plan: planKind().notNull(),
    quantity: integer().notNull().default(1),
    rush: boolean().notNull().default(false),
    /** Agreed price in won (quantity and rush surcharge included). */
    price: integer().notNull(),
    /** Fees for revision rounds beyond the allowance, in won. */
    extraFees: integer().notNull().default(0),
    revisionLimit: integer(),
    revisionsUsed: integer().notNull().default(0),
    status: orderStatus().notNull().default("received"),
    dueDate: date({ mode: "string" }).notNull(),
    tools: textList(),
    deliveredAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex().on(t.workspaceId, t.code),
    index().on(t.workspaceId, t.status, t.dueDate),
    index().on(t.workspaceId, t.deliveredAt),
  ],
);

/** A client's change request (수정 N차) against an order. */
export const revisions = s.table(
  "revisions",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    round: integer().notNull(),
    note: text().notNull(),
    extraFee: integer().notNull().default(0),
    requestedAt: createdAt(),
    resolvedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index().on(t.workspaceId, t.orderId)],
);

/** Status history of an order. */
export const orderEvents = s.table(
  "order_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatus(),
    toStatus: orderStatus().notNull(),
    note: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.orderId, t.createdAt)],
);

/** AI (or template) creative brief attached to an order: concepts, copy lines, storyboard. */
export const briefs = s.table(
  "briefs",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid()
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    source: briefSource().notNull(),
    concepts: jsonb().$type<BriefConcept[]>().notNull(),
    copyLines: jsonb().$type<string[]>().notNull(),
    storyboard: jsonb().$type<StoryboardCut[]>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.orderId, t.createdAt)],
);

export const portfolioItems = s.table(
  "portfolio_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    orderId: uuid().references(() => orders.id, { onDelete: "set null" }),
    title: text().notNull(),
    category: orderType().notNull(),
    clientLabel: text().notNull(),
    /** The main copy set on the piece, drawn inside its frame. */
    headline: text().notNull(),
    summary: text().notNull(),
    tools: textList(),
    /** Two or three hex colours of the piece. */
    palette: textList(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.category, t.createdAt)],
);

export const studioSettings = s.table("studio_settings", {
  workspaceId: uuid()
    .primaryKey()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  monthlyGoal: integer().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
