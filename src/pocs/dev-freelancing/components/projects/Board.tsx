"use client";

import clsx from "clsx";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, ChevronRight, GripVertical, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useOptimistic, useState, useTransition, type DragEvent, type KeyboardEvent } from "react";
import { formatWon } from "@/core/format";
import { dDay, shortDay } from "../../domain/dates";
import { PROJECT_STATUS_LABEL } from "../../domain/labels";
import { columnCards, moveCard, neighborStatus, PROJECT_STATUSES, type ProjectStatus } from "../../domain/pipeline";
import { moveProject } from "../../server/actions";
import type { BoardProject } from "../../server/data/projects";
import { projectCell } from "../documents/status";
import { Cell, HourCellsBar } from "../ui/Cells";
import ui from "../ui/ui.module.css";
import styles from "./Board.module.css";

interface Move {
  id: string;
  status: ProjectStatus;
  index: number;
}

/**
 * The pipeline board. Cards move by drag and drop, by the ◀ ▶ buttons, or from the keyboard:
 * focus a card's handle, then ←/→ changes the stage and ↑/↓ changes its place in the column.
 */
export function Board({ projects, today }: { projects: BoardProject[]; today: string }) {
  const [cards, applyMove] = useOptimistic(projects, (state, move: Move) => moveCard(state, move.id, move.status, move.index));
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ status: ProjectStatus; index: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusId) return;
    document.querySelector<HTMLElement>(`[data-handle="${focusId}"]`)?.focus();
  }, [focusId, cards]);

  const commit = (move: Move) => {
    const card = cards.find((c) => c.id === move.id);
    if (!card) return;
    startTransition(async () => {
      applyMove(move);
      const result = await moveProject(move);
      if (result.status === "error") setError(result.message);
      else setError(null);
    });
    setAnnouncement(`'${card.title}' 카드를 ${PROJECT_STATUS_LABEL[move.status]} 열 ${move.index + 1}번째로 옮겼어요.`);
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, card: BoardProject) => {
    const column = columnCards(cards, card.status);
    const index = column.findIndex((c) => c.id === card.id);
    let move: Move | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const to = neighborStatus(card.status, event.key === "ArrowLeft" ? -1 : 1);
      if (to) move = { id: card.id, status: to, index: columnCards(cards, to).length };
    } else if (event.key === "ArrowUp" && index > 0) {
      move = { id: card.id, status: card.status, index: index - 1 };
    } else if (event.key === "ArrowDown" && index < column.length - 1) {
      move = { id: card.id, status: card.status, index: index + 1 };
    }
    if (!move) return;
    event.preventDefault();
    setFocusId(card.id);
    commit(move);
  };

  const dropIndex = (event: DragEvent<HTMLElement>, status: ProjectStatus) => {
    const list = event.currentTarget.querySelectorAll<HTMLElement>("[data-card]");
    let index = 0;
    for (const element of list) {
      if (element.dataset.card === dragId) continue;
      const box = element.getBoundingClientRect();
      if (event.clientY > box.top + box.height / 2) index += 1;
    }
    return { status, index };
  };

  const needle = query.trim().toLowerCase();
  const visible = (card: BoardProject) =>
    !needle || [card.title, card.clientName ?? "", card.clientCompany ?? ""].some((text) => text.toLowerCase().includes(needle));

  return (
    <div className={styles.wrap}>
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={15} aria-hidden="true" />
          <span className={styles.srOnly}>프로젝트 검색</span>
          <input className={ui.input} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트나 고객 이름으로 찾기" />
        </label>
        <p className={styles.hint}>
          카드를 끌어 옮기거나, 손잡이에 포커스를 두고{" "}
          <kbd className={ui.kbd} aria-label="왼쪽 화살표">
            <ArrowLeft size={11} aria-hidden="true" />
          </kbd>{" "}
          <kbd className={ui.kbd} aria-label="오른쪽 화살표">
            <ArrowRight size={11} aria-hidden="true" />
          </kbd>{" "}
          단계,{" "}
          <kbd className={ui.kbd} aria-label="위쪽 화살표">
            <ArrowUp size={11} aria-hidden="true" />
          </kbd>{" "}
          <kbd className={ui.kbd} aria-label="아래쪽 화살표">
            <ArrowDown size={11} aria-hidden="true" />
          </kbd>{" "}
          순서를 바꿔요.
        </p>
      </div>
      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.board}>
        {PROJECT_STATUSES.map((status) => {
          const column = columnCards(cards, status);
          const shown = column.filter(visible);
          const total = column.reduce((sum, card) => sum + card.budget, 0);
          return (
            <section
              key={status}
              className={clsx(styles.column, drop?.status === status && styles.columnOver)}
              aria-labelledby={`col-${status}`}
              onDragOver={(event) => {
                if (!dragId) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                const next = dropIndex(event, status);
                if (next.status !== drop?.status || next.index !== drop?.index) setDrop(next);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDrop(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragId) commit({ id: dragId, ...dropIndex(event, status) });
                setDragId(null);
                setDrop(null);
              }}
            >
              <header className={styles.columnHead}>
                <h2 id={`col-${status}`} className={styles.columnTitle}>
                  <Cell state={projectCell(status)} size={10} />
                  {PROJECT_STATUS_LABEL[status]}
                  <span className={styles.columnCount}>{column.length}</span>
                </h2>
                <span className={styles.columnSum}>{formatWon(total)}</span>
              </header>
              <ol role="list" className={styles.cards}>
                {shown.map((card, index) => {
                  const left = neighborStatus(card.status, -1);
                  const right = neighborStatus(card.status, 1);
                  const client = card.clientCompany || card.clientName;
                  return (
                    <li
                      key={card.id}
                      data-card={card.id}
                      className={clsx(
                        styles.card,
                        dragId === card.id && styles.dragging,
                        drop?.status === status && drop.index === index && dragId !== card.id && styles.dropBefore,
                      )}
                      draggable
                      onDragStart={(event) => {
                        setDragId(card.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", card.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setDrop(null);
                      }}
                    >
                      <div className={styles.cardTop}>
                        <Link href={`/dev-freelancing/projects/${card.id}`} className={styles.cardTitle} draggable={false}>
                          {card.title}
                        </Link>
                        <button
                          type="button"
                          className={styles.handle}
                          data-handle={card.id}
                          aria-label={`${card.title} 옮기기. 왼쪽·오른쪽 화살표로 단계, 위·아래 화살표로 순서`}
                          onKeyDown={(event) => onKey(event, card)}
                        >
                          <GripVertical size={15} aria-hidden="true" />
                        </button>
                      </div>
                      <p className={styles.cardMeta}>
                        {client ?? "고객 미지정"}
                        {card.priority === "high" ? <span className={ui.tag} data-tone="accent">우선</span> : null}
                      </p>
                      {card.estimatedHours !== null || card.trackedMinutes > 0 ? (
                        <HourCellsBar estimatedHours={card.estimatedHours} trackedMinutes={card.trackedMinutes} maxCells={24} caption={false} size={7} />
                      ) : null}
                      <div className={styles.cardFoot}>
                        <span className={ui.num}>{card.budget > 0 ? formatWon(card.budget) : "예산 미정"}</span>
                        <span className={styles.cardDue}>
                          {card.status === "done" && card.completedAt
                            ? "완료"
                            : card.dueOn
                              ? `${shortDay(card.dueOn)} · ${dDay(card.dueOn, today)}`
                              : card.milestonesTotal > 0
                                ? `마일스톤 ${card.milestonesDone}/${card.milestonesTotal}`
                                : ""}
                        </span>
                      </div>
                      <div className={styles.moves}>
                        <button
                          type="button"
                          className={styles.moveButton}
                          disabled={!left}
                          onClick={() => left && commit({ id: card.id, status: left, index: columnCards(cards, left).length })}
                          aria-label={left ? `${PROJECT_STATUS_LABEL[left]}(으)로 되돌리기` : "첫 단계"}
                        >
                          <ChevronLeft size={14} aria-hidden="true" />
                          {left ? PROJECT_STATUS_LABEL[left] : null}
                        </button>
                        <button
                          type="button"
                          className={styles.moveButton}
                          disabled={!right}
                          onClick={() => right && commit({ id: card.id, status: right, index: columnCards(cards, right).length })}
                          aria-label={right ? `${PROJECT_STATUS_LABEL[right]}(으)로 넘기기` : "마지막 단계"}
                        >
                          {right ? PROJECT_STATUS_LABEL[right] : null}
                          <ChevronRight size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
                {shown.length === 0 ? (
                  <li className={clsx(styles.emptyColumn, drop?.status === status && styles.dropBefore)}>
                    {needle ? "검색 결과가 없어요" : status === "inquiry" ? "새 문의가 오면 여기에 쌓여요" : "카드를 이 열로 끌어 오세요"}
                  </li>
                ) : null}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
