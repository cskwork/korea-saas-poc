/**
 * Applies SQL migrations from /drizzle.
 *
 *   npm run db:migrate                 → DATABASE_URL, or the local PGlite database
 *   tsx scripts/migrate.ts --if-configured
 *                                      → only when DATABASE_URL is set (used by the Vercel build;
 *                                        without a database the app runs on in-memory PGlite,
 *                                        which migrates itself on boot)
 */
import nextEnv from "@next/env";
import { openConnection } from "../src/core/db/connection";

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL || undefined;

if (!url && process.argv.includes("--if-configured")) {
  console.log("[migrate] DATABASE_URL not set — skipping (the app will use PGlite).");
  process.exit(0);
}

const connection = await openConnection({
  url,
  pgliteDataDir: process.env.PGLITE_DATA_DIR || ".data/pglite",
  poolMax: 1,
});

try {
  console.log(`[migrate] applying migrations to ${connection.target}`);
  await connection.migrate();
  console.log("[migrate] done");
} catch (error) {
  console.error("[migrate] failed:", error);
  process.exitCode = 1;
} finally {
  await connection.close();
}
