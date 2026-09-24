import { and, asc, desc, eq, sum } from "drizzle-orm";
import { UserError } from "@/core/actions";
import type { DateKey } from "../../domain/dates";
import { moveCard, type Priority, type ProjectStatus } from "../../domain/pipeline";
import { clients, milestones, projects, timeEntries } from "../../db/schema";
import type { Db } from "../db";
import { listEstimates, listInvoices, type EstimateSummary, type InvoiceSummary } from "./documents-read";
import { assertOwned, assertOwnedOrNull } from "./owned";

const PROJECT_MISSING = "프로젝트를 찾을 수 없어요.";
const MILESTONE_MISSING = "마일스톤을 찾을 수 없어요.";

export interface BoardProject {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  startOn: DateKey | null;
  dueOn: DateKey | null;
  position: number;
  completedAt: Date | null;
  createdAt: Date;
  clientId: string | null;
  clientName: string | null;
  clientCompany: string | null;
  /** Σ milestone estimates, null when no milestone carries hours. */
  estimatedHours: number | null;
  trackedMinutes: number;
  milestonesDone: number;
  milestonesTotal: number;
  nextMilestone: { title: string; dueOn: DateKey | null } | null;
}

export async function trackedMinutesByProject(db: Db, workspaceId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ projectId: timeEntries.projectId, minutes: sum(timeEntries.minutes) })
    .from(timeEntries)
    .where(eq(timeEntries.workspaceId, workspaceId))
    .groupBy(timeEntries.projectId);
  return new Map(rows.map((row) => [row.projectId, Number(row.minutes ?? 0)]));
}

export async function loadBoard(db: Db, workspaceId: string): Promise<BoardProject[]> {
  const [rows, allMilestones, tracked] = await Promise.all([
    db
      .select({
        project: projects,
        clientName: clients.name,
        clientCompany: clients.company,
      })
      .from(projects)
      .leftJoin(clients, eq(clients.id, projects.clientId))
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(asc(projects.status), asc(projects.position), desc(projects.createdAt)),
    db
      .select()
      .from(milestones)
      .where(eq(milestones.workspaceId, workspaceId))
      .orderBy(asc(milestones.position)),
    trackedMinutesByProject(db, workspaceId),
  ]);

  return rows.map(({ project, clientName, clientCompany }) => {
    const own = allMilestones.filter((m) => m.projectId === project.id);
    const withHours = own.filter((m) => m.estimatedHours !== null);
    const open = own.filter((m) => !m.doneAt);
    return {
      id: project.id,
      title: project.title,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      startOn: project.startOn,
      dueOn: project.dueOn,
      position: project.position,
      completedAt: project.completedAt,
      createdAt: project.createdAt,
      clientId: project.clientId,
      clientName,
      clientCompany,
      estimatedHours: withHours.length > 0 ? withHours.reduce((s, m) => s + Number(m.estimatedHours), 0) : null,
      trackedMinutes: tracked.get(project.id) ?? 0,
      milestonesDone: own.length - open.length,
      milestonesTotal: own.length,
      nextMilestone: open[0] ? { title: open[0].title, dueOn: open[0].dueOn } : null,
    };
  });
}

export interface MilestoneRow {
  id: string;
  title: string;
  estimatedHours: number | null;
  dueOn: DateKey | null;
  doneAt: Date | null;
  position: number;
  trackedMinutes: number;
}

export interface ProjectEntry {
  id: string;
  projectId: string;
  milestoneId: string | null;
  workedOn: DateKey;
  minutes: number;
  note: string;
  milestoneTitle: string | null;
}

export interface ProjectDetail {
  project: BoardProject & { description: string };
  milestones: MilestoneRow[];
  entries: ProjectEntry[];
  estimates: EstimateSummary[];
  invoices: InvoiceSummary[];
  /** Supply amount billed and paid on this project's invoices. */
  billed: number;
  paid: number;
}

