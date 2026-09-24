import type { Database } from "@/core/db/connection";

/**
 * A product module: one of the POCs, packaged as a self-contained feature slice.
 *
 * The platform owns tenancy (workspaces), connections and migrations; a module
 * owns its Postgres schema, its seed data and everything under `src/pocs/<id>/`.
 */
export interface ModuleDefinition<TSchema extends Record<string, unknown>> {
  /** URL slug and stable id, e.g. "smart-store". Must match the registry entry. */
  readonly id: string;
  /** The module's drizzle schema exports (tables, enums, relations). */
  readonly schema: TSchema;
  /**
   * Inserts the demo data for a brand-new workspace. Runs once per workspace,
   * inside a transaction, the first time the workspace opens the module.
   */
  readonly seed: (db: Database<TSchema>, workspaceId: string) => Promise<void>;
}

export function defineModule<TSchema extends Record<string, unknown>>(
  definition: ModuleDefinition<TSchema>,
): ModuleDefinition<TSchema> {
  return definition;
}
