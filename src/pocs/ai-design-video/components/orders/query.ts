import { isOrderStatus, isOrderType } from "../../domain/catalog";
import type { OrdersQuery } from "./OrdersView";

type Params = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Untrusted URL parameters → a valid orders query (unknown values are ignored). */
export function parseOrdersQuery(params: Params): OrdersQuery {
  const status = first(params.status);
  const type = first(params.type);
  const sort = first(params.sort);
  const q = first(params.q)?.trim().slice(0, 50);
  return {
    status: status === "open" || (status && isOrderStatus(status)) ? (status as OrdersQuery["status"]) : undefined,
    type: type && isOrderType(type) ? type : undefined,
    q: q || undefined,
    sort: sort === "recent" || sort === "amount" ? sort : "due",
  };
}
