import "server-only";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { UserError } from "@/core/actions";
import {
  packages,
  projectPackages,
  projects,
  quotes,
  workflows,
  type MaintenanceStatus,
  type Platform,
  type Stage,
} from "../../db/schema";
import type { Db } from "../../db/types";
import type { ProjectInput } from "../../domain/inputs";
import { advanceStage } from "../../domain/stages";

export type ProjectRow = typeof projects.$inferSelect;

export interface ProjectListItem extends ProjectRow {
  packages: { id: string; name: string }[];
}

export type ProjectSort = "due" | "recent" | "client";

export interface ProjectFilter {
  stage?: Stage;
  q?: string;
  sort?: ProjectSort;
}

async function packagesByProject(db: Db, workspaceId: string, projectIds: string[]) {
  const map = new Map<string, { id: string; name: string }[]>();
  if (projectIds.length === 0) return map;
  const rows = await db
    .select({ projectId: projectPackages.projectId, id: packages.id, name: packages.name })
    .from(projectPackages)
    .innerJoin(packages, eq(packages.id, projectPackages.packageId))
    .where(and(eq(projectPackages.workspaceId, workspaceId), inArray(projectPackages.projectId, projectIds)))
    .orderBy(asc(packages.name));
  for (const row of rows) map.set(row.projectId, [...(map.get(row.projectId) ?? []), { id: row.id, name: row.name }]);
  return map;
}

export async function listProjects(
  db: Db,
  workspaceId: string,
  filter: ProjectFilter = {},
): Promise<ProjectListItem[]> {
  const conditions = [eq(projects.workspaceId, workspaceId)];
  if (filter.stage) conditions.push(eq(projects.stage, filter.stage));
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(projects.clientName, `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`));

  const order =
    filter.sort === "client"
      ? [asc(projects.clientName)]
      : filter.sort === "recent"
        ? [desc(projects.updatedAt)]
        : [asc(projects.dueDate), asc(projects.clientName)];

  const rows = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(...order);
  const pkgs = await packagesByProject(
    db,
    workspaceId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({ ...row, packages: pkgs.get(row.id) ?? [] }));
}

/** Project count per stage (for the station filter). */
export async function stageCounts(db: Db, workspaceId: string): Promise<Record<Stage, number>> {
  const rows = await db.select({ stage: projects.stage }).from(projects).where(eq(projects.workspaceId, workspaceId));
  const counts: Record<Stage, number> = {
    waiting: 0,
    analysis: 0,
    development: 0,
    testing: 0,
    deployment: 0,
    maintenance: 0,
  };
  for (const row of rows) counts[row.stage] += 1;
  return counts;
}

export interface ProjectDetail extends ProjectListItem {
  quote: { id: string; number: string } | null;
  workflows: { id: string; name: string; platform: Platform }[];
}

export async function getProject(db: Db, workspaceId: string, id: string): Promise<ProjectDetail | undefined> {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)))
    .limit(1);
  if (!row) return undefined;
  const [pkgs, quoteRows, workflowRows] = await Promise.all([
    packagesByProject(db, workspaceId, [id]),
    row.quoteId
      ? db
          .select({ id: quotes.id, number: quotes.number })
          .from(quotes)
          .where(and(eq(quotes.workspaceId, workspaceId), eq(quotes.id, row.quoteId)))
      : Promise.resolve([]),
    db
      .select({ id: workflows.id, name: workflows.name, platform: workflows.platform })
      .from(workflows)
      .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.projectId, id)))
      .orderBy(desc(workflows.updatedAt)),
  ]);
  return { ...row, packages: pkgs.get(id) ?? [], quote: quoteRows[0] ?? null, workflows: workflowRows };
}

/** Throws when any package id is not one of the workspace's packages. */
async function assertOwnPackages(db: Db, workspaceId: string, packageIds: string[]) {
  if (packageIds.length === 0) return;
  const unique = [...new Set(packageIds)];
  const rows = await db
    .select({ id: packages.id })
    .from(packages)
    .where(and(eq(packages.workspaceId, workspaceId), inArray(packages.id, unique)));
  if (rows.length !== unique.length)
    throw new UserError("선택한 패키지를 찾을 수 없어요. 새로고침 후 다시 선택해 주세요.");
}

