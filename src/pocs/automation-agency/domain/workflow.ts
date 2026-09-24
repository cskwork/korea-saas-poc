import type { NodeKind, Platform } from "../db/schema";

/**
 * Workflow graph, drawn as a metro line: nodes are stations on a grid
 * (column = order along the line, lane = parallel track), edges are line segments.
 * Pure functions only: the builder UI, the server action and the tests share them.
 */

export const NODE_KINDS = ["trigger", "action", "condition"] as const satisfies readonly NodeKind[];
export const NODE_KIND_LABEL: Record<NodeKind, string> = { trigger: "트리거", action: "액션", condition: "조건" };

export type AppId = (typeof APPS)[number]["id"];

/** Apps a station can run on. Real products the agency connects, grouped by what they do. */
export const APPS = [
  { id: "schedule", label: "스케줄", kinds: ["trigger"] },
  { id: "webhook", label: "웹훅", kinds: ["trigger", "action"] },
  { id: "gmail", label: "Gmail", kinds: ["trigger", "action"] },
  { id: "google_forms", label: "Google Forms", kinds: ["trigger"] },
  { id: "sheets", label: "Google Sheets", kinds: ["trigger", "action"] },
  { id: "drive", label: "Google Drive", kinds: ["trigger", "action"] },
  { id: "slack", label: "Slack", kinds: ["trigger", "action"] },
  { id: "notion", label: "Notion", kinds: ["action"] },
  { id: "kakao", label: "카카오 알림톡", kinds: ["action"] },
  { id: "channeltalk", label: "채널톡", kinds: ["trigger", "action"] },
  { id: "smartstore", label: "네이버 스마트스토어", kinds: ["trigger", "action"] },
  { id: "coupang", label: "쿠팡 Wing", kinds: ["trigger", "action"] },
  { id: "delivery", label: "택배 배송조회 API", kinds: ["action"] },
  { id: "ecount", label: "이카운트 ERP", kinds: ["trigger", "action"] },
  { id: "hometax", label: "홈택스 전자세금계산서", kinds: ["action"] },
  { id: "openai", label: "OpenAI", kinds: ["action"] },
  { id: "zoom", label: "Zoom", kinds: ["trigger"] },
  { id: "http", label: "HTTP 요청", kinds: ["action"] },
  { id: "router", label: "라우터", kinds: ["condition"] },
  { id: "filter", label: "필터", kinds: ["condition"] },
] as const satisfies readonly { id: string; label: string; kinds: readonly NodeKind[] }[];

export const APP_IDS = APPS.map((app) => app.id) as [AppId, ...AppId[]];

export function appLabel(id: string): string {
  return APPS.find((app) => app.id === id)?.label ?? id;
}

export function appsFor(kind: NodeKind) {
  return APPS.filter((app) => (app.kinds as readonly NodeKind[]).includes(kind));
}

export const DEFAULT_APP: Record<NodeKind, AppId> = { trigger: "schedule", action: "sheets", condition: "router" };

export const MAX_COLUMNS = 12;
export const MAX_LANES = 4;
export const MAX_NODES = 30;

