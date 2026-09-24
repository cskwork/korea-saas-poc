"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Cable, Eraser, GitBranch, LayoutTemplate, Play, Plus, Save, Undo2, X } from "lucide-react";
import clsx from "clsx";
import type { NodeKind, Platform } from "../../db/schema";
import { PLATFORM_INFO, PLATFORMS } from "../../domain/labels";
import {
  addNode,
  connect,
  disconnect,
  findNode,
  findTemplate,
  GRAPH_ERROR_MESSAGE,
  lintGraph,
  moveNode,
  orderedNodes,
  placeNode,
  removeNode,
  setEdgeLabel,
  stationCode,
  updateNode,
  WORKFLOW_TEMPLATES,
  type Graph,
  type GraphResult,
} from "../../domain/workflow";
import { saveWorkflowAction } from "../../server/actions";
import { Notice } from "../ui/Notice";
import ui from "../ui/ui.module.css";
import { Canvas, edgeId } from "./Canvas";
import { Inspector } from "./Inspector";
import styles from "./builder.module.css";

export interface BuilderWorkflow {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  projectId: string | null;
  graph: Graph;
}

type Message = { tone: "ok" | "error" | "info"; text: string };

const newKey = () => crypto.randomUUID();

/** The workflow builder: canvas + inspector + meta, saved as one graph. */
export function Builder({
  workflow,
  projects,
}: {
  workflow: BuilderWorkflow;
  projects: { id: string; clientName: string }[];
}) {
  const [graph, setGraph] = useState<Graph>(workflow.graph);
  const [history, setHistory] = useState<Graph[]>([]);
  const [meta, setMeta] = useState({
    name: workflow.name,
    description: workflow.description,
    platform: workflow.platform,
    projectId: workflow.projectId,
  });
  const [selected, setSelected] = useState<string | null>(orderedNodes(workflow.graph)[0]?.key ?? null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [fresh, setFresh] = useState<ReadonlySet<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [template, setTemplate] = useState("");
  const [saving, startSaving] = useTransition();

  const code = PLATFORM_INFO[meta.platform].code;
  const node = selected ? findNode(graph, selected) : undefined;
  const issues = lintGraph(graph);

  /** Applies a new graph. `record: false` skips the undo stack (typing a label). */
  const commit = (next: Graph, note?: Message, record = true) => {
    if (record) setHistory((h) => [...h.slice(-29), graph]);
    setGraph(next);
    setDirty(true);
    setMessage(note ?? null);
  };

  const apply = (result: GraphResult, note?: Message) => {
    if (!result.ok) {
      setMessage({ tone: "error", text: GRAPH_ERROR_MESSAGE[result.error] });
      return false;
    }
    commit(result.graph, note);
    return true;
  };

  const markFresh = (id: string) => setFresh((set) => new Set(set).add(id));

  const add = (kind: NodeKind) => {
    const key = newKey();
    const result = addNode(graph, { key, kind }, selected ?? undefined);
    if (apply(result)) {
      setSelected(key);
      if (selected && kind !== "trigger") markFresh(edgeId(selected, key));
    }
  };

  const connectTo = (to: string) => {
    if (!connectFrom) return;
    const from = connectFrom;
    setConnectFrom(null);
    if (apply(connect(graph, from, to), { tone: "ok", text: "노선을 이었어요." })) markFresh(edgeId(from, to));
  };

  const activate = (key: string) => {
    if (connectFrom && connectFrom !== key) connectTo(key);
    else if (connectFrom === key) setConnectFrom(null);
    else setSelected(key);
  };

  const remove = (key: string) => {
    const target = findNode(graph, key);
    commit(removeNode(graph, key), {
      tone: "info",
      text: `‘${target?.label ?? "역"}’을 지웠어요. 되돌리기로 복구할 수 있어요.`,
    });
    setSelected(orderedNodes(graph).find((n) => n.key !== key)?.key ?? null);
    if (connectFrom === key) setConnectFrom(null);
  };

  const undo = useCallback(() => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory(history.slice(0, -1));
    setGraph(previous);
    setDirty(true);
    setMessage({ tone: "info", text: "직전 변경을 되돌렸어요." });
  }, [history]);

  const save = useCallback(() => {
    const blank = graph.nodes.find((n) => n.label.trim() === "");
    if (blank) {
      setSelected(blank.key);
      setMessage({ tone: "error", text: "이름이 비어 있는 역이 있어요. 이름을 입력한 뒤 저장해 주세요." });
      return;
    }
    if (meta.name.trim() === "") {
      setMessage({ tone: "error", text: "워크플로 이름을 입력해 주세요." });
      return;
    }
    startSaving(async () => {
      const result = await saveWorkflowAction({ id: workflow.id, ...meta, graph });
      if (result.status === "success") {
        setDirty(false);
        setMessage({ tone: "ok", text: result.message ?? "저장했어요." });
      } else if (result.status === "error") {
        setMessage({ tone: "error", text: result.message });
      }
    });
  }, [graph, meta, workflow.id]);

  // Ctrl/⌘+S saves, Ctrl/⌘+Z undoes; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "s") {
        event.preventDefault();
        save();
      } else if (event.key === "z" && !typing) {
        event.preventDefault();
        undo();
      }
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [dirty, save, undo]);

  const loadTemplate = () => {
    const found = findTemplate(template);
    if (!found) return;
    commit(
      { nodes: found.graph.nodes.map((n) => ({ ...n })), edges: found.graph.edges.map((e) => ({ ...e })) },
      { tone: "info", text: `‘${found.name}’ 템플릿으로 바꿨어요. 마음에 들지 않으면 되돌리기를 누르세요.` },
    );
    setFresh(new Set(found.graph.edges.map((e) => edgeId(e.from, e.to))));
    setSelected(found.graph.nodes[0]?.key ?? null);
    setTemplate("");
  };

  const updateMeta = (patch: Partial<typeof meta>) => {
    setMeta((m) => ({ ...m, ...patch }));
    setDirty(true);
  };

  return (
    <div className={styles.builder}>
      <div className={styles.metaBar}>
        <div className={clsx(ui.field, styles.nameField)}>
          <label htmlFor="wf-name" className={ui.label}>
            워크플로 이름
          </label>
          <input
            id="wf-name"
            className={clsx(ui.input, styles.nameInput)}
            value={meta.name}
            maxLength={60}
            onChange={(e) => updateMeta({ name: e.target.value })}
          />
        </div>
        <div className={ui.field}>
          <label htmlFor="wf-platform" className={ui.label}>
            플랫폼 (노선)
          </label>
          <select
            id="wf-platform"
            className={ui.select}
            value={meta.platform}
            onChange={(e) => updateMeta({ platform: e.target.value as Platform })}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_INFO[p].label}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.field}>
          <label htmlFor="wf-project" className={ui.label}>
            연결 프로젝트
          </label>
          <select
            id="wf-project"
            className={ui.select}
            value={meta.projectId ?? ""}
            onChange={(e) => updateMeta({ projectId: e.target.value || null })}
          >
            <option value="">연결 안 함</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.clientName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.toolbar} role="toolbar" aria-label="노선 편집">
        <span className={styles.toolGroup}>
          <button type="button" className={clsx(ui.btn, ui.secondary, ui.small)} onClick={() => add("trigger")}>
            <Play size={15} aria-hidden="true" />
            트리거
          </button>
          <button type="button" className={clsx(ui.btn, ui.secondary, ui.small)} onClick={() => add("action")}>
            <Plus size={15} aria-hidden="true" />
            액션
          </button>
          <button type="button" className={clsx(ui.btn, ui.secondary, ui.small)} onClick={() => add("condition")}>
            <GitBranch size={15} aria-hidden="true" />
            조건
          </button>
        </span>
        <span className={styles.toolGroup}>
          {connectFrom ? (
            <button type="button" className={clsx(ui.btn, ui.primary, ui.small)} onClick={() => setConnectFrom(null)}>
              <X size={15} aria-hidden="true" />
              잇기 취소
            </button>
          ) : (
            <button
              type="button"
              className={clsx(ui.btn, ui.ghost, ui.small)}
              onClick={() => selected && setConnectFrom(selected)}
              disabled={!selected}
            >
              <Cable size={15} aria-hidden="true" />
              노선 잇기
            </button>
          )}
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.small)}
            onClick={undo}
            disabled={history.length === 0}
          >
            <Undo2 size={15} aria-hidden="true" />
            되돌리기
          </button>
          <button
            type="button"
            className={clsx(ui.btn, ui.ghost, ui.small)}
            onClick={() => {
              commit(
                { nodes: [], edges: [] },
                { tone: "info", text: "노선도를 비웠어요. 되돌리기로 복구할 수 있어요." },
              );
              setSelected(null);
            }}
            disabled={graph.nodes.length === 0}
          >
            <Eraser size={15} aria-hidden="true" />
            비우기
          </button>
        </span>
        <span className={styles.saveGroup}>
          <span className={clsx(styles.dirty, !dirty && styles.clean)} aria-live="polite">
            {dirty ? "저장하지 않은 변경" : "저장됨"}
          </span>
          <button type="button" className={clsx(ui.btn, ui.primary)} onClick={save} disabled={saving}>
            <Save size={16} aria-hidden="true" className={saving ? ui.spin : undefined} />
            {saving ? "저장 중…" : "저장"}
          </button>
        </span>
      </div>

      {connectFrom ? (
        <Notice tone="info" className={styles.connectHint}>
          ‘{findNode(graph, connectFrom)?.label}’에서 이을 역을 누르세요. 방향키로 고르고 Enter, 취소는 Esc.
        </Notice>
      ) : message ? (
        <Notice tone={message.tone} className={styles.connectHint}>
          {message.text}
        </Notice>
      ) : null}

      <div className={styles.workspace}>
        <div className={styles.canvasColumn}>
          {graph.nodes.length === 0 ? (
            <div className={styles.emptyCanvas}>
              <p className={ui.emptyTitle}>노선이 비어 있어요</p>
              <p>출발역이 될 트리거부터 놓으세요. 이메일 수신, 매일 9시, 신규 주문처럼 일이 시작되는 순간이에요.</p>
              <button type="button" className={clsx(ui.btn, ui.primary)} onClick={() => add("trigger")}>
                <Play size={16} aria-hidden="true" />
                트리거 놓기
              </button>
            </div>
          ) : (
            <Canvas
              graph={graph}
              platform={meta.platform}
              selected={selected}
              connectFrom={connectFrom}
              fresh={fresh}
              onSelect={setSelected}
              onActivate={activate}
              onMove={(key, dc, dl) => apply(moveNode(graph, key, dc, dl))}
              onDrop={(key, column, lane) => apply(placeNode(graph, key, column, lane, { swap: true }))}
              onDelete={remove}
              onStartConnect={(key) => {
                setSelected(key);
                setConnectFrom(key);
              }}
              onCancel={() => setConnectFrom(null)}
              onDrawn={(id) =>
                setFresh((set) => {
                  const next = new Set(set);
                  next.delete(id);
                  return next;
                })
              }
            />
          )}
          <p className={styles.keys}>
            <kbd>←→↑↓</kbd> 역 사이 이동 · <kbd>Shift</kbd>+방향키 역 옮기기 · <kbd>C</kbd> 노선 잇기 ·{" "}
            <kbd>Delete</kbd> 삭제 · <kbd>Ctrl</kbd>+<kbd>S</kbd> 저장 · 끌어서 옮기기
          </p>

          <section className={styles.checks} aria-labelledby="wf-checks">
            <h3 id="wf-checks" className={styles.subTitle}>
              운행 점검
            </h3>
            {issues.length === 0 ? (
              <p className={styles.allClear}>모든 역이 이어져 있어요. 이대로 구축할 수 있어요.</p>
            ) : (
              <ul className={styles.issueList}>
                {issues.map((issue, index) => (
                  <li key={`${issue.key ?? "graph"}-${index}`}>
                    {issue.key ? (
                      <button
                        type="button"
                        className={styles.issueLink}
                        onClick={() => issue.key && setSelected(issue.key)}
                      >
                        {stationCode(graph, issue.key, code)} · {issue.message}
                      </button>
                    ) : (
                      issue.message
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className={styles.side} aria-label="역 설정">
          {node ? (
            <Inspector
              graph={graph}
              node={node}
              code={code}
              onUpdate={(patch) => commit(updateNode(graph, node.key, patch), undefined, patch.label === undefined)}
              onToggleEdge={(to, on) => {
                if (on) {
                  if (apply(connect(graph, node.key, to))) markFresh(edgeId(node.key, to));
                } else commit(disconnect(graph, node.key, to));
              }}
              onEdgeLabel={(to, label) => commit(setEdgeLabel(graph, node.key, to, label), undefined, false)}
              onMove={(dc, dl) => apply(moveNode(graph, node.key, dc, dl))}
              onDelete={() => remove(node.key)}
              onStartConnect={() => setConnectFrom(node.key)}
            />
          ) : (
            <p className={ui.hint}>역을 누르면 이름, 앱, 연결을 여기서 바꿀 수 있어요.</p>
          )}

          <div className={styles.sideBlock}>
            <label htmlFor="wf-description" className={ui.label}>
              노선 설명
            </label>
            <textarea
              id="wf-description"
              className={ui.textarea}
              value={meta.description}
              maxLength={200}
              onChange={(e) => updateMeta({ description: e.target.value })}
            />
          </div>

          <div className={styles.sideBlock}>
            <label htmlFor="wf-template" className={ui.label}>
              템플릿으로 바꾸기
            </label>
            <div className={styles.templateRow}>
              <select
                id="wf-template"
                className={ui.select}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option value="">템플릿 선택</option>
                {WORKFLOW_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button type="button" className={clsx(ui.btn, ui.secondary)} onClick={loadTemplate} disabled={!template}>
                <LayoutTemplate size={16} aria-hidden="true" />
                적용
              </button>
            </div>
            <p className={ui.hint}>지금 노선도를 템플릿으로 바꿔요. 저장하기 전까지는 되돌릴 수 있어요.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
