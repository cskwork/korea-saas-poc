import { isPeriod, type Period } from "../domain/analytics";
import { isCategory, isSupplier } from "../domain/categories";
import { isOrderStatus } from "../domain/orders";
import { CATALOG_SORTS, type CatalogFilters, type CatalogSort } from "./data/catalog";
import type { ListingFilters } from "./data/listings";
import type { OrderFilters } from "./data/orders";

/**
 * URL search params → validated filters. Unknown or malformed values fall back
 * to defaults instead of failing the page.
 */
export type SearchParams = Record<string, string | string[] | undefined>;

export function param(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function text(params: SearchParams, key: string, max = 60): string | undefined {
  const value = param(params, key)?.trim();
  return value ? value.slice(0, max) : undefined;
}

function int(params: SearchParams, key: string, fallback: number, min: number, max: number): number {
  const value = Number.parseInt(param(params, key) ?? "", 10);
  return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : fallback;
}

export const MIN_MARGIN_MAX = 60;

export function catalogFilters(params: SearchParams): CatalogFilters {
  const supplier = param(params, "supplier");
  const category = param(params, "category");
  const sort = param(params, "sort");
  return {
    supplier: isSupplier(supplier) ? supplier : undefined,
    category: isCategory(category) ? category : undefined,
    minMargin: int(params, "min", 0, 0, MIN_MARGIN_MAX),
    query: text(params, "q"),
    sort: (CATALOG_SORTS as readonly string[]).includes(sort ?? "") ? (sort as CatalogSort) : "margin",
  };
}

export function listingFilters(params: SearchParams): ListingFilters {
  const status = param(params, "status");
  return {
    status: status === "selling" || status === "paused" ? status : undefined,
    query: text(params, "q"),
  };
}

export function orderFilters(params: SearchParams): OrderFilters {
  const status = param(params, "status");
  return {
    status: isOrderStatus(status) ? status : undefined,
    query: text(params, "q"),
    page: int(params, "page", 1, 1, 10_000),
  };
}

export function analyticsPeriod(params: SearchParams): Period {
  const value = int(params, "period", 30, 1, 365);
  return isPeriod(value) ? value : 30;
}
