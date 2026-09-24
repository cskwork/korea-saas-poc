import type { Database } from "@/core/db/connection";
import type * as schema from "../../db/schema";

/** The module's drizzle handle. Store functions take it explicitly so tests can pass a PGlite one. */
export type Db = Database<typeof schema>;

/** Postgres unique-violation code (duplicate email, duplicate issue number…). */
export function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: unknown; cause?: { code?: unknown } } | null)?.code ??
    (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  return code === "23505";
}