export async function loadProject(db: Db, workspaceId: string, id: string): Promise<ProjectDetail | null> {
  const board = await loadBoard(db, workspaceId);
  const card = board.find((p) => p.id === id);
  if (!card) return null;

  const [[meta], milestoneRows, entryRows, allEstimates, allInvoices] = await Promise.all([
    db
      .select({ description: projects.description })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId))),
    db
      .select()
      .from(milestones)
      .where(and(eq(milestones.projectId, id), eq(milestones.workspaceId, workspaceId)))
      .orderBy(asc(milestones.position)),
    db
      .select({
        id: timeEntries.id,
        workedOn: timeEntries.workedOn,
        minutes: timeEntries.minutes,
        note: timeEntries.note,
        milestoneId: timeEntries.milestoneId,
      })
      .from(timeEntries)
      .where(and(eq(timeEntries.projectId, id), eq(timeEntries.workspaceId, workspaceId)))
      .orderBy(desc(timeEntries.workedOn), desc(timeEntries.createdAt)),
    listEstimates(db, workspaceId),
    listInvoices(db, workspaceId),
  ]);

  const titles = new Map(milestoneRows.map((m) => [m.id, m.title]));
  const trackedByMilestone = new Map<string, number>();
  for (const entry of entryRows) {
    if (entry.milestoneId) trackedByMilestone.set(entry.milestoneId, (trackedByMilestone.get(entry.milestoneId) ?? 0) + entry.minutes);
  }
  const invoicesHere = allInvoices.filter((invoice) => invoice.projectId === id);

  return {
    project: { ...card, description: meta.description },
    milestones: milestoneRows.map((m) => ({
      id: m.id,
      title: m.title,
      estimatedHours: m.estimatedHours === null ? null : Number(m.estimatedHours),
      dueOn: m.dueOn,
      doneAt: m.doneAt,
      position: m.position,
      trackedMinutes: trackedByMilestone.get(m.id) ?? 0,
    })),
    entries: entryRows.slice(0, 40).map((entry) => ({
      id: entry.id,
      projectId: id,
      milestoneId: entry.milestoneId,
      workedOn: entry.workedOn,
      minutes: entry.minutes,
      note: entry.note,
      milestoneTitle: entry.milestoneId ? (titles.get(entry.milestoneId) ?? null) : null,
    })),
    estimates: allEstimates.filter((estimate) => estimate.projectId === id),
    invoices: invoicesHere,
    billed: invoicesHere.reduce((s, invoice) => s + invoice.totals.supply, 0),
    paid: invoicesHere.filter((invoice) => invoice.status === "paid").reduce((s, invoice) => s + invoice.totals.supply, 0),
  };
}

// ---------------------------------------------------------------------------------------------
// Mutations

export interface ProjectInput {
  title: string;
  clientId: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  startOn: DateKey | null;
  dueOn: DateKey | null;
  description: string;
}

export async function createProject(db: Db, workspaceId: string, input: ProjectInput, now = new Date()): Promise<string> {
  await assertOwnedOrNull(db, workspaceId, clients, input.clientId, "선택한 고객을 찾을 수 없어요.");
  const column = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.status, input.status)));
  const [row] = await db
    .insert(projects)
    .values({ workspaceId, ...input, position: column.length, completedAt: input.status === "done" ? now : null })
    .returning({ id: projects.id });
  return row.id;
}

export async function updateProject(db: Db, workspaceId: string, id: string, input: ProjectInput, now = new Date()): Promise<void> {
  await assertOwnedOrNull(db, workspaceId, clients, input.clientId, "선택한 고객을 찾을 수 없어요.");
  const [current] = await db
    .select({ status: projects.status })
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)));
  if (!current) throw new UserError(PROJECT_MISSING);
  const { status, ...fields } = input;
  await db
    .update(projects)
    .set(fields)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)));
  if (status !== current.status) await moveProject(db, workspaceId, id, status, Number.MAX_SAFE_INTEGER, now);
}

export async function deleteProject(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.workspaceId, workspaceId)))
    .returning({ id: projects.id });
  if (deleted.length === 0) throw new UserError(PROJECT_MISSING);
}

