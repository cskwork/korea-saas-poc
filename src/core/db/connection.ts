import path from "node:path";
import { mkdirSync } from "node:fs";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

/**
 * Database connection factory.
 *
 * Two interchangeable drivers sit behind one `Database` type:
 *  - `postgres`: postgres.js against any Postgres (local docker, Neon, Vercel Postgres, RDS…)
 *  - `pglite`:   embedded Postgres (WASM) — zero-config local dev, tests, and a no-DB fallback
 *
 * This module is framework-agnostic on purpose (no `server-only`) so that
 * scripts and tests can open connections directly.
 */

export type DatabaseKind = "postgres" | "pglite";

/** Common query surface of both drivers. Use the query builder; avoid `db.execute` (result shapes differ per driver). */
export type Database<TSchema extends Record<string, unknown> = Record<string, never>> = PgDatabase<
  PgQueryResultHKT,
  TSchema
>;

export interface ConnectionOptions {
  /** postgres:// URL. When absent, PGlite is used. */
  url?: string;
  /** PGlite data directory, or `memory://`. */
  pgliteDataDir?: string;
  /** Pool size for the postgres driver. */
  poolMax?: number;
}

export interface Connection {
  readonly kind: DatabaseKind;
  /** Human readable target, safe to log (no credentials). */
  readonly target: string;
  /** A drizzle instance bound to `schema` (enables `db.query.*`). Memoized per schema object. */
  db<TSchema extends Record<string, unknown>>(schema: TSchema): Database<TSchema>;
  /** Applies SQL migrations from `/drizzle`. */
  migrate(migrationsFolder?: string): Promise<void>;
  close(): Promise<void>;
}

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/** Columns are declared in camelCase and stored in snake_case. Keep in sync with drizzle.config.ts. */
const CASING = "snake_case" as const;

export async function openConnection(options: ConnectionOptions): Promise<Connection> {
  return options.url ? openPostgres(options.url, options.poolMax ?? 5) : openPglite(options.pgliteDataDir ?? "memory://");
}

async function openPostgres(url: string, poolMax: number): Promise<Connection> {
  const [{ default: postgres }, { drizzle }, { migrate }] = await Promise.all([
    import("postgres"),
    import("drizzle-orm/postgres-js"),
    import("drizzle-orm/postgres-js/migrator"),
  ]);

  const client = postgres(url, {
    max: poolMax,
    // Transaction-mode poolers (Neon, Supavisor, PgBouncer) do not support prepared statements.
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });

  const cache = new WeakMap<object, Database<Record<string, unknown>>>();
  const bind = <TSchema extends Record<string, unknown>>(schema: TSchema) => {
    let instance = cache.get(schema);
    if (!instance) {
      instance = drizzle({ client, schema, casing: CASING }) as unknown as Database<Record<string, unknown>>;
      cache.set(schema, instance);
    }
    return instance as unknown as Database<TSchema>;
  };

  return {
    kind: "postgres",
    target: redact(url),
    db: bind,
    async migrate(migrationsFolder = MIGRATIONS_FOLDER) {
      await migrate(drizzle({ client, casing: CASING }), { migrationsFolder });
    },
    async close() {
      await client.end({ timeout: 5 });
    },
  };
}

async function openPglite(dataDir: string): Promise<Connection> {
  const [{ PGlite }, { drizzle }, { migrate }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
    import("drizzle-orm/pglite/migrator"),
  ]);

  const inMemory = dataDir.startsWith("memory://");
  const resolvedDir = inMemory ? dataDir : path.resolve(dataDir);
  if (!inMemory) mkdirSync(resolvedDir, { recursive: true });

  const client = new PGlite(resolvedDir);
  await client.waitReady;

  const cache = new WeakMap<object, Database<Record<string, unknown>>>();
  const bind = <TSchema extends Record<string, unknown>>(schema: TSchema) => {
    let instance = cache.get(schema);
    if (!instance) {
      instance = drizzle({ client, schema, casing: CASING }) as unknown as Database<Record<string, unknown>>;
      cache.set(schema, instance);
    }
    return instance as unknown as Database<TSchema>;
  };

  return {
    kind: "pglite",
    target: inMemory ? "pglite (in-memory)" : `pglite (${path.relative(process.cwd(), resolvedDir) || resolvedDir})`,
    db: bind,
    async migrate(migrationsFolder = MIGRATIONS_FOLDER) {
      await migrate(drizzle({ client, casing: CASING }), { migrationsFolder });
    },
    async close() {
      await client.close();
    },
  };
}

function redact(url: string): string {
  try {
    const parsed = new URL(url);
    return `postgres (${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname})`;
  } catch {
    return "postgres";
  }
}
