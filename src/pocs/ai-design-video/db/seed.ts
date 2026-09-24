import type { Database } from "@/core/db/connection";
import { seoulDateKey } from "@/core/format";
import * as schema from "./schema";
import { buildSeedRows } from "./seed-data";

/** Inserts the sample studio (price sheet, orders with history, briefs, portfolio, goal) for a new workspace. */
export async function seedStudio(
  db: Database<typeof schema>,
  workspaceId: string,
  today = seoulDateKey(),
): Promise<void> {
  const rows = buildSeedRows(workspaceId, today);
  await db.insert(schema.packages).values(rows.packages);
  await db.insert(schema.orders).values(rows.orders);
  await db.insert(schema.orderEvents).values(rows.events);
  if (rows.revisions.length > 0) await db.insert(schema.revisions).values(rows.revisions);
  if (rows.briefs.length > 0) await db.insert(schema.briefs).values(rows.briefs);
  await db.insert(schema.portfolioItems).values(rows.portfolio);
  await db.insert(schema.studioSettings).values({ workspaceId, monthlyGoal: rows.monthlyGoal });
}
