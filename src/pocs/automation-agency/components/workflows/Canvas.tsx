"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import clsx from "clsx";
import type { Platform } from "../../db/schema";
import {
  appLabel,
  canvasSize,
  CELL,
  cellCenter,
  edgeLabelPoint,
  edgePath,
  findNode,
  NODE_KIND_LABEL,
  orderedNodes,
  stationCode,
  type Graph,
  type GraphNode,
} from "../../domain/workflow";
import { PLATFORM_INFO } from "../../domain/labels";
import { AppIcon } from "./AppIcon";
import styles from "./builder.module.css";

export const edgeId = (from: string, to: string) => `${from}>${to}`;

interface Props {
  graph: Graph;
  platform: Platform;
  selected: string | null;
  connectFrom: string | null;
  fresh: ReadonlySet<string>;
  onSelect: (key: string) => void;
  onActivate: (key: string) => void;
  onMove: (key: string, dColumn: number, dLane: number) => void;
  onDrop: (key: string, column: number, lane: number) => void;
  onDelete: (key: string) => void;
  onStartConnect: (key: string) => void;
  onCancel: () => void;
  onDrawn: (id: string) => void;
}

interface Drag {
  key: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  moved: boolean;
}

/** Nearest station in a direction, for arrow-key navigation across the grid. */
function neighbour(graph: Graph, from: GraphNode, dColumn: number, dLane: number): GraphNode | undefined {
  const candidates = graph.nodes.filter((node) => {
    if (node.key === from.key) return false;
    if (dColumn !== 0) return Math.sign(node.column - from.column) === dColumn;
    return Math.sign(node.lane - from.lane) === dLane;
  });
  const cost = (node: GraphNode) =>
    dColumn !== 0
      ? Math.abs(node.column - from.column) * 10 + Math.abs(node.lane - from.lane)
      : Math.abs(node.lane - from.lane) * 10 + Math.abs(node.column - from.column);
  return candidates.sort((a, b) => cost(a) - cost(b))[0];
}

/**
 * The line map: SVG segments under HTML station buttons laid on the grid.
 * Pointer: drag a station to another cell. Keyboard: arrows move the focus,
 * Shift+arrows move the station, C connects, Delete removes, Esc cancels.
 */
export function Canvas({
  graph,
  platform,
  selected,
  connectFrom,
  fresh,
  onSelect,
  onActivate,
  onMove,
  onDrop,
  onDelete,
  onStartConnect,
  onCancel,
  onDrawn,
}: Props) {
  const size = canvasSize(graph);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [drag, setDrag] = useState<Drag | null>(null);
  // A drag ends with a click event; this swallows it so dropping does not also select/connect.
  const justDragged = useRef(false);
  const code = PLATFORM_INFO[platform].code;
  const focusable = selected ?? orderedNodes(graph)[0]?.key;

  const focusNode = (key: string) => {
    onSelect(key);
    requestAnimationFrame(() => buttons.current.get(key)?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, node: GraphNode) => {
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const arrow = arrows[event.key];
    if (arrow && event.shiftKey) {
      event.preventDefault();
      onMove(node.key, arrow[0], arrow[1]);
      requestAnimationFrame(() => buttons.current.get(node.key)?.focus());
    } else if (arrow) {
      event.preventDefault();
      const next = neighbour(graph, node, arrow[0], arrow[1]);
      if (next) focusNode(next.key);
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onDelete(node.key);
    } else if (event.key === "c" || event.key === "C" || event.key === "ㅊ") {
      event.preventDefault();
      onStartConnect(node.key);
    } else if (event.key === "Escape") {
      onCancel();
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, node: GraphNode) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ key: node.key, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false });
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setDrag({ ...drag, dx, dy, moved: drag.moved || Math.hypot(dx, dy) > 6 });
  };

  const onPointerUp = (node: GraphNode) => {
    if (!drag) return;
    setDrag(null);
    if (!drag.moved) return;
    justDragged.current = true;
    const column = Math.round(node.column + drag.dx / CELL.width);
    const lane = Math.round(node.lane + drag.dy / CELL.height);
    if (column !== node.column || lane !== node.lane) onDrop(node.key, column, lane);
  };

  const source = connectFrom ? findNode(graph, connectFrom) : undefined;

  return (
    <div className={styles.canvasScroll}>
      <div
        className={clsx(styles.canvas, connectFrom && styles.connecting)}
        style={{ width: size.width, height: size.height, "--line": `var(--aa-line-${platform})` } as CSSProperties}
        role="group"
        aria-label="노선도"
      >
        <svg className={styles.edges} width={size.width} height={size.height} aria-hidden="true">
          {graph.edges.map((edge) => {
            const d = edgePath(graph, edge);
            if (!d) return null;
            const id = edgeId(edge.from, edge.to);
            const label = edge.label ? edgeLabelPoint(graph, edge) : undefined;
            return (
              <g key={id}>
                <path
                  d={d}
                  pathLength={1}
                  className={clsx(styles.edge, fresh.has(id) && styles.edgeFresh)}
                  onAnimationEnd={() => onDrawn(id)}
                />
                {edge.label && label ? (
                  <text x={label.x} y={label.y} textAnchor={label.anchor} className={styles.edgeLabel}>
                    {edge.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {graph.nodes.map((node) => {
          const center = cellCenter(node.column, node.lane);
          const isDragging = drag?.key === node.key && drag.moved;
          const incoming = graph.edges.filter((e) => e.to === node.key).length;
          const outgoing = graph.edges.filter((e) => e.from === node.key).length;
          const codeText = stationCode(graph, node.key, code);
          const connectable = source && source.key !== node.key && node.kind !== "trigger";
          return (
            <button
              key={node.key}
              ref={(el) => {
                if (el) buttons.current.set(node.key, el);
                else buttons.current.delete(node.key);
              }}
              type="button"
              className={clsx(
                styles.node,
                styles[node.kind],
                selected === node.key && styles.selected,
                connectFrom === node.key && styles.source,
                connectable && styles.target,
                isDragging && styles.dragging,
              )}
              style={
                {
                  left: center.x,
                  top: center.y,
                  transform: isDragging ? `translate(calc(-50% + ${drag.dx}px), ${drag.dy - 17}px)` : undefined,
                } as CSSProperties
              }
              tabIndex={node.key === focusable ? 0 : -1}
              aria-pressed={selected === node.key}
              aria-label={`${codeText} ${NODE_KIND_LABEL[node.kind]} · ${appLabel(node.app)} · ${node.label}. 들어오는 노선 ${incoming}개, 나가는 노선 ${outgoing}개${
                connectable ? ". Enter로 여기에 연결" : ""
              }`}
              onClick={() => {
                if (justDragged.current) {
                  justDragged.current = false;
                  return;
                }
                onActivate(node.key);
              }}
              onFocus={() => {
                if (!connectFrom) onSelect(node.key);
              }}
              onKeyDown={(event) => onKeyDown(event, node)}
              onPointerDown={(event) => onPointerDown(event, node)}
              onPointerMove={onPointerMove}
              onPointerUp={() => onPointerUp(node)}
              onPointerCancel={() => setDrag(null)}
            >
              <span className={styles.mark} aria-hidden="true" />
              <span className={styles.nodeText}>
                <span className={styles.nodeCode}>{codeText}</span>
                <span className={styles.nodeLabel}>{node.label}</span>
                <span className={styles.nodeApp}>
                  <AppIcon app={node.app} size={12} />
                  {appLabel(node.app)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
