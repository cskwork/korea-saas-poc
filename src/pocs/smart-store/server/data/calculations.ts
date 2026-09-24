import { and, desc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { calculations, type Calculation } from "../../db/schema";
import type { SmartStoreDb } from "../../db/types";
import { feeRateBp, type Category } from "../../domain/categories";
import { computeMargin, type MarginBreakdown } from "../../domain/margin";

/** Calculation history kept per workspace (oldest rows beyond this are dropped). */
export const HISTORY_LIMIT = 30;

export interface CalculationEntry extends Calculation {
  margin: MarginBreakdown;
}

export interface CalculationInput {
  label: string;
  category: Category;
  cost: number;
  price: number;
  shippingCost: number;
  monthlyQuantity: number;
}

export async function listCalculations(db: SmartStoreDb, workspaceId: string): Promise<CalculationEntry[]> {
  const rows = await db
    .select()
    .from(calculations)
    .where(eq(calculations.workspaceId, workspaceId))
    .orderBy(desc(calculations.createdAt))
    .limit(HISTORY_LIMIT);
  return rows.map((row) => ({
    ...row,
    margin: computeMargin({
      price: row.price,
      cost: row.cost,
      shipping: row.shippingCost,
      feeRateBp: feeRateBp(row.category),
    }),
  }));
}

export async function saveCalculation(
  db: SmartStoreDb,
  workspaceId: string,
  input: CalculationInput,
): Promise<Calculation> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(calculations)
      .values({ ...input, workspaceId })
      .returning();
    const stale = await tx
      .select({ id: calculations.id })
      .from(calculations)
      .where(eq(calculations.workspaceId, workspaceId))
      .orderBy(desc(calculations.createdAt))
      .offset(HISTORY_LIMIT);
    for (const { id } of stale) {
      await tx.delete(calculations).where(and(eq(calculations.workspaceId, workspaceId), eq(calculations.id, id)));
    }
    return row;
  });
}

export async function deleteCalculation(db: SmartStoreDb, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(calculations)
    .where(and(eq(calculations.workspaceId, workspaceId), eq(calculations.id, id)))
    .returning({ id: calculations.id });
  if (deleted.length === 0) throw new UserError("계산 기록을 찾을 수 없어요.");
}

export async function clearCalculations(db: SmartStoreDb, workspaceId: string): Promise<number> {
  const deleted = await db
    .delete(calculations)
    .where(eq(calculations.workspaceId, workspaceId))
    .returning({ id: calculations.id });
  return deleted.length;
}
