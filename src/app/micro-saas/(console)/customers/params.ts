import type { CustomerSort } from "@/pocs/micro-saas/server/store/customers";

type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** ?q=&sort= for the customer list. */
export function readListParams(params: SearchParams): { query: string; sort: CustomerSort } {
  const sort = one(params.sort);
  return {
    query: one(params.q).slice(0, 40),
    sort: sort === "recent" || sort === "name" ? sort : "visits",
  };
}
