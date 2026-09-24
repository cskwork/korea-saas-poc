import { and, desc, eq, gte, lte, sum } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import type { DateKey } from "../../domain/dates";
import { timerMinutes } from "../../domain/time";
import { milestones, projects, timeEntries, timers } from "../../db/schema";
import type { Db } from "../db";
import { assertOwned } from "./owned";

const PROJECT_MISSING = "프로젝트를 찾을 수 없어요.";
const ENTRY_MISSING = "시간 기록을 찾을 수 없어요.";

export interface RunningTimer {
  projectId: string;
  projectTitle: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  note: string;
  startedAt: Date;
}

export async function getTimer(db: Db, workspaceId: string): Promise<RunningTimer | null> {
  const [row] = await db
    .select({
      projectId: timers.projectId,
      projectTitle: projects.title,
      milestoneId: timers.milestoneId,
      milestoneTitle: milestones.title,
      note: timers.note,
      startedAt: timers.startedAt,
    })
    .from(timers)
    .innerJoin(projects, eq(projects.id, timers.projectId))
    .leftJoin(milestones, eq(milestones.id, timers.milestoneId))
    .where(eq(timers.workspaceId, workspaceId));
  return row ?? null;
}

/** A milestone reference must belong to the same project (and workspace). */
async function assertMilestone(db: Db, workspaceId: string, projectId: string, milestoneId: string | null) {
  if (!milestoneId) return;
  const [row] = await db
    .select({ id: milestones.id })
    .from(milestones)
    .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId), eq(milestones.workspaceId, workspaceId)));
  if (!row) throw new UserError("선택한 마일스톤이 이 프로젝트에 없어요.");
}

export interface TimerInput {
  projectId: string;
  milestoneId: string | null;
  note: string;
}

export async function startTimer(db: Db, workspaceId: string, input: TimerInput, now = new Date()): Promise<void> {
  await assertOwned(db, workspaceId, projects, input.projectId, PROJECT_MISSING);
  await assertMilestone(db, workspaceId, input.projectId, input.milestoneId);
  const inserted = await db
    .insert(timers)
    .values({ workspaceId, ...input, startedAt: now })
    .onConflictDoNothing()
    .returning({ projectId: timers.projectId });
  if (inserted.length === 0) throw new UserError("이미 타이머가 돌아가고 있어요. 먼저 정지해 주세요.");
}

/** Stops the timer and logs its time to the day it started (Seoul). Returns the logged minutes. */
export async function stopTimer(db: Db, workspaceId: string, now = new Date()): Promise<{ minutes: number; workedOn: DateKey }> {
  return db.transaction(async (tx) => {
    const [timer] = await tx.delete(timers).where(eq(timers.workspaceId, workspaceId)).returning();
    if (!timer) throw new UserError("돌아가는 타이머가 없어요.");
    const minutes = timerMinutes(timer.startedAt, now);
    const workedOn = seoulDateKey(timer.startedAt);
    await tx.insert(timeEntries).values({
      workspaceId,
      projectId: timer.projectId,
      milestoneId: timer.milestoneId,
      workedOn,
      minutes,
      note: timer.note,
      startedAt: timer.startedAt,
    });
    return { minutes, workedOn };
  });
}

export async function discardTimer(db: Db, workspaceId: string): Promise<void> {
  const deleted = await db.delete(timers).where(eq(timers.workspaceId, workspaceId)).returning({ projectId: timers.projectId });
  if (deleted.length === 0) throw new UserError("돌아가는 타이머가 없어요.");
}

export interface EntryInput {
  projectId: string;
  milestoneId: string | null;
  workedOn: DateKey;
  minutes: number;
  note: string;
}

export async function addEntry(db: Db, workspaceId: string, input: EntryInput): Promise<void> {
  await assertOwned(db, workspaceId, projects, input.projectId, PROJECT_MISSING);
  await assertMilestone(db, workspaceId, input.projectId, input.milestoneId);
  await db.insert(timeEntries).values({ workspaceId, ...input });
}

