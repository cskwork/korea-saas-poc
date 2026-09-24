import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { integer, pgSchema, text, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { defineModule } from "./define";
import { resetModule, seedModuleIfNeeded, workspaceTables } from "./lifecycle";

const demo = pgSchema("lifecycle_demo");
const notes = demo.table("notes", {
  id: uuid().primaryKey().defaultRandom(),
  workspaceId: uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  body: text().notNull(),
  position: integer().notNull(),
});
const schema = { demo, notes };

const demoModule = defineModule({
  id: "lifecycle-demo",
  schema,
  async seed(db, workspaceId) {
    await db.insert(notes).values([
      { workspaceId, body: "첫 번째", position: 1 },
      { workspaceId, body: "두 번째", position: 2 },
    ]);
  },
});

describe("module lifecycle", () => {
  let t: TestDatabase<typeof schema>;
  beforeAll(async () => {
    t = await createTestDatabase(schema);
  });
  afterAll(() => t.close());

  const count = async (workspaceId: string) =>
    (await t.db.select().from(notes).where(eq(notes.workspaceId, workspaceId))).length;

  it("seeds once per workspace", async () => {
    expect(await seedModuleIfNeeded(t.db, demoModule, t.workspaceId)).toBe(true);
    expect(await seedModuleIfNeeded(t.db, demoModule, t.workspaceId)).toBe(false);
    expect(await count(t.workspaceId)).toBe(2);
  });

  it("seeds exactly once under concurrent first visits", async () => {
    const workspaceId = await t.createWorkspace();
    await Promise.all([1, 2, 3].map(() => seedModuleIfNeeded(t.db, demoModule, workspaceId)));
    expect(await count(workspaceId)).toBe(2);
  });

  it("reset restores demo data without touching other workspaces", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, demoModule, other);
    await t.db.insert(notes).values({ workspaceId: t.workspaceId, body: "추가", position: 3 });
    expect(await count(t.workspaceId)).toBe(3);

    await resetModule(t.db, demoModule, t.workspaceId);
    expect(await count(t.workspaceId)).toBe(2);
    expect(await count(other)).toBe(2);
  });

  it("finds tenant tables by their workspaceId column", () => {
    expect(workspaceTables(schema).map((t) => t.table)).toEqual([notes]);
  });
});
