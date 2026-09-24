import type { Graph } from "../domain/workflow";
import { workflowEdges, workflowNodes } from "./schema";
import type { Db } from "./types";

/** Inserts a graph's nodes and edges, mapping client keys to database ids. */
export async function insertGraph(db: Db, workspaceId: string, workflowId: string, graph: Graph): Promise<void> {
  if (graph.nodes.length === 0) return;
  const rows = await db
    .insert(workflowNodes)
    .values(
      graph.nodes.map((n) => ({
        workspaceId,
        workflowId,
        kind: n.kind,
        app: n.app,
        label: n.label,
        column: n.column,
        lane: n.lane,
      })),
    )
    .returning({ id: workflowNodes.id, column: workflowNodes.column, lane: workflowNodes.lane });
  const ids = new Map(
    graph.nodes.map((node) => [node.key, rows.find((row) => row.column === node.column && row.lane === node.lane)?.id]),
  );
  const edges = graph.edges.flatMap((edge) => {
    const fromNodeId = ids.get(edge.from);
    const toNodeId = ids.get(edge.to);
    return fromNodeId && toNodeId ? [{ workspaceId, workflowId, fromNodeId, toNodeId, label: edge.label }] : [];
  });
  if (edges.length > 0) await db.insert(workflowEdges).values(edges);
}
