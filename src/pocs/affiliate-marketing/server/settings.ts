import "server-only";
import { eq } from "drizzle-orm";
import { settings } from "../db/schema";
import type { Db } from "./db";

const DEFAULT_GOAL = 500_000;

export async function getMonthlyGoal(db: Db, workspaceId: string): Promise<number> {
  const [row] = await db.select({ goal: settings.monthlyGoalWon }).from(settings).where(eq(settings.workspaceId, workspaceId)).limit(1);
  return row?.goal ?? DEFAULT_GOAL;
}

export async function setMonthlyGoal(db: Db, workspaceId: string, goal: number) {
  await db
    .insert(settings)
    .values({ workspaceId, monthlyGoalWon: goal })
    .onConflictDoUpdate({ target: settings.workspaceId, set: { monthlyGoalWon: goal } });
}
