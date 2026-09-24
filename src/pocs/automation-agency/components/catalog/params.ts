import { INDUSTRIES, PACKAGE_KINDS } from "../../domain/labels";
import type { CatalogFilter } from "../../server/data/catalog";
import { oneOf, param, type SearchParams } from "../params";

export function parseCatalogFilter(params: SearchParams): CatalogFilter {
  return {
    industry: oneOf(params, "industry", INDUSTRIES),
    kind: oneOf(params, "kind", PACKAGE_KINDS),
    q: param(params, "q")?.slice(0, 60) || undefined,
    sort: oneOf(params, "sort", ["popular", "savings", "price"] as const),
    includeArchived: param(params, "archived") === "1",
  };
}