/** Moves a card on the board (another column and/or another place in its column). */
export async function moveProject(
  db: Db,
  workspaceId: string,
  id: string,
  status: ProjectStatus,
  index: number,
  now = new Date(),
): Promise<void> {
  await db.transaction(async (tx) => {
    const cards = await tx
      .select({ id: projects.id, status: projects.status, position: projects.position })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId));
    const moving = cards.find((card) => card.id === id);
    if (!moving) throw new UserError(PROJECT_MISSING);

    const before = new Map(cards.map((card) => [card.id, card]));
    for (const card of moveCard(cards, id, status, index)) {
      const old = before.get(card.id)!;
      if (old.status === card.status && old.position === card.position) continue;
      const statusChanged = old.status !== card.status;
      await tx
        .update(projects)
        .set({
          status: card.status,
          position: card.position,
          ...(statusChanged ? { completedAt: card.status === "done" ? now : null } : {}),
        })
        .where(and(eq(projects.id, card.id), eq(projects.workspaceId, workspaceId)));
    }
  });
}

export interface MilestoneInput {
  title: string;
  estimatedHours: number | null;
  dueOn: DateKey | null;
}

export async function addMilestone(db: Db, workspaceId: string, projectId: string, input: MilestoneInput): Promise<void> {
  await assertOwned(db, workspaceId, projects, projectId, PROJECT_MISSING);
  const existing = await db
    .select({ id: milestones.id })
    .from(milestones)
    .where(and(eq(milestones.projectId, projectId), eq(milestones.workspaceId, workspaceId)));
  await db.insert(milestones).values({ workspaceId, projectId, ...input, position: existing.length });
}

export async function updateMilestone(db: Db, workspaceId: string, id: string, input: MilestoneInput): Promise<void> {
  const updated = await db
    .update(milestones)
    .set(input)
    .where(and(eq(milestones.id, id), eq(milestones.workspaceId, workspaceId)))
    .returning({ id: milestones.id });
  if (updated.length === 0) throw new UserError(MILESTONE_MISSING);
}

export async function setMilestoneDone(db: Db, workspaceId: string, id: string, done: boolean, now = new Date()): Promise<void> {
  const updated = await db
    .update(milestones)
    .set({ doneAt: done ? now : null })
    .where(and(eq(milestones.id, id), eq(milestones.workspaceId, workspaceId)))
    .returning({ id: milestones.id });
  if (updated.length === 0) throw new UserError(MILESTONE_MISSING);
}

export async function deleteMilestone(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(milestones)
    .where(and(eq(milestones.id, id), eq(milestones.workspaceId, workspaceId)))
    .returning({ id: milestones.id });
  if (deleted.length === 0) throw new UserError(MILESTONE_MISSING);
}

/** Swaps a milestone with its neighbour above (-1) or below (+1). */
export async function moveMilestone(db: Db, workspaceId: string, id: string, direction: -1 | 1): Promise<void> {
  const [target] = await db
    .select({ projectId: milestones.projectId })
    .from(milestones)
    .where(and(eq(milestones.id, id), eq(milestones.workspaceId, workspaceId)));
  if (!target) throw new UserError(MILESTONE_MISSING);
  await db.transaction(async (tx) => {
    const list = await tx
      .select({ id: milestones.id })
      .from(milestones)
      .where(and(eq(milestones.projectId, target.projectId), eq(milestones.workspaceId, workspaceId)))
      .orderBy(asc(milestones.position), asc(milestones.createdAt));
    const index = list.findIndex((m) => m.id === id);
    const swap = index + direction;
    if (swap < 0 || swap >= list.length) return;
    [list[index], list[swap]] = [list[swap], list[index]];
    for (const [position, m] of list.entries()) {
      await tx
        .update(milestones)
        .set({ position })
        .where(and(eq(milestones.id, m.id), eq(milestones.workspaceId, workspaceId)));
    }
  });
}
