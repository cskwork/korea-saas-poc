import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";
import { MODULE_SLUGS, OPEN_MODULE_SLUGS, pgSchemaName } from "./src/pocs/slugs";

/**
 * drizzle-kit configuration.
 *
 *  - Platform tables live in `public` (src/core/db/schema.ts).
 *  - Each product module owns a Postgres schema named after its slug
 *    ("smart-store" → "smart_store"), declared in src/pocs/<slug>/db/schema.ts.
 *  - Migrations (generate/migrate/check) cover the platform and the *open* modules
 *    (OPEN_MODULE_SLUGS), so a module under construction never leaks into /drizzle.
 *
 * `DRIZZLE_MODULE=<slug>` narrows push/generate to a single module (and
 * `DRIZZLE_MODULE=platform` to the platform tables), which lets several modules be
 * developed against one database without touching each other.
 * Without DATABASE_URL, commands target the local PGlite database in .data/pglite.
 */
const hasSchema = (slug: string) => existsSync(`src/pocs/${slug}/db/schema.ts`);
const pgSchemaOf = (slug: string) => pgSchemaName(slug as (typeof MODULE_SLUGS)[number]);
const shipped = OPEN_MODULE_SLUGS.filter(hasSchema);

const only = process.env.DRIZZLE_MODULE || undefined;
if (only && only !== "platform" && !hasSchema(only)) {
  throw new Error(`DRIZZLE_MODULE="${only}" has no src/pocs/${only}/db/schema.ts`);
}

function scope() {
  if (only === "platform") return { schema: ["./src/core/db/schema.ts"], schemaFilter: ["public"] };
  if (only) return { schema: [`./src/pocs/${only}/db/schema.ts`], schemaFilter: [pgSchemaOf(only)] };
  return {
    schema: ["./src/core/db/schema.ts", ...shipped.map((s) => `./src/pocs/${s}/db/schema.ts`)],
    schemaFilter: ["public", ...shipped.map(pgSchemaOf)],
  };
}

const databaseUrl = process.env.DATABASE_URL || undefined;

export default defineConfig({
  dialect: "postgresql",
  casing: "snake_case",
  out: "./drizzle",
  ...scope(),
  ...(databaseUrl
    ? { dbCredentials: { url: databaseUrl } }
    : { driver: "pglite" as const, dbCredentials: { url: process.env.PGLITE_DATA_DIR || "./.data/pglite" } }),
  strict: true,
  verbose: true,
});
