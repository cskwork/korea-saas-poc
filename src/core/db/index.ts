import "server-only";
import { env } from "@/core/env";
import { logger } from "@/core/logger";
import { openConnection, type Connection, type Database } from "./connection";
import * as platformSchema from "./schema";

export type { Database } from "./connection";
export { platformSchema };

/**
 * Process-wide connection, created lazily on first use.
 *
 * Stored on `globalThis` so dev-server hot reloads reuse one pool (and one
 * PGlite instance — two instances on the same data dir would corrupt it).
 */
const globalForDb = globalThis as typeof globalThis & { __kspConnection?: Promise<Connection> };

function resolvePgliteDir(): string {
  const { PGLITE_DATA_DIR, VERCEL, NODE_ENV } = env();
  if (PGLITE_DATA_DIR) return PGLITE_DATA_DIR;
  // Serverless file systems are read-only (and per-instance), so fall back to memory there.
  if (VERCEL || NODE_ENV === "test") return "memory://";
  return ".data/pglite";
}

async function connect(): Promise<Connection> {
  const { DATABASE_URL, DB_POOL_MAX, NODE_ENV } = env();
  const connection = await openConnection({
    url: DATABASE_URL,
    pgliteDataDir: resolvePgliteDir(),
    poolMax: DB_POOL_MAX,
  });

  // PGlite is private to this process, so it is always migrated on start.
  // A shared Postgres is migrated by `npm run db:migrate` (the Vercel build runs it),
  // except in development where auto-migrating keeps `npm run dev` one step.
  const autoMigrate = process.env.DB_AUTO_MIGRATE
    ? process.env.DB_AUTO_MIGRATE === "true"
    : connection.kind === "pglite" || NODE_ENV === "development";

  if (autoMigrate) await connection.migrate();

  if (connection.kind === "pglite" && env().VERCEL) {
    logger.warn("db", "DATABASE_URL is not set: using an in-memory PGlite database. Data is per-instance and temporary.");
  } else {
    logger.info("db", `connected to ${connection.target}`);
  }
  return connection;
}

export function getConnection(): Promise<Connection> {
  if (!globalForDb.__kspConnection) {
    globalForDb.__kspConnection = connect().catch((error: unknown) => {
      globalForDb.__kspConnection = undefined;
      throw error;
    });
  }
  return globalForDb.__kspConnection;
}

/** A drizzle instance bound to the given schema (use your module's schema for `db.query.*`). */
export async function getDb<TSchema extends Record<string, unknown> = typeof platformSchema>(
  schema?: TSchema,
): Promise<Database<TSchema>> {
  const connection = await getConnection();
  return connection.db((schema ?? platformSchema) as TSchema);
}
