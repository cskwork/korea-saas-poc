import { z } from "zod";
import { CATEGORIES, CONVERSION_STATUSES, LINK_STATUSES } from "../domain/catalog";
import { isDayKey } from "../domain/dates";
import { LINK_SORTS } from "./links";
import { PERIODS, type Period } from "./reports";

/** Lenient parsing of URL search params: anything invalid is dropped, never an error page. */

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const pick = <T extends z.ZodType>(schema: T, value: unknown): z.infer<T> | undefined => {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
};

export function parseLinkFilters(params: SearchParams) {
  return {
    q: pick(z.string().trim().max(80), first(params.q)) || undefined,
    programId: pick(z.uuid(), first(params.programId)),
    status: pick(z.enum(LINK_STATUSES), first(params.status)),
    category: pick(z.enum(CATEGORIES), first(params.category)),
    sort: pick(z.enum(LINK_SORTS), first(params.sort)),
  };
}

export function parseConversionFilters(params: SearchParams, months: string[]) {
  const month = pick(z.string().refine((v) => isDayKey(v) && months.includes(v)), first(params.month)) ?? months[0];
  const pages = Number(first(params.pages));
  return {
    month,
    status: pick(z.enum(CONVERSION_STATUSES), first(params.status)),
    programId: pick(z.uuid(), first(params.programId)),
    linkId: pick(z.uuid(), first(params.linkId)),
    pages: Number.isInteger(pages) && pages >= 1 && pages <= 10 ? pages : 1,
  };
}

export function parsePeriod(params: SearchParams): Period {
  const days = Number(first(params.days));
  return (PERIODS as readonly number[]).includes(days) ? (days as Period) : 30;
}

export function isUuid(value: string): boolean {
  return z.uuid().safeParse(value).success;
}

export function flag(params: SearchParams, key: string): boolean {
  return first(params[key]) === "1";
}
