import { boolean, index, integer, pgSchema, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";
import { CATEGORIES, SUPPLIERS } from "../domain/categories";
import { COMPETITION_LEVELS, TRENDS } from "../domain/keywords";
import { ORDER_STATUSES } from "../domain/orders";

/**
 * 스마트셀러 tables (Postgres schema `smart_store`). Every row belongs to a
 * workspace; money is integer won.
 */
export const s = pgSchema("smart_store");

export const categoryEnum = s.enum("category", CATEGORIES);
export const supplierEnum = s.enum("supplier", SUPPLIERS);
export const listingStatusEnum = s.enum("listing_status", ["selling", "paused"]);
export const copySourceEnum = s.enum("copy_source", ["claude", "template", "manual"]);
export const orderStatusEnum = s.enum("order_status", ORDER_STATUSES);
export const competitionEnum = s.enum("competition", COMPETITION_LEVELS);
export const trendEnum = s.enum("trend", TRENDS);

const workspaceId = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

/** Wholesale catalogue (도매매/도매꾹 items the seller can source). */
export const catalogItems = s.table(
  "catalog_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    /** Wholesaler's item code, e.g. "DMM-104221". */
    code: text().notNull(),
    name: text().notNull(),
    category: categoryEnum().notNull(),
    supplier: supplierEnum().notNull(),
    wholesalePrice: integer().notNull(),
    suggestedPrice: integer().notNull(),
    /** What the wholesaler charges the seller to ship one parcel. */
    shippingCost: integer().notNull(),
    options: text(),
    /** Business days until the wholesaler ships. */
    leadDays: integer().notNull().default(2),
    stock: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.workspaceId, t.code), index().on(t.workspaceId, t.category)],
);

/** Products the seller has listed on their SmartStore. */
export const listings = s.table(
  "listings",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    catalogItemId: uuid().references(() => catalogItems.id, { onDelete: "set null" }),
    originalName: text().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    keywords: text().array().notNull(),
    hashtags: text().array().notNull(),
    category: categoryEnum().notNull(),
    supplier: supplierEnum(),
    cost: integer().notNull(),
    price: integer().notNull(),
    shippingCost: integer().notNull(),
    status: listingStatusEnum().notNull().default("selling"),
    copySource: copySourceEnum().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt), index().on(t.catalogItemId)],
);

/** SmartStore orders. Product and money fields are snapshots taken at order time. */
export const orders = s.table(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    orderNo: text().notNull(),
    listingId: uuid().references(() => listings.id, { onDelete: "set null" }),
    productName: text().notNull(),
    category: categoryEnum().notNull(),
    customerName: text().notNull(),
    region: text().notNull(),
    quantity: integer().notNull(),
    unitPrice: integer().notNull(),
    unitCost: integer().notNull(),
    shippingCost: integer().notNull(),
    feeRateBp: integer().notNull(),
    status: orderStatusEnum().notNull().default("new"),
    courier: text(),
    trackingNumber: text(),
    /** Created with "테스트 주문" rather than seeded. */
    isTest: boolean().notNull().default(false),
    orderedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp({ withTimezone: true }),
    shippedAt: timestamp({ withTimezone: true }),
    deliveredAt: timestamp({ withTimezone: true }),
    cancelledAt: timestamp({ withTimezone: true }),
  },
  (t) => [
    unique().on(t.workspaceId, t.orderNo),
    index().on(t.workspaceId, t.orderedAt),
    index().on(t.workspaceId, t.status),
    index().on(t.listingId),
  ],
);

/** Saved margin calculations (results are recomputed from the inputs). */
export const calculations = s.table(
  "calculations",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    label: text().notNull(),
    category: categoryEnum().notNull(),
    cost: integer().notNull(),
    price: integer().notNull(),
    shippingCost: integer().notNull(),
    monthlyQuantity: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt)],
);

/** Sample keyword metrics the research screen searches. */
export const keywordStats = s.table(
  "keyword_stats",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    keyword: text().notNull(),
    /** The head keyword this one is related to (itself for a head keyword). */
    headKeyword: text().notNull(),
    category: categoryEnum().notNull(),
    monthlyVolume: integer().notNull(),
    competition: competitionEnum().notNull(),
    trend: trendEnum().notNull(),
  },
  (t) => [unique().on(t.workspaceId, t.keyword), index().on(t.workspaceId, t.headKeyword)],
);

export const savedKeywords = s.table(
  "saved_keywords",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: workspaceId(),
    keyword: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.workspaceId, t.keyword)],
);

export type CatalogItem = typeof catalogItems.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Calculation = typeof calculations.$inferSelect;
export type KeywordStat = typeof keywordStats.$inferSelect;
export type SavedKeyword = typeof savedKeywords.$inferSelect;