export interface GraphNode {
  /** Client-side key; the server assigns database ids on save. */
  key: string;
  kind: NodeKind;
  app: string;
  label: string;
  column: number;
  lane: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function findNode(graph: Graph, key: string): GraphNode | undefined {
  return graph.nodes.find((node) => node.key === key);
}

export function nodeAt(graph: Graph, column: number, lane: number): GraphNode | undefined {
  return graph.nodes.find((node) => node.column === column && node.lane === lane);
}

/** Nodes in reading order along the line: by column, then lane. */
export function orderedNodes(graph: Graph): GraphNode[] {
  return [...graph.nodes].sort((a, b) => a.column - b.column || a.lane - b.lane);
}

/** Station code shown on the node: platform letter + position, e.g. "M03". */
export function stationCode(graph: Graph, key: string, platformCode: string): string {
  const index = orderedNodes(graph).findIndex((node) => node.key === key);
  return `${platformCode}${String(index + 1).padStart(2, "0")}`;
}

/** First free cell to the right of `after` (same lane first), or at the end of the line. */
function freeCell(graph: Graph, after?: GraphNode): { column: number; lane: number } | undefined {
  const startColumn = after ? after.column + 1 : Math.max(-1, ...graph.nodes.map((n) => n.column)) + 1;
  const preferredLane = after?.lane ?? 0;
  for (let column = startColumn; column < MAX_COLUMNS; column += 1) {
    const lanes = [preferredLane, ...Array.from({ length: MAX_LANES }, (_, i) => i).filter((l) => l !== preferredLane)];
    for (const lane of lanes) if (!nodeAt(graph, column, lane)) return { column, lane };
  }
  return undefined;
}

export type GraphError =
  "full" | "no-space" | "self" | "duplicate" | "into-trigger" | "missing" | "occupied" | "bounds";

export const GRAPH_ERROR_MESSAGE: Record<GraphError, string> = {
  full: `역은 최대 ${MAX_NODES}개까지 놓을 수 있어요.`,
  "no-space": "오른쪽에 빈 자리가 없어요. 역을 옮기거나 지운 뒤 다시 시도해 주세요.",
  self: "같은 역끼리는 연결할 수 없어요.",
  duplicate: "이미 연결된 구간이에요.",
  "into-trigger": "트리거 역으로는 들어오는 노선을 만들 수 없어요.",
  missing: "역을 찾을 수 없어요.",
  occupied: "그 자리에는 이미 다른 역이 있어요.",
  bounds: "노선도 밖으로는 옮길 수 없어요.",
};

export type GraphResult = { ok: true; graph: Graph; key?: string } | { ok: false; error: GraphError };

/**
 * Adds a station. With `after`, it lands in the next free cell to its right and is
 * connected from it (a trigger never gets an incoming segment).
 */
export function addNode(
  graph: Graph,
  input: { key: string; kind: NodeKind; app?: string; label?: string },
  afterKey?: string,
): GraphResult {
  if (graph.nodes.length >= MAX_NODES) return { ok: false, error: "full" };
  const after = afterKey ? findNode(graph, afterKey) : undefined;
  const cell = freeCell(graph, after);
  if (!cell) return { ok: false, error: "no-space" };
  const app = input.app ?? DEFAULT_APP[input.kind];
  const node: GraphNode = { key: input.key, kind: input.kind, app, label: input.label ?? appLabel(app), ...cell };
  const edges =
    after && input.kind !== "trigger" ? [...graph.edges, { from: after.key, to: node.key, label: "" }] : graph.edges;
  return { ok: true, graph: { nodes: [...graph.nodes, node], edges }, key: node.key };
}

export function removeNode(graph: Graph, key: string): Graph {
  return {
    nodes: graph.nodes.filter((node) => node.key !== key),
    edges: graph.edges.filter((edge) => edge.from !== key && edge.to !== key),
  };
}

export function updateNode(
  graph: Graph,
  key: string,
  patch: Partial<Pick<GraphNode, "kind" | "app" | "label">>,
): Graph {
  const nodes = graph.nodes.map((node) => (node.key === key ? { ...node, ...patch } : node));
  // A station that becomes a trigger cannot keep incoming segments.
  const edges = patch.kind === "trigger" ? graph.edges.filter((edge) => edge.to !== key) : graph.edges;
  return { nodes, edges };
}

export function connect(graph: Graph, from: string, to: string, label = ""): GraphResult {
  const source = findNode(graph, from);
  const target = findNode(graph, to);
  if (!source || !target) return { ok: false, error: "missing" };
  if (from === to) return { ok: false, error: "self" };
  if (target.kind === "trigger") return { ok: false, error: "into-trigger" };
  if (graph.edges.some((edge) => edge.from === from && edge.to === to)) return { ok: false, error: "duplicate" };
  return { ok: true, graph: { ...graph, edges: [...graph.edges, { from, to, label }] } };
}

export function disconnect(graph: Graph, from: string, to: string): Graph {
  return { ...graph, edges: graph.edges.filter((edge) => !(edge.from === from && edge.to === to)) };
}

export function setEdgeLabel(graph: Graph, from: string, to: string, label: string): Graph {
  return {
    ...graph,
    edges: graph.edges.map((edge) => (edge.from === from && edge.to === to ? { ...edge, label } : edge)),
  };
}

/**
 * Moves a station by one cell (reorder along the line or switch track).
 * If the destination is taken, the two stations swap places.
 */
export function moveNode(graph: Graph, key: string, dColumn: number, dLane: number): GraphResult {
  const node = findNode(graph, key);
  if (!node) return { ok: false, error: "missing" };
  return placeNode(graph, key, node.column + dColumn, node.lane + dLane, { swap: true });
}

/** Puts a station on a cell (drag and drop). Swaps with the occupant when `swap` is set. */
export function placeNode(
  graph: Graph,
  key: string,
  column: number,
  lane: number,
  options: { swap: boolean },
): GraphResult {
  const node = findNode(graph, key);
  if (!node) return { ok: false, error: "missing" };
  if (column < 0 || column >= MAX_COLUMNS || lane < 0 || lane >= MAX_LANES) return { ok: false, error: "bounds" };
  const occupant = nodeAt(graph, column, lane);
  if (occupant && occupant.key !== key && !options.swap) return { ok: false, error: "occupied" };
  const nodes = graph.nodes.map((n) => {
    if (n.key === key) return { ...n, column, lane };
    if (occupant && n.key === occupant.key) return { ...n, column: node.column, lane: node.lane };
    return n;
  });
  return { ok: true, graph: { ...graph, nodes } };
}

export interface GraphIssue {
  key?: string;
  message: string;
}

/** Things worth fixing before the workflow is built for real. Empty means the line is runnable. */
export function lintGraph(graph: Graph): GraphIssue[] {
  const issues: GraphIssue[] = [];
  if (graph.nodes.length === 0) return [{ message: "역이 없어요. 트리거부터 놓아 주세요." }];
  if (!graph.nodes.some((node) => node.kind === "trigger")) issues.push({ message: "출발역(트리거)이 없어요." });
  for (const node of graph.nodes) {
    const incoming = graph.edges.filter((edge) => edge.to === node.key).length;
    const outgoing = graph.edges.filter((edge) => edge.from === node.key).length;
    if (node.kind !== "trigger" && incoming === 0)
      issues.push({ key: node.key, message: `‘${node.label}’로 들어오는 노선이 없어요.` });
    if (node.kind === "trigger" && outgoing === 0)
      issues.push({ key: node.key, message: `‘${node.label}’에서 출발하는 노선이 없어요.` });
    if (node.kind === "condition" && outgoing < 2)
      issues.push({ key: node.key, message: `조건 ‘${node.label}’은 두 갈래 이상으로 나뉘어야 해요.` });
  }
  return issues;
}

/** Checks a graph received from the client: unique keys and cells, edges between existing nodes. */
export function validateGraph(graph: Graph): string | undefined {
  if (graph.nodes.length > MAX_NODES) return GRAPH_ERROR_MESSAGE.full;
  const keys = new Set<string>();
  const cells = new Set<string>();
  for (const node of graph.nodes) {
    if (keys.has(node.key)) return "역 식별자가 중복되었어요.";
    keys.add(node.key);
    const cell = `${node.column}:${node.lane}`;
    if (cells.has(cell)) return GRAPH_ERROR_MESSAGE.occupied;
    cells.add(cell);
    if (node.column < 0 || node.column >= MAX_COLUMNS || node.lane < 0 || node.lane >= MAX_LANES) {
      return GRAPH_ERROR_MESSAGE.bounds;
    }
  }
  const seen = new Set<string>();
  for (const edge of graph.edges) {
    if (!keys.has(edge.from) || !keys.has(edge.to)) return GRAPH_ERROR_MESSAGE.missing;
    if (edge.from === edge.to) return GRAPH_ERROR_MESSAGE.self;
    const id = `${edge.from}>${edge.to}`;
    if (seen.has(id)) return GRAPH_ERROR_MESSAGE.duplicate;
    seen.add(id);
    if (graph.nodes.find((node) => node.key === edge.to)?.kind === "trigger")
      return GRAPH_ERROR_MESSAGE["into-trigger"];
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Geometry: octilinear segments (horizontal, vertical, 45°) with rounded bends.

export const CELL = { width: 184, height: 112, padX: 72, padY: 64 } as const;

export function cellCenter(column: number, lane: number): { x: number; y: number } {
  return { x: CELL.padX + column * CELL.width, y: CELL.padY + lane * CELL.height };
}

export function canvasSize(graph: Graph): { width: number; height: number } {
  const columns = Math.max(4, ...graph.nodes.map((node) => node.column + 2));
  const lanes = Math.max(2, ...graph.nodes.map((node) => node.lane + 1));
  return { width: CELL.padX * 2 + (columns - 1) * CELL.width, height: CELL.padY * 2 + lanes * CELL.height };
}

type Point = { x: number; y: number };

/** Corner points of the octilinear route between two station centres. */
export function routePoints(from: Point, to: Point, belowY: number): Point[] {
  const lead = 28;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const ady = Math.abs(dy);
  const sign = Math.sign(dy);

  if (dx <= 0) {
    // Backwards: leave right, run under the line, come back in from the left.
    return [
      from,
      { x: from.x + lead, y: from.y },
      { x: from.x + lead, y: belowY },
      { x: to.x - lead, y: belowY },
      { x: to.x - lead, y: to.y },
      to,
    ];
  }
  if (ady === 0) return [from, to];
  if (ady <= dx - 2 * lead) {
    // Room for a single 45° diagonal just before the target.
    const bendX = to.x - lead - ady;
    return [from, { x: bendX, y: from.y }, { x: to.x - lead, y: to.y }, to];
  }
  // Steep: diagonal out, vertical, diagonal in.
  const diag = Math.max(0, (dx - 2 * lead) / 2);
  return [
    from,
    { x: from.x + lead, y: from.y },
    { x: from.x + lead + diag, y: from.y + sign * diag },
    { x: from.x + lead + diag, y: to.y - sign * diag },
    { x: to.x - lead, y: to.y },
    to,
  ].filter((point, index, all) => index === 0 || point.x !== all[index - 1].x || point.y !== all[index - 1].y);
}

/** SVG path through the points, with each corner rounded by up to `radius`. */
export function roundedPath(points: Point[], radius = 18): string {
  if (points.length === 0) return "";
  const fmt = (n: number) => Number(n.toFixed(2));
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const inLen = Math.hypot(corner.x - prev.x, corner.y - prev.y);
    const outLen = Math.hypot(next.x - corner.x, next.y - corner.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const a = { x: corner.x - ((corner.x - prev.x) / inLen) * r, y: corner.y - ((corner.y - prev.y) / inLen) * r };
    const b = { x: corner.x + ((next.x - corner.x) / outLen) * r, y: corner.y + ((next.y - corner.y) / outLen) * r };
    d += ` L ${fmt(a.x)} ${fmt(a.y)} Q ${fmt(corner.x)} ${fmt(corner.y)} ${fmt(b.x)} ${fmt(b.y)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${fmt(last.x)} ${fmt(last.y)}`;
}

function edgePoints(graph: Graph, edge: GraphEdge): Point[] | undefined {
  const from = findNode(graph, edge.from);
  const to = findNode(graph, edge.to);
  if (!from || !to) return undefined;
  const maxLane = Math.max(0, ...graph.nodes.map((node) => node.lane));
  const belowY = cellCenter(0, maxLane).y + CELL.height / 2;
  return routePoints(cellCenter(from.column, from.lane), cellCenter(to.column, to.lane), belowY);
}

export function edgePath(graph: Graph, edge: GraphEdge): string | undefined {
  const points = edgePoints(graph, edge);
  return points ? roundedPath(points) : undefined;
}

/**
 * Where a branch label sits: left of the middle of the segment's diagonal (clear of the
 * stations at both ends), or above the middle of a straight run.
 */
export function edgeLabelPoint(graph: Graph, edge: GraphEdge): { x: number; y: number; anchor: "end" | "middle" } | undefined {
  const points = edgePoints(graph, edge);
  if (!points) return undefined;
  const segments = points.slice(1).map((end, i) => ({ start: points[i], end }));
  const diagonal = segments.find(({ start, end }) => start.x !== end.x && start.y !== end.y);
  if (diagonal) {
    return {
      x: (diagonal.start.x + diagonal.end.x) / 2 - 12,
      y: (diagonal.start.y + diagonal.end.y) / 2 + 4,
      anchor: "end",
    };
  }
  const longest = segments.reduce((best, seg) =>
    Math.hypot(seg.end.x - seg.start.x, seg.end.y - seg.start.y) > Math.hypot(best.end.x - best.start.x, best.end.y - best.start.y)
      ? seg
      : best,
  );
  return { x: (longest.start.x + longest.end.x) / 2, y: (longest.start.y + longest.end.y) / 2 - 14, anchor: "middle" };
}

// ---------------------------------------------------------------------------
// Starter templates (from the legacy POC), in grid coordinates.

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  graph: Graph;
}

export const WORKFLOW_TEMPLATES: readonly WorkflowTemplate[] = [
  {
    id: "email-autoreply",
    name: "이메일 → 자동응답",
    description: "수신 이메일을 분류해 자동 회신하고, 긴급 문의는 담당자에게 알려요.",
    platform: "zapier",
    graph: {
      nodes: [
        { key: "t1", kind: "trigger", app: "gmail", label: "문의 메일 수신", column: 0, lane: 0 },
        { key: "c1", kind: "condition", app: "router", label: "문의 유형 분류", column: 1, lane: 0 },
        { key: "a1", kind: "action", app: "gmail", label: "템플릿 자동 회신", column: 2, lane: 0 },
        { key: "a2", kind: "action", app: "slack", label: "긴급 문의 담당자 알림", column: 2, lane: 1 },
        { key: "a3", kind: "action", app: "sheets", label: "문의 대장 기록", column: 3, lane: 0 },
      ],
      edges: [
        { from: "t1", to: "c1", label: "" },
        { from: "c1", to: "a1", label: "일반" },
        { from: "c1", to: "a2", label: "긴급" },
        { from: "a1", to: "a3", label: "" },
      ],
    },
  },
  {
    id: "order-shipping",
    name: "주문 → 배송 자동화",
    description: "스마트스토어 주문을 확인하고 재고에 따라 송장 발급 또는 품절 안내를 보내요.",
    platform: "n8n",
    graph: {
      nodes: [
        { key: "t1", kind: "trigger", app: "smartstore", label: "신규 주문 접수", column: 0, lane: 0 },
        { key: "a1", kind: "action", app: "ecount", label: "주문 확인 · 재고 조회", column: 1, lane: 0 },
        { key: "c1", kind: "condition", app: "router", label: "재고 있음?", column: 2, lane: 0 },
        { key: "a2", kind: "action", app: "delivery", label: "송장 발급 · 배송 등록", column: 3, lane: 0 },
        { key: "a3", kind: "action", app: "kakao", label: "품절 안내 알림톡", column: 3, lane: 1 },
        { key: "a4", kind: "action", app: "kakao", label: "배송 시작 알림톡", column: 4, lane: 0 },
      ],
      edges: [
        { from: "t1", to: "a1", label: "" },
        { from: "a1", to: "c1", label: "" },
        { from: "c1", to: "a2", label: "있음" },
        { from: "c1", to: "a3", label: "품절" },
        { from: "a2", to: "a4", label: "" },
      ],
    },
  },
  {
    id: "sheet-report",
    name: "엑셀 → 보고서 자동화",
    description: "매일 아침 9시에 전일 실적을 모아 보고서를 만들고 Slack으로 보내요.",
    platform: "apps_script",
    graph: {
      nodes: [
        { key: "t1", kind: "trigger", app: "schedule", label: "매일 오전 9시", column: 0, lane: 0 },
        { key: "a1", kind: "action", app: "sheets", label: "전일 실적 수집", column: 1, lane: 0 },
        { key: "a2", kind: "action", app: "sheets", label: "데이터 가공 · 집계", column: 2, lane: 0 },
        { key: "a3", kind: "action", app: "drive", label: "PDF 보고서 생성", column: 3, lane: 0 },
        { key: "a4", kind: "action", app: "slack", label: "#경영지원 채널 발송", column: 4, lane: 0 },
      ],
      edges: [
        { from: "t1", to: "a1", label: "" },
        { from: "a1", to: "a2", label: "" },
        { from: "a2", to: "a3", label: "" },
        { from: "a3", to: "a4", label: "" },
      ],
    },
  },
];

export function findTemplate(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((template) => template.id === id);
}
