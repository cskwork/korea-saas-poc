import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const distribution = path.dirname(require.resolve("@electric-sql/pglite"));
const pkg = JSON.parse(await readFile(path.join(distribution, "../package.json"), "utf8"));
const version = "0.5.8";
if (pkg.version !== version) throw new Error(`Update the 글품 demo assets for PGlite ${pkg.version} (expected ${version}).`);
const destination = path.join(process.cwd(), "public", "geulpum-demo-assets", version);
await mkdir(destination, { recursive: true });
for (const name of ["pglite.wasm", "initdb.wasm", "pglite.data"]) {
  await copyFile(path.join(distribution, name), path.join(destination, name));
}
const migrations = await Promise.all(["0000_platform", "0003_ai-content-agency"].map((name) => readFile(path.join(process.cwd(), "drizzle", `${name}.sql`), "utf8")));
await writeFile(path.join(destination, "schema.sql"), migrations.join("\n"));
console.log(`[글품 demo] prepared PGlite ${version} assets and the existing platform/module migrations`);
