import type { Database } from "@/core/db/connection";
import type * as schema from "../db/schema";

/** The module's database handle type, used by every data function `(db, workspaceId, …)`. */
export type Db = Database<typeof schema>;

/** Postgres unique-violation, raised by either driver. */
export function isUniqueViolation(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    if ((current as { code?: unknown }).code === "23505") return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
