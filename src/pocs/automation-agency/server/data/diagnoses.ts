import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { diagnoses, type LeadStatus } from "../../db/schema";
import type { Db } from "../../db/types";
import type { DiagnosisInput } from "../../domain/inputs";
import { computeRoi, type RoiResult } from "../../domain/roi";

export type DiagnosisRow = typeof diagnoses.$inferSelect;

export interface DiagnosisWithRoi extends DiagnosisRow {
  result: RoiResult;
}

export async function listDiagnoses(db: Db, workspaceId: string): Promise<DiagnosisWithRoi[]> {
  const rows = await db
    .select()
    .from(diagnoses)
    .where(eq(diagnoses.workspaceId, workspaceId))
    .orderBy(desc(diagnoses.createdAt));
  return rows.map((row) => ({ ...row, result: computeRoi(row) }));
}

export async function getDiagnosis(db: Db, workspaceId: string, id: string): Promise<DiagnosisWithRoi | undefined> {
  const [row] = await db
    .select()
    .from(diagnoses)
    .where(and(eq(diagnoses.workspaceId, workspaceId), eq(diagnoses.id, id)))
    .limit(1);
  return row ? { ...row, result: computeRoi(row) } : undefined;
}

export async function createDiagnosis(db: Db, workspaceId: string, input: DiagnosisInput): Promise<string> {
  const [row] = await db
    .insert(diagnoses)
    .values({ ...input, workspaceId })
    .returning({ id: diagnoses.id });
  return row.id;
}

export async function setDiagnosisStatus(
  db: Db,
  workspaceId: string,
  id: string,
  status: LeadStatus,
): Promise<boolean> {
  const rows = await db
    .update(diagnoses)
    .set({ status })
    .where(and(eq(diagnoses.workspaceId, workspaceId), eq(diagnoses.id, id)))
    .returning({ id: diagnoses.id });
  return rows.length > 0;
}

export async function deleteDiagnosis(db: Db, workspaceId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(diagnoses)
    .where(and(eq(diagnoses.workspaceId, workspaceId), eq(diagnoses.id, id)))
    .returning({ id: diagnoses.id });
  return rows.length > 0;
}
