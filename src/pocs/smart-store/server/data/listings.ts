import { and, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { catalogItems, listings, orders, type Listing } from "../../db/schema";
import type { SmartStoreDb } from "../../db/types";
import { SUPPLIER_LABEL, feeRateBp, type Category, type Supplier } from "../../domain/categories";
import type { ListingCopy, ListingCopyInput } from "../../domain/listing-copy";
import { computeMargin, type MarginBreakdown } from "../../domain/margin";
import { containsPattern } from "./shared";

export type ListingStatus = Listing["status"];
export type CopySource = Listing["copySource"];

export interface ListingStats {
  orders: number;
  units: number;
  revenue: number;
}

export interface ListingEntry extends Listing {
  margin: MarginBreakdown;
  stats: ListingStats;
}

export function listingMargin(listing: Pick<Listing, "price" | "cost" | "shippingCost" | "category">): MarginBreakdown {
  return computeMargin({
    price: listing.price,
    cost: listing.cost,
    shipping: listing.shippingCost,
    feeRateBp: feeRateBp(listing.category),
  });
}

const EMPTY_STATS: ListingStats = { orders: 0, units: 0, revenue: 0 };

async function statsFor(db: SmartStoreDb, workspaceId: string, ids: string[]): Promise<Map<string, ListingStats>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      listingId: orders.listingId,
      orders: sql<number>`count(*)::int`,
      units: sql<number>`coalesce(sum(${orders.quantity}), 0)::int`,
      revenue: sql<number>`coalesce(sum(${orders.quantity} * ${orders.unitPrice}), 0)::bigint`,
    })
    .from(orders)
    .where(and(eq(orders.workspaceId, workspaceId), inArray(orders.listingId, ids), ne(orders.status, "cancelled")))
    .groupBy(orders.listingId);
  return new Map(
    rows.flatMap((row) =>
      row.listingId
        ? [
            [
              row.listingId,
              { orders: Number(row.orders), units: Number(row.units), revenue: Number(row.revenue) },
            ] as const,
          ]
        : [],
    ),
  );
}

export interface ListingFilters {
  status?: ListingStatus;
  query?: string;
}

export async function listListings(
  db: SmartStoreDb,
  workspaceId: string,
  filters: ListingFilters = {},
): Promise<ListingEntry[]> {
  const conditions: SQL[] = [eq(listings.workspaceId, workspaceId)];
  if (filters.status) conditions.push(eq(listings.status, filters.status));
  const query = filters.query?.trim();
  if (query) {
    const pattern = containsPattern(query);
    conditions.push(or(ilike(listings.title, pattern), ilike(listings.originalName, pattern))!);
  }
  const rows = await db
    .select()
    .from(listings)
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt));
  const stats = await statsFor(
    db,
    workspaceId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({ ...row, margin: listingMargin(row), stats: stats.get(row.id) ?? EMPTY_STATS }));
}

export async function countListings(db: SmartStoreDb, workspaceId: string) {
  const rows = await db
    .select({ status: listings.status, count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.workspaceId, workspaceId))
    .groupBy(listings.status);
  const counts = { selling: 0, paused: 0 };
  for (const row of rows) counts[row.status] = Number(row.count);
  return counts;
}

export async function getListing(db: SmartStoreDb, workspaceId: string, id: string): Promise<ListingEntry | null> {
  const [row] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.id, id)))
    .limit(1);
  if (!row) return null;
  const stats = await statsFor(db, workspaceId, [row.id]);
  return { ...row, margin: listingMargin(row), stats: stats.get(row.id) ?? EMPTY_STATS };
}

/** Listings that can receive a test order. */
export async function sellingListings(db: SmartStoreDb, workspaceId: string) {
  return db
    .select({ id: listings.id, title: listings.title, price: listings.price })
    .from(listings)
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.status, "selling")))
    .orderBy(desc(listings.createdAt));
}

export interface NewListing {
  catalogItemId: string | null;
  originalName: string;
  category: Category;
  supplier: Supplier | null;
  cost: number;
  price: number;
  shippingCost: number;
  copy: ListingCopy;
  copySource: CopySource;
}

export async function insertListing(db: SmartStoreDb, workspaceId: string, input: NewListing): Promise<string> {
  const [row] = await db
    .insert(listings)
    .values({
      workspaceId,
      catalogItemId: input.catalogItemId,
      originalName: input.originalName,
      title: input.copy.title,
      description: input.copy.description,
      keywords: input.copy.keywords,
      hashtags: input.copy.hashtags,
      category: input.category,
      supplier: input.supplier,
      cost: input.cost,
      price: input.price,
      shippingCost: input.shippingCost,
      copySource: input.copySource,
    })
    .returning({ id: listings.id });
  return row.id;
}

/**
 * What the copywriter needs to list a catalogue item, and the item's listing
 * defaults. Null when the item is not in this workspace.
 */
export async function catalogListingDraft(db: SmartStoreDb, workspaceId: string, catalogItemId: string) {
  const [item] = await db
    .select()
    .from(catalogItems)
    .where(and(eq(catalogItems.workspaceId, workspaceId), eq(catalogItems.id, catalogItemId)))
    .limit(1);
  if (!item) return null;
  const [existing] = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.catalogItemId, item.id)))
    .limit(1);
  const copyInput: ListingCopyInput = {
    name: item.name,
    category: item.category,
    supplierLabel: SUPPLIER_LABEL[item.supplier],
    options: item.options,
    leadDays: item.leadDays,
  };
  return { item, existingListingId: existing?.id ?? null, copyInput };
}

export interface ListingUpdate {
  title?: string;
  description?: string;
  keywords?: string[];
  hashtags?: string[];
  price?: number;
  cost?: number;
  shippingCost?: number;
  status?: ListingStatus;
  copySource?: CopySource;
}

/** Updates a listing of this workspace; throws when it does not exist here. */
export async function updateListing(
  db: SmartStoreDb,
  workspaceId: string,
  id: string,
  update: ListingUpdate,
): Promise<Listing> {
  const [row] = await db
    .update(listings)
    .set({ ...update, updatedAt: new Date() })
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.id, id)))
    .returning();
  if (!row) throw new UserError("상품을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  return row;
}

export async function deleteListing(db: SmartStoreDb, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(listings)
    .where(and(eq(listings.workspaceId, workspaceId), eq(listings.id, id)))
    .returning({ id: listings.id });
  if (deleted.length === 0) throw new UserError("상품을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
}
