import { and, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { UserError } from "@/core/actions";
import type { Db } from "../db";

/**
 * Tenancy guard for ids that arrive from the client: the row must exist in this workspace.
 * Every table passed here has `id` and `workspaceId` columns.
 */
export async function assertOwned(
  db: Db,
  workspaceId: string,
  table: PgTable & { id: PgColumn; workspaceId: PgColumn },
  id: string,
  message: string,
): Promise<void> {
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.workspaceId, workspaceId)))
    .limit(1);
  if (!row) throw new UserError(message);
}

/** Same as `assertOwned`, but accepts a missing (null) reference. */
export async function assertOwnedOrNull(
  db: Db,
  workspaceId: string,
  table: PgTable & { id: PgColumn; workspaceId: PgColumn },
  id: string | null,
  message: string,
): Promise<void> {
  if (id) await assertOwned(db, workspaceId, table, id, message);
}
