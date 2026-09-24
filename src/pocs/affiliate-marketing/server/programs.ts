import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { links, programs } from "../db/schema";
import type { ProgramInput } from "../domain/inputs";
import type { Db } from "./db";

/** Affiliate programs (the comparison table's columns), editable per workspace. */

export async function listPrograms(db: Db, workspaceId: string) {
  return db.select().from(programs).where(eq(programs.workspaceId, workspaceId)).orderBy(asc(programs.position), asc(programs.createdAt));
}

export type ProgramRow = Awaited<ReturnType<typeof listPrograms>>[number];

export async function getProgram(db: Db, workspaceId: string, id: string) {
  const [row] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.workspaceId, workspaceId), eq(programs.id, id)))
    .limit(1);
  return row ?? null;
}

function values(input: ProgramInput) {
  return {
    name: input.name,
    model: input.model,
    defaultRateBp: input.model === "cps" ? input.defaultRate : 0,
    defaultFixedWon: input.model === "cpa" ? (input.defaultFixed ?? 0) : 0,
    settlementCycle: input.settlementCycle,
    minPayoutWon: input.minPayout ?? 0,
    cookieWindow: input.cookieWindow,
    bestChannels: input.bestChannels,
    bestCategories: input.bestCategories,
    notes: input.notes,
  };
}

async function assertUniqueName(db: Db, workspaceId: string, name: string, exceptId?: string) {
  const rows = await db
    .select({ id: programs.id })
    .from(programs)
    .where(and(eq(programs.workspaceId, workspaceId), sql`lower(${programs.name}) = lower(${name})`));
  if (rows.some((r) => r.id !== exceptId)) throw new UserError("같은 이름의 프로그램이 이미 있어요.");
}

export async function createProgram(db: Db, workspaceId: string, input: ProgramInput) {
  await assertUniqueName(db, workspaceId, input.name);
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${programs.position}), 0)::int + 1`.mapWith(Number) })
    .from(programs)
    .where(eq(programs.workspaceId, workspaceId));
  const [row] = await db
    .insert(programs)
    .values({ workspaceId, position: next, ...values(input) })
    .returning({ id: programs.id });
  return row;
}

export async function updateProgram(db: Db, workspaceId: string, id: string, input: ProgramInput) {
  await assertUniqueName(db, workspaceId, input.name, id);
  const [row] = await db
    .update(programs)
    .set(values(input))
    .where(and(eq(programs.workspaceId, workspaceId), eq(programs.id, id)))
    .returning({ id: programs.id });
  return row ?? null;
}

/** Refuses while links still point at the program, so no link silently loses its program. */
export async function deleteProgram(db: Db, workspaceId: string, id: string) {
  const [{ linked }] = await db
    .select({ linked: sql<number>`count(*)::int`.mapWith(Number) })
    .from(links)
    .where(and(eq(links.workspaceId, workspaceId), eq(links.programId, id)));
  if (linked > 0) throw new UserError(`이 프로그램에 연결된 링크 ${linked}개를 다른 프로그램으로 옮긴 뒤 삭제해 주세요.`);
  const [row] = await db
    .delete(programs)
    .where(and(eq(programs.workspaceId, workspaceId), eq(programs.id, id)))
    .returning({ id: programs.id });
  return row ?? null;
}
