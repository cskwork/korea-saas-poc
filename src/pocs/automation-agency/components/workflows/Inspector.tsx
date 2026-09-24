"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Cable, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { NodeKind } from "../../db/schema";
import {
  appsFor,
  NODE_KIND_LABEL,
  NODE_KINDS,
  orderedNodes,
  stationCode,
  type Graph,
  type GraphNode,
} from "../../domain/workflow";
import ui from "../ui/ui.module.css";
import styles from "./builder.module.css";

/**
 * Form view of the selected station: everything the canvas does, as standard
 * controls (rename, change kind/app, connect by checkbox, move, remove).
 */
export function Inspector({
  graph,
  node,
  code,
  onUpdate,
  onToggleEdge,
  onEdgeLabel,
  onMove,
  onDelete,
  onStartConnect,
}: {
  graph: Graph;
  node: GraphNode;
  code: string;
  onUpdate: (patch: Partial<Pick<GraphNode, "kind" | "app" | "label">>) => void;
  onToggleEdge: (to: string, on: boolean) => void;
  onEdgeLabel: (to: string, label: string) => void;
  onMove: (dColumn: number, dLane: number) => void;
  onDelete: () => void;
  onStartConnect: () => void;
}) {
  const others = orderedNodes(graph).filter((n) => n.key !== node.key);
  const targets = others.filter((n) => n.kind !== "trigger");
  const sources = graph.edges
    .filter((e) => e.to === node.key)
    .map((e) => others.find((n) => n.key === e.from))
    .filter(Boolean) as GraphNode[];
  const apps = appsFor(node.kind);

  return (
    <div className={styles.inspector}>
      <h3 className={styles.inspectorTitle}>
        <span className={styles.inspectorCode}>{stationCode(graph, node.key, code)}</span>역 설정
      </h3>

      <div className={ui.field}>
        <label htmlFor="node-label" className={ui.label}>
          역 이름
        </label>
        <input
          id="node-label"
          className={ui.input}
          value={node.label}
          maxLength={40}
          onChange={(e) => onUpdate({ label: e.target.value })}
          aria-invalid={node.label.trim() === "" || undefined}
          aria-describedby={node.label.trim() === "" ? "node-label-error" : undefined}
        />
        {node.label.trim() === "" ? (
          <p id="node-label-error" className={ui.error}>
            역 이름을 입력해 주세요.
          </p>
        ) : null}
      </div>

      <div className={styles.inspectorRow}>
        <div className={ui.field}>
          <label htmlFor="node-kind" className={ui.label}>
            종류
          </label>
          <select
            id="node-kind"
            className={ui.select}
            value={node.kind}
            onChange={(e) => {
              const kind = e.target.value as NodeKind;
              const allowed = appsFor(kind);
              onUpdate({ kind, app: allowed.some((a) => a.id === node.app) ? node.app : allowed[0].id });
            }}
          >
            {NODE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {NODE_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.field}>
          <label htmlFor="node-app" className={ui.label}>
            앱
          </label>
          <select
            id="node-app"
            className={ui.select}
            value={node.app}
            onChange={(e) => onUpdate({ app: e.target.value })}
          >
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={ui.label}>다음 역으로 잇기</legend>
        {targets.length === 0 ? (
          <p className={ui.hint}>이을 수 있는 역이 없어요. 액션이나 조건 역을 먼저 추가하세요.</p>
        ) : (
          <ul className={styles.targetList}>
            {targets.map((target) => {
              const edge = graph.edges.find((e) => e.from === node.key && e.to === target.key);
              const code2 = stationCode(graph, target.key, code);
              return (
                <li key={target.key} className={styles.targetItem}>
                  <label className={ui.checkRow}>
                    <input
                      type="checkbox"
                      checked={Boolean(edge)}
                      onChange={(e) => onToggleEdge(target.key, e.target.checked)}
                    />
                    <span>
                      <span className={styles.inlineCode}>{code2}</span> {target.label}
                    </span>
                  </label>
                  {edge && node.kind === "condition" ? (
                    <input
                      className={clsx(ui.input, styles.branchInput)}
                      value={edge.label}
                      maxLength={12}
                      placeholder="분기 이름 (예: 긴급)"
                      aria-label={`${target.label}(으)로 가는 분기 이름`}
                      onChange={(e) => onEdgeLabel(target.key, e.target.value)}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </fieldset>

      <p className={ui.hint}>들어오는 노선: {sources.length === 0 ? "없음" : sources.map((s) => s.label).join(", ")}</p>

      <div className={styles.inspectorActions}>
        <button type="button" className={clsx(ui.btn, ui.secondary, ui.small)} onClick={onStartConnect}>
          <Cable size={15} aria-hidden="true" />
          캔버스에서 잇기
        </button>
        <span className={styles.moveGroup} role="group" aria-label="역 옮기기">
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.iconOnly)}
            onClick={() => onMove(-1, 0)}
            aria-label="앞으로 옮기기"
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.iconOnly)}
            onClick={() => onMove(1, 0)}
            aria-label="뒤로 옮기기"
          >
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.iconOnly)}
            onClick={() => onMove(0, -1)}
            aria-label="위 선로로 옮기기"
          >
            <ArrowUp size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.iconOnly)}
            onClick={() => onMove(0, 1)}
            aria-label="아래 선로로 옮기기"
          >
            <ArrowDown size={16} aria-hidden="true" />
          </button>
        </span>
        <button type="button" className={clsx(ui.btn, ui.danger, ui.small)} onClick={onDelete}>
          <Trash2 size={15} aria-hidden="true" />역 삭제
        </button>
      </div>
    </div>
  );
}
