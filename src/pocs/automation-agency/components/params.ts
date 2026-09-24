import { z } from "zod";

/** A route `[id]` as a uuid, or undefined (so the page can 404 instead of querying with garbage). */
export function parseId(value: string): string | undefined {
  const parsed = z.uuid().safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a search param. */
export function param(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** A search param restricted to known values. */
export function oneOf<T extends string>(params: SearchParams, key: string, values: readonly T[]): T | undefined {
  const value = param(params, key);
  return values.find((v) => v === value);
}
