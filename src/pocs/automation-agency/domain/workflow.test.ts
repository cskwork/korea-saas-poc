import { describe, expect, it } from "vitest";
import {
  addNode,
  canvasSize,
  cellCenter,
  connect,
  edgeLabelPoint,
  lintGraph,
  moveNode,
  placeNode,
  removeNode,
  roundedPath,
  routePoints,
  stationCode,
  updateNode,
  validateGraph,
  WORKFLOW_TEMPLATES,
  type Graph,
} from "./workflow";

const line: Graph = {
  nodes: [
    { key: "t", kind: "trigger", app: "schedule", label: "매일 9시", column: 0, lane: 0 },
    { key: "a", kind: "action", app: "sheets", label: "수집", column: 1, lane: 0 },
  ],
  edges: [{ from: "t", to: "a", label: "" }],
};

describe("workflow graph operations", () => {
  it("adds a station after the selected one and connects it", () => {
    const result = addNode(line, { key: "b", kind: "action", app: "slack" }, "a");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.graph.nodes.find((n) => n.key === "b")).toMatchObject({ column: 2, lane: 0, label: "Slack" });
    expect(result.graph.edges).toContainEqual({ from: "a", to: "b", label: "" });
  });

  it("places a new station on another lane when the next cell is taken", () => {
    const result = addNode(line, { key: "b", kind: "action" }, "t");
    expect(result.ok && result.graph.nodes.find((n) => n.key === "b")).toMatchObject({ column: 1, lane: 1 });
  });

  it("never connects into a trigger", () => {
    const result = addNode(line, { key: "t2", kind: "trigger" }, "a");
    expect(result.ok && result.graph.edges).toHaveLength(1);
    expect(connect(line, "a", "t")).toEqual({ ok: false, error: "into-trigger" });
  });

  it("rejects self and duplicate connections", () => {
    expect(connect(line, "a", "a")).toEqual({ ok: false, error: "self" });
    expect(connect(line, "t", "a")).toEqual({ ok: false, error: "duplicate" });
  });

  it("removes a station with its segments", () => {
    expect(removeNode(line, "a")).toEqual({ nodes: [line.nodes[0]], edges: [] });
  });

  it("drops incoming segments when a station becomes a trigger", () => {
    expect(updateNode(line, "a", { kind: "trigger" }).edges).toEqual([]);
  });

  it("reorders by swapping with the neighbour", () => {
    const result = moveNode(line, "a", -1, 0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.graph.nodes.map((n) => [n.key, n.column])).toEqual([
      ["t", 1],
      ["a", 0],
    ]);
  });

  it("refuses moves off the grid and drops onto occupied cells without swap", () => {
    expect(moveNode(line, "t", -1, 0)).toEqual({ ok: false, error: "bounds" });
    expect(placeNode(line, "t", 1, 0, { swap: false })).toEqual({ ok: false, error: "occupied" });
  });

  it("numbers stations in line order", () => {
    expect(stationCode(line, "a", "M")).toBe("M02");
  });
});

describe("lint and validation", () => {
  it("accepts every starter template", () => {
    for (const template of WORKFLOW_TEMPLATES) {
      expect(validateGraph(template.graph)).toBeUndefined();
      expect(lintGraph(template.graph)).toEqual([]);
    }
  });

  it("flags a line without a trigger and a one-way condition", () => {
    const graph: Graph = {
      nodes: [
        { key: "c", kind: "condition", app: "router", label: "분기", column: 0, lane: 0 },
        { key: "a", kind: "action", app: "gmail", label: "메일", column: 1, lane: 0 },
      ],
      edges: [{ from: "c", to: "a", label: "" }],
    };
    const messages = lintGraph(graph).map((i) => i.message);
    expect(messages).toContain("출발역(트리거)이 없어요.");
    expect(messages.some((m) => m.includes("두 갈래"))).toBe(true);
  });

  it("rejects graphs with shared cells or dangling edges", () => {
    expect(validateGraph({ nodes: [line.nodes[0], { ...line.nodes[1], column: 0 }], edges: [] })).toBeDefined();
    expect(validateGraph({ nodes: line.nodes, edges: [{ from: "t", to: "zz", label: "" }] })).toBeDefined();
  });
});

describe("octilinear geometry", () => {
  const a = cellCenter(0, 0);

  it("draws a straight segment along one lane", () => {
    expect(routePoints(a, cellCenter(1, 0), 400)).toEqual([a, cellCenter(1, 0)]);
  });

  it("bends at 45° to reach another lane", () => {
    const b = cellCenter(1, 1);
    const points = routePoints(a, b, 400);
    for (let i = 1; i < points.length; i += 1) {
      const dx = Math.abs(points[i].x - points[i - 1].x);
      const dy = Math.abs(points[i].y - points[i - 1].y);
      expect(dx === 0 || dy === 0 || Math.abs(dx - dy) < 1e-9).toBe(true);
    }
    expect(points.at(-1)).toEqual(b);
  });

  it("routes backwards segments below the line", () => {
    const points = routePoints(cellCenter(2, 0), a, 300);
    expect(points.some((p) => p.y === 300)).toBe(true);
  });

  it("rounds corners with quadratic curves", () => {
    const d = roundedPath([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(d).toBe("M 0 0 L 82 0 Q 100 0 100 18 L 100 100");
  });

  it("places branch labels beside the diagonal, or above a straight run", () => {
    const template = WORKFLOW_TEMPLATES[0].graph;
    const straight = template.edges.find((e) => e.label === "일반");
    const branch = template.edges.find((e) => e.label === "긴급");
    const a = straight && edgeLabelPoint(template, straight);
    const b = branch && edgeLabelPoint(template, branch);
    expect(a?.anchor).toBe("middle");
    expect(a?.y).toBeLessThan(cellCenter(0, 0).y);
    expect(b?.anchor).toBe("end");
    expect(b?.y).toBeGreaterThan(cellCenter(0, 0).y);
    expect(b?.y).toBeLessThan(cellCenter(0, 1).y);
  });

  it("sizes the canvas to the furthest station", () => {
    expect(canvasSize(line).width).toBeGreaterThan(cellCenter(1, 0).x);
  });
});
