import "server-only";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { insertGraph } from "../../db/graph";
import { projects, workflowEdges, workflowNodes, workflows } from "../../db/schema";
import type { Db } from "../../db/types";
import type { WorkflowCreateInput, WorkflowSaveInput } from "../../domain/inputs";
import { findTemplate, lintGraph, validateGraph, type Graph } from "../../domain/workflow";

export type WorkflowRow = typeof workflows.$inferSelect;

export interface WorkflowListItem extends WorkflowRow {
  projectName: string | null;
  nodeCount: number;
  issueCount: number;
}

async function loadGraphs(db: Db, workspaceId: string, workflowIds: string[]): Promise<Map<string, Graph>> {
  const graphs = new Map<string, Graph>(workflowIds.map((id) => [id, { nodes: [], edges: [] }]));
  if (workflowIds.length === 0) return graphs;
  const [nodes, edges] = await Promise.all([
    db
      .select()
      .from(workflowNodes)
      .where(and(eq(workflowNodes.workspaceId, workspaceId), inArray(workflowNodes.workflowId, workflowIds))),
    db
      .select()
      .from(workflowEdges)
      .where(and(eq(workflowEdges.workspaceId, workspaceId), inArray(workflowEdges.workflowId, workflowIds))),
  ]);
  for (const node of nodes) {
    graphs.get(node.workflowId)?.nodes.push({
      key: node.id,
      kind: node.kind,
      app: node.app,
      label: node.label,
      column: node.column,
      lane: node.lane,
    });
  }
  for (const edge of edges) {
    graphs.get(edge.workflowId)?.edges.push({ from: edge.fromNodeId, to: edge.toNodeId, label: edge.label });
  }
  return graphs;
}

export async function listWorkflows(db: Db, workspaceId: string): Promise<WorkflowListItem[]> {
  const rows = await db
    .select({ workflow: workflows, projectName: projects.clientName })
    .from(workflows)
    .leftJoin(projects, eq(projects.id, workflows.projectId))
    .where(eq(workflows.workspaceId, workspaceId))
    .orderBy(desc(workflows.updatedAt));
  const graphs = await loadGraphs(
    db,
    workspaceId,
    rows.map((row) => row.workflow.id),
  );
  return rows.map(({ workflow, projectName }) => {
    const graph = graphs.get(workflow.id) ?? { nodes: [], edges: [] };
    return { ...workflow, projectName, nodeCount: graph.nodes.length, issueCount: lintGraph(graph).length };
  });
}

export interface WorkflowDetail extends WorkflowRow {
  graph: Graph;
}

export async function getWorkflow(db: Db, workspaceId: string, id: string): Promise<WorkflowDetail | undefined> {
  const [row] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.id, id)))
    .limit(1);
  if (!row) return undefined;
  const graphs = await loadGraphs(db, workspaceId, [id]);
  return { ...row, graph: graphs.get(id) ?? { nodes: [], edges: [] } };
}

async function assertOwnProject(db: Db, workspaceId: string, projectId: string | null | undefined) {
  if (!projectId) return;
  const [row] = await db
    .select({ n: count() })
    .from(projects)
    .where(and(eq(projects.workspaceId, workspaceId), eq(projects.id, projectId)));
  if (!row || row.n === 0) throw new UserError("연결할 프로젝트를 찾을 수 없어요.");
}

const BLANK_GRAPH: Graph = {
  nodes: [{ key: "start", kind: "trigger", app: "schedule", label: "출발 트리거", column: 0, lane: 0 }],
  edges: [],
};

export async function createWorkflow(db: Db, workspaceId: string, input: WorkflowCreateInput): Promise<string> {
  await assertOwnProject(db, workspaceId, input.projectId);
  const template = input.template ? findTemplate(input.template) : undefined;
  if (input.template && !template) throw new UserError("템플릿을 찾을 수 없어요.");
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(workflows)
      .values({
        workspaceId,
        name: input.name,
        description: template?.description ?? "",
        platform: input.platform,
        projectId: input.projectId ?? null,
      })
      .returning({ id: workflows.id });
    await insertGraph(tx, workspaceId, row.id, template?.graph ?? BLANK_GRAPH);
    return row.id;
  });
}

/** Replaces the workflow's details and its whole graph. */
export async function saveWorkflow(db: Db, workspaceId: string, input: WorkflowSaveInput): Promise<boolean> {
  const problem = validateGraph(input.graph);
  if (problem) throw new UserError(problem);
  await assertOwnProject(db, workspaceId, input.projectId);
  return db.transaction(async (tx) => {
    const rows = await tx
      .update(workflows)
      .set({
        name: input.name,
        description: input.description,
        platform: input.platform,
        projectId: input.projectId,
        updatedAt: new Date(),
      })
      .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.id, input.id)))
      .returning({ id: workflows.id });
    if (rows.length === 0) return false;
    await tx
      .delete(workflowNodes)
      .where(and(eq(workflowNodes.workspaceId, workspaceId), eq(workflowNodes.workflowId, input.id)));
    await insertGraph(tx, workspaceId, input.id, input.graph);
    return true;
  });
}

export async function deleteWorkflow(db: Db, workspaceId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(workflows)
    .where(and(eq(workflows.workspaceId, workspaceId), eq(workflows.id, id)))
    .returning({ id: workflows.id });
  return rows.length > 0;
}