export async function updateEntry(db: Db, workspaceId: string, id: string, input: EntryInput): Promise<void> {
  await assertOwned(db, workspaceId, projects, input.projectId, PROJECT_MISSING);
  await assertMilestone(db, workspaceId, input.projectId, input.milestoneId);
  const updated = await db
    .update(timeEntries)
    .set(input)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, workspaceId)))
    .returning({ id: timeEntries.id });
  if (updated.length === 0) throw new UserError(ENTRY_MISSING);
}

export async function deleteEntry(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(timeEntries)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.workspaceId, workspaceId)))
    .returning({ id: timeEntries.id });
  if (deleted.length === 0) throw new UserError(ENTRY_MISSING);
}

export interface EntryRow {
  id: string;
  projectId: string;
  projectTitle: string;
  milestoneId: string | null;
  milestoneTitle: string | null;
  workedOn: DateKey;
  minutes: number;
  note: string;
  fromTimer: boolean;
}

export interface EntryFilter {
  projectId?: string;
  from?: DateKey;
  to?: DateKey;
}

export async function listEntries(db: Db, workspaceId: string, filter: EntryFilter = {}, limit = 200): Promise<EntryRow[]> {
  const conditions = [eq(timeEntries.workspaceId, workspaceId)];
  if (filter.projectId) conditions.push(eq(timeEntries.projectId, filter.projectId));
  if (filter.from) conditions.push(gte(timeEntries.workedOn, filter.from));
  if (filter.to) conditions.push(lte(timeEntries.workedOn, filter.to));
  const rows = await db
    .select({
      id: timeEntries.id,
      projectId: timeEntries.projectId,
      projectTitle: projects.title,
      milestoneId: timeEntries.milestoneId,
      milestoneTitle: milestones.title,
      workedOn: timeEntries.workedOn,
      minutes: timeEntries.minutes,
      note: timeEntries.note,
      startedAt: timeEntries.startedAt,
    })
    .from(timeEntries)
    .innerJoin(projects, eq(projects.id, timeEntries.projectId))
    .leftJoin(milestones, eq(milestones.id, timeEntries.milestoneId))
    .where(and(...conditions))
    .orderBy(desc(timeEntries.workedOn), desc(timeEntries.createdAt))
    .limit(limit);
  return rows.map(({ startedAt, ...row }) => ({ ...row, fromTimer: startedAt !== null }));
}

/** Minutes per Seoul day since `from` (inclusive). */
export async function minutesByDay(db: Db, workspaceId: string, from: DateKey): Promise<Map<DateKey, number>> {
  const rows = await db
    .select({ day: timeEntries.workedOn, minutes: sum(timeEntries.minutes) })
    .from(timeEntries)
    .where(and(eq(timeEntries.workspaceId, workspaceId), gte(timeEntries.workedOn, from)))
    .groupBy(timeEntries.workedOn);
  return new Map(rows.map((row) => [row.day, Number(row.minutes ?? 0)]));
}

/** Projects and their milestones, for the timer and entry pickers (done projects last). */
export async function pickerProjects(db: Db, workspaceId: string) {
  const [projectRows, milestoneRows] = await Promise.all([
    db
      .select({ id: projects.id, title: projects.title, status: projects.status })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.createdAt)),
    db
      .select({ id: milestones.id, projectId: milestones.projectId, title: milestones.title, doneAt: milestones.doneAt, position: milestones.position })
      .from(milestones)
      .where(eq(milestones.workspaceId, workspaceId))
      .orderBy(milestones.position),
  ]);
  const rank = (status: string) => (status === "done" ? 1 : 0);
  return projectRows
    .sort((a, b) => rank(a.status) - rank(b.status))
    .map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      done: project.status === "done",
      milestones: milestoneRows
        .filter((m) => m.projectId === project.id)
        .map((m) => ({ id: m.id, title: m.title, done: m.doneAt !== null })),
    }));
}

export type PickerProject = Awaited<ReturnType<typeof pickerProjects>>[number];
