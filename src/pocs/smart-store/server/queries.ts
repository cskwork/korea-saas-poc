import "server-only";
import { cache } from "react";
import { aiStatus } from "@/core/ai";
import { getModuleContext } from "@/core/modules/context";
import type { Period } from "../domain/analytics";
import { smartStore } from "../module";
import { getAnalytics } from "./data/analytics";
import { listCalculations } from "./data/calculations";
import { getCatalogEntry, listCatalog, topUnlistedItems, type CatalogFilters } from "./data/catalog";
import { researchKeywords } from "./data/keywords";
import { countListings, getListing, listListings, sellingListings, type ListingFilters } from "./data/listings";
import { listOrders, orderStatusCounts, waitingOrders, type OrderFilters } from "./data/orders";

/**
 * Reads for the smart-store routes. Each resolves the visitor's workspace
 * (seeding sample data on the first visit) and delegates to the pure data
 * functions in ./data, which take (db, workspaceId, input).
 */
const context = cache(() => getModuleContext(smartStore));

export async function getOverview() {
  const { db, workspaceId } = await context();
  const [waiting, counts, week, picks] = await Promise.all([
    waitingOrders(db, workspaceId, 4),
    orderStatusCounts(db, workspaceId),
    getAnalytics(db, workspaceId, 7),
    topUnlistedItems(db, workspaceId, 4),
  ]);
  return { waiting, counts, week, picks };
}

export async function getCatalog(filters: CatalogFilters) {
  const { db, workspaceId } = await context();
  return listCatalog(db, workspaceId, filters);
}

export async function getCatalogItem(id: string) {
  const { db, workspaceId } = await context();
  return getCatalogEntry(db, workspaceId, id);
}

export async function getListings(filters: ListingFilters) {
  const { db, workspaceId } = await context();
  const [entries, counts] = await Promise.all([listListings(db, workspaceId, filters), countListings(db, workspaceId)]);
  return { entries, counts };
}

export async function getListingDetail(id: string) {
  const { db, workspaceId } = await context();
  return getListing(db, workspaceId, id);
}

export async function getOrders(filters: OrderFilters) {
  const { db, workspaceId } = await context();
  const [result, counts, listings] = await Promise.all([
    listOrders(db, workspaceId, filters),
    orderStatusCounts(db, workspaceId),
    sellingListings(db, workspaceId),
  ]);
  return { ...result, counts, listings };
}

/** Orders waiting for 발주 확인 — the count on the navigation. */
export async function getWaitingCount() {
  const { db, workspaceId } = await context();
  return (await orderStatusCounts(db, workspaceId)).new;
}

export async function getCalculations() {
  const { db, workspaceId } = await context();
  return listCalculations(db, workspaceId);
}

export async function getKeywordResearch(query: string) {
  const { db, workspaceId } = await context();
  return researchKeywords(db, workspaceId, query);
}

export async function getSalesAnalytics(period: Period) {
  const { db, workspaceId } = await context();
  return getAnalytics(db, workspaceId, period);
}

/** Whether listing copy will come from Claude (a key is configured) or the template. */
export function getCopywriterStatus() {
  return aiStatus().enabled ? "claude" : "template";
}
