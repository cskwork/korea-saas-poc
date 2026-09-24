import "server-only";
import { getDb, type Database } from "@/core/db";
import { ensureWorkspace } from "@/core/workspace";
import type { ModuleDefinition } from "./define";
import { resetModule, seedModuleIfNeeded } from "./lifecycle";

export interface ModuleContext<TSchema extends Record<string, unknown>> {
  db: Database<TSchema>;
  workspaceId: string;
}

/**
 * Entry point for every module query and action: resolves the tenant
 * (workspace) and seeds the module's demo data on its first visit.
 *
 * ```ts
 * const { db, workspaceId } = await getModuleContext(smartStore);
 * return db.select().from(products).where(eq(products.workspaceId, workspaceId));
 * ```
 */
export async function getModuleContext<TSchema extends Record<string, unknown>>(
  module: ModuleDefinition<TSchema>,
): Promise<ModuleContext<TSchema>> {
  const workspaceId = await ensureWorkspace();
  const db = await getDb(module.schema);
  await seedModuleIfNeeded(db, module, workspaceId);
  return { db, workspaceId };
}

/** Restores the current workspace's demo data for the module ("데모 데이터 초기화"). */
export async function resetModuleData<TSchema extends Record<string, unknown>>(module: ModuleDefinition<TSchema>) {
  const workspaceId = await ensureWorkspace();
  const db = await getDb(module.schema);
  await resetModule(db, module, workspaceId);
}