function projectValues(input: ProjectInput, today: string) {
  const { packageIds: _packageIds, ...values } = input;
  const running = values.maintenanceStatus === "active" || values.maintenanceStatus === "paused";
  return {
    ...values,
    maintenanceStartedOn:
      values.maintenanceStatus === "none"
        ? null
        : running
          ? (values.maintenanceStartedOn ?? today)
          : values.maintenanceStartedOn,
  };
}

export async function createProject(db: Db, workspaceId: string, input: ProjectInput, today: string): Promise<string> {
  await assertOwnPackages(db, workspaceId, input.packageIds);
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(projects)
      .values({ ...projectValues(input, today), workspaceId })
      .returning({ id: projects.id });
    const ids = [...new Set(input.packageIds)];
    if (ids.length > 0)
      await tx.insert(projectPackages).values(ids.map((packageId) => ({ workspaceId, projectId: row.id, packageId })));
    return row.id;
  });
}

export async function updateProject(
  db: Db,
  workspaceId: string,
  id: string,
  input: ProjectInput,
  today: string,
): Promise<boolean> {
  await assertOwnPackages(db, workspaceId, input.packageIds);
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ maintenanceEndedOn: projects.maintenanceEndedOn })
      .from(projects)
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)))
      .limit(1);
    if (!current) return false;
    const values = projectValues(input, today);
    const maintenanceEndedOn = values.maintenanceStatus === "ended" ? (current.maintenanceEndedOn ?? today) : null;
    await tx
      .update(projects)
      .set({ ...values, maintenanceEndedOn, updatedAt: new Date() })
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)));
    await tx
      .delete(projectPackages)
      .where(and(eq(projectPackages.workspaceId, workspaceId), eq(projectPackages.projectId, id)));
    const ids = [...new Set(input.packageIds)];
    if (ids.length > 0)
      await tx.insert(projectPackages).values(ids.map((packageId) => ({ workspaceId, projectId: id, packageId })));
    return true;
  });
}

/** Moves the project to the next station. Returns the new stage, or undefined when not found / already at the end. */
export async function advanceProject(
  db: Db,
  workspaceId: string,
  id: string,
  today: string,
): Promise<Stage | undefined> {
  const [row] = await db
    .select({
      stage: projects.stage,
      maintenanceStatus: projects.maintenanceStatus,
      maintenanceStartedOn: projects.maintenanceStartedOn,
    })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)))
    .limit(1);
  if (!row) return undefined;
  const move = advanceStage(row, today);
  if (!move) throw new UserError("이미 종착역(유지보수)에 도착한 프로젝트예요.");
  await db
    .update(projects)
    .set({ ...move, maintenanceEndedOn: null, updatedAt: new Date() })
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)));
  return move.stage;
}

/** Starts, pauses, resumes or ends a maintenance subscription, keeping its dates consistent. */
export async function setMaintenanceStatus(
  db: Db,
  workspaceId: string,
  id: string,
  status: MaintenanceStatus,
  today: string,
): Promise<boolean> {
  const [row] = await db
    .select({ startedOn: projects.maintenanceStartedOn, endedOn: projects.maintenanceEndedOn })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)))
    .limit(1);
  if (!row) return false;
  const running = status === "active" || status === "paused";
  await db
    .update(projects)
    .set({
      maintenanceStatus: status,
      maintenanceStartedOn: status === "none" ? null : running ? (row.startedOn ?? today) : row.startedOn,
      maintenanceEndedOn: status === "ended" ? (row.endedOn ?? today) : null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)));
  return true;
}

export async function deleteProject(db: Db, workspaceId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, id)))
    .returning({ id: projects.id });
  return rows.length > 0;
}

/** Minimal list for pickers (workflow → project). */
export async function projectOptions(db: Db, workspaceId: string) {
  return db
    .select({ id: projects.id, clientName: projects.clientName, stage: projects.stage })
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(asc(projects.clientName));
}
