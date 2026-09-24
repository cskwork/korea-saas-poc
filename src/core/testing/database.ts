import { sql } from "drizzle-orm";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import { openConnection, type Connection, type Database } from "@/core/db/connection";
import * as platformSchema from "@/core/db/schema";

/**
 * An isolated in-memory Postgres (PGlite) with the platform tables and the given
 * module schema created, plus one workspace. For integration tests of queries,
 * actions' data logic and seeds — no server, no Docker.
 *
 * ```ts
 * const t = await createTestDatabase(schema);
 * afterAll(() => t.close());
 * await seedModuleIfNeeded(t.db, smartStore, t.workspaceId);
 * ```
 */
export interface TestDatabase<TSchema extends Record<string, unknown>> {
  db: Database<TSchema>;
  workspaceId: string;
  connection: Connection;
  /** Creates another workspace (to test tenant isolation). */
  createWorkspace(): Promise<string>;
  close(): Promise<void>;
}

export async function createTestDatabase<TSchema extends Record<string, unknown>>(
  moduleSchema: TSchema,
): Promise<TestDatabase<TSchema>> {
  const connection = await openConnection({ pgliteDataDir: "memory://" });
  const db = connection.db(moduleSchema);

  const empty = generateDrizzleJson({}, undefined, undefined, "snake_case");
  const current = generateDrizzleJson({ ...platformSchema, ...moduleSchema }, empty.id, undefined, "snake_case");
  for (const statement of await generateMigration(empty, current)) {
    await db.execute(sql.raw(statement));
  }

  const createWorkspace = async () => {
    const id = crypto.randomUUID();
    await db.insert(platformSchema.workspaces).values({ id });
    return id;
  };

  return {
    db,
    workspaceId: await createWorkspace(),
    connection,
    createWorkspace,
    close: () => connection.close(),
  };
}
