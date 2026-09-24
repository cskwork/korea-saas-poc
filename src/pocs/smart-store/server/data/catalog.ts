import { and, asc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import { catalogItems, listings, type CatalogItem } from "../../db/schema";
import type { SmartStoreDb } from "../../db/types";
import { feeRateBp, type Category, type Supplier } from "../../domain/categories";
import { computeMargin, type MarginBreakdown } from "../../domain/margin";
import { containsPattern } from "./shared";

export const CATALOG_SORTS = ["margin", "profit", "price", "stock"] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export interface CatalogFilters {
  supplier?: Supplier;
  category?: Category;
  /** Minimum margin rate in percent (0–60); 0 shows everything, loss-makers included. */
  minMargin: number;
  query?: string;
  sort: CatalogSort;
}

export interface CatalogEntry extends CatalogItem {
  margin: MarginBreakdown;
  /** The seller's listing of this item, when there is one. */
  listing: { id: string; status: "selling" | "paused" } | null;
}

/** Margin of a catalogue item sold at its suggested price. */
export function catalogMargin(
  item: Pick<CatalogItem, "suggestedPrice" | "wholesalePrice" | "shippingCost" | "category">,
) {
  return computeMargin({
    price: item.suggestedPrice,
    cost: item.wholesalePrice,
    shipping: item.shippingCost,
    feeRateBp: feeRateBp(item.category),
  });
}

async function withListings(db: SmartStoreDb, workspaceId: string, items: CatalogItem[]): Promise<CatalogEntry[]> {
  const ids = items.map((item) => item.id);
  const listed = ids.length
    ? await db
        .select({ id: listings.id, catalogItemId: listings.catalogItemId, status: listings.status })
        .from(listings)
        .where(and(eq(listings.workspaceId, workspaceId), inArray(listings.catalogItemId, ids)))
        .orderBy(asc(listings.createdAt))
    : [];
  const byItem = new Map<string, { id: string; status: "selling" | "paused" }>();
  for (const row of listed) {
    if (row.catalogItemId && !byItem.has(row.catalogItemId))
      byItem.set(row.catalogItemId, { id: row.id, status: row.status });
  }
  return items.map((item) => ({ ...item, margin: catalogMargin(item), listing: byItem.get(item.id) ?? null }));
}

const SORTERS: Record<CatalogSort, (a: CatalogEntry, b: CatalogEntry) => number> = {
  margin: (a, b) => b.margin.marginRate - a.margin.marginRate,
  profit: (a, b) => b.margin.profit - a.margin.profit,
  price: (a, b) => a.wholesalePrice - b.wholesalePrice,
  stock: (a, b) => b.stock - a.stock,
};

export async function listCatalog(db: SmartStoreDb, workspaceId: string, filters: CatalogFilters) {
  const conditions: SQL[] = [eq(catalogItems.workspaceId, workspaceId)];
  if (filters.supplier) conditions.push(eq(catalogItems.supplier, filters.supplier));
  if (filters.category) conditions.push(eq(catalogItems.category, filters.category));
  const query = filters.query?.trim();
  if (query) {
    const pattern = containsPattern(query);
    conditions.push(or(ilike(catalogItems.name, pattern), ilike(catalogItems.code, pattern))!);
  }

  const items = await db
    .select()
    .from(catalogItems)
    .where(and(...conditions))
    .orderBy(asc(catalogItems.code));
  const entries = await withListings(db, workspaceId, items);
  const matching =
    filters.minMargin > 0 ? entries.filter((entry) => entry.margin.marginRate * 100 >= filters.minMargin) : entries;
  return { entries: matching.sort(SORTERS[filters.sort]), hiddenByMargin: entries.length - matching.length };
}

export async function getCatalogEntry(db: SmartStoreDb, workspaceId: string, id: string): Promise<CatalogEntry | null> {
  const [item] = await db
    .select()
    .from(catalogItems)
    .where(and(eq(catalogItems.workspaceId, workspaceId), eq(catalogItems.id, id)))
    .limit(1);
  if (!item) return null;
  const [entry] = await withListings(db, workspaceId, [item]);
  return entry;
}

/** Unlisted items with the best margins: the "worth listing next" row on the overview. */
export async function topUnlistedItems(db: SmartStoreDb, workspaceId: string, limit: number): Promise<CatalogEntry[]> {
  const items = await db.select().from(catalogItems).where(eq(catalogItems.workspaceId, workspaceId));
  const entries = await withListings(db, workspaceId, items);
  return entries
    .filter((entry) => !entry.listing && entry.margin.profit > 0)
    .sort(SORTERS.margin)
    .slice(0, limit);
}
