import { seoulDateKey } from "@/core/format";
import type { SmartStoreDb } from "../../db/types";
import { addDays, computeAnalytics, seoulDayStart, type Analytics, type Period } from "../../domain/analytics";
import { ordersSince } from "./orders";

/** Sales analytics for the period ending today (Seoul), with the previous period for comparison. */
export async function getAnalytics(
  db: SmartStoreDb,
  workspaceId: string,
  period: Period,
  now: Date = new Date(),
): Promise<Analytics> {
  const todayKey = seoulDateKey(now);
  const since = seoulDayStart(addDays(todayKey, -(period * 2 - 1)));
  const rows = await ordersSince(db, workspaceId, since);
  return computeAnalytics(rows, todayKey, period);
}
