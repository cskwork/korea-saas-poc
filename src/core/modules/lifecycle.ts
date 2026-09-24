import { and, eq, getTableColumns, is } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import type { Database } from "@/core/db/connection";
import { workspaceModules } from "@/core/db/schema";
import type { ModuleDefinition } from "./define";

/**
 * Module data lifecycle, independent of the request (pure functions of a db and a
 * workspace id) so it can be exercised directly in tests.
 */

/** Seeds the module's demo data for the workspace unless it has been seeded already. */
export async function seedModuleIfNeeded<TSchema extends Record<string, unknown>>(
  db: Database<TSchema>,
  module: ModuleDefinition<TSchema>,
  workspaceId: string,
): Promise<boolean> {
  const marker = and(eq(workspaceModules.workspaceId, workspaceId), eq(workspaceModules.moduleId, module.id));
  const existing = await db.select({ moduleId: workspaceModules.moduleId }).from(workspaceModules).where(marker).limit(1);
  if (existing.length > 0) return false;

  return db.transaction(async (tx) => {
    // Claiming the marker first makes concurrent first requests seed exactly once:
    // the loser blocks on the primary key, then sees the conflict and skips.
    const claimed = await tx
      .insert(workspaceModules)
      .values({ workspaceId, moduleId: module.id })
      .onConflictDoNothing()
      .returning({ moduleId: workspaceModules.moduleId });
    if (claimed.length === 0) return false;
    await module.seed(tx as unknown as Database<TSchema>, workspaceId);
    return true;
  });
}

/** Deletes every row the workspace owns in the module, then seeds fresh demo data. */
export async function resetModule<TSchema extends Record<string, unknown>>(
  db: Database<TSchema>,
  module: ModuleDefinition<TSchema>,
  workspaceId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const { table, workspaceIdColumn } of workspaceTables(module.schema)) {
      await tx.delete(table).where(eq(workspaceIdColumn, workspaceId));
    }
    await tx
      .delete(workspaceModules)
      .where(and(eq(workspaceModules.workspaceId, workspaceId), eq(workspaceModules.moduleId, module.id)));
  });
  await seedModuleIfNeeded(db, module, workspaceId);
}

/** Tables of a module schema that carry the tenant column (`workspaceId`). */
export function workspaceTables(schema: Record<string, unknown>) {
  return Object.values(schema).flatMap((value) => {
    if (!is(value, PgTable)) return [];
    const workspaceIdColumn = getTableColumns(value).workspaceId;
    return workspaceIdColumn ? [{ table: value, workspaceIdColumn }] : [];
  });
}
