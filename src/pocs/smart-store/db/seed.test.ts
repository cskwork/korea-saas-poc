import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { seoulDateKey } from "@/core/format";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import * as schema from "./schema";
import { seedSmartStore } from "./seed";

describe("smart-store seed clock", () => {
  let t: TestDatabase<typeof schema>;
  beforeAll(async () => {
    t = await createTestDatabase(schema);
  });
  afterAll(() => t.close());

  it("keeps today's orders on today's Seoul date right after midnight", async () => {
    const justAfterMidnight = new Date("2026-09-24T15:20:00Z"); // 00:20 KST, 25 Sep
    await seedSmartStore(t.db, t.workspaceId, justAfterMidnight);

    const rows = await t.db.select().from(schema.orders).where(eq(schema.orders.workspaceId, t.workspaceId));
    const today = rows.filter((row) => seoulDateKey(row.orderedAt) === "2026-09-25");
    expect(today.length).toBeGreaterThanOrEqual(5);
    expect(rows.every((row) => row.orderedAt.getTime() <= justAfterMidnight.getTime())).toBe(true);
  });
});
