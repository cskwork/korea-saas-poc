import clsx from "clsx";
import type { CSSProperties } from "react";
import { formatWon } from "@/core/format";
import type { GoalProgress } from "../../domain/revenue";
import { hourCells, hoursLabel } from "../../domain/time";
import styles from "./Cells.module.css";
import ui from "./ui.module.css";

/**
 * The cell vocabulary: every state in DevFlow is a square that fills.
 * hollow = opened, partial = in motion, solid = done / paid, warn = overdue or over estimate.
 */
export type CellState = "empty" | "hollow" | "partial" | "solid" | "bright" | "muted" | "warn" | "warnSolid";

export function Cell({ state, size, className }: { state: CellState; size?: number; className?: string }) {
  const style = size ? ({ "--size": `${size}px` } as CSSProperties) : undefined;
  return <span className={clsx(ui.cell, className)} data-state={state === "empty" ? undefined : state} style={style} aria-hidden="true" />;
}

export function StateLabel({ state, children }: { state: CellState; children: React.ReactNode }) {
  return (
    <span className={ui.stateLabel}>
      <Cell state={state} size={10} />
      {children}
    </span>
  );
}

/** Estimated vs tracked hours as a run of squares (one square per unit of hours). */
export function HourCellsBar({
  estimatedHours,
  trackedMinutes,
  maxCells = 48,
  caption = true,
  size,
}: {
  estimatedHours: number | null;
  trackedMinutes: number;
  maxCells?: number;
  caption?: boolean;
  size?: number;
}) {
  const tracked = trackedMinutes / 60;
  const cells = hourCells(estimatedHours, tracked, maxCells);
  const summary =
    estimatedHours === null
      ? `추적 ${hoursLabel(trackedMinutes)}시간 (예상 시간 없음)`
      : `예상 ${estimatedHours}시간 중 ${hoursLabel(trackedMinutes)}시간 추적${cells.over > 0 ? ", 예상 초과" : ""}`;
  const states: CellState[] = [
    ...Array<CellState>(cells.filled).fill("solid"),
    ...Array<CellState>(cells.partial).fill("partial"),
    ...Array<CellState>(Math.max(0, cells.planned - cells.filled - cells.partial)).fill("hollow"),
    ...Array<CellState>(cells.over).fill("warnSolid"),
    ...Array<CellState>(cells.unplanned).fill("muted"),
  ];
  const style = size ? ({ "--size": `${size}px` } as CSSProperties) : undefined;
  return (
    <div className={styles.hours}>
      <div className={styles.run} role="img" aria-label={summary} style={style}>
        {states.map((state, index) => (
          <span key={index} className={clsx(ui.cell, styles.rise)} data-state={state} aria-hidden="true" />
        ))}
      </div>
      {caption ? (
        <p className={styles.caption}>
          <span className={ui.measure}>{hoursLabel(trackedMinutes)}h</span>
          {estimatedHours !== null ? (
            <>
              {" "}/ <span className={ui.measure}>{estimatedHours}h</span>
            </>
          ) : null}
          <span className={styles.unit}>1칸 = {cells.unit}시간</span>
          {cells.over > 0 ? <span className={styles.over}>예상 초과</span> : null}
        </p>
      ) : null}
    </div>
  );
}

/** This month's paid supply against the goal, as ten squares. */
export function GoalCellsBar({ progress, size = 18 }: { progress: GoalProgress; size?: number }) {
  const states: CellState[] = Array.from({ length: progress.cells }, (_, i) =>
    i < progress.filled ? "solid" : i === progress.filled && progress.partial ? "partial" : "hollow",
  );
  const style = { "--size": `${size}px` } as CSSProperties;
  return (
    <div
      className={styles.goal}
      role="img"
      aria-label={`월 목표 ${formatWon(progress.goal)} 중 ${formatWon(progress.amount)} (${Math.round(progress.ratio * 100)}%)`}
      style={style}
    >
      {states.map((state, index) => (
        <span key={index} className={clsx(ui.cell, styles.rise)} data-state={state} aria-hidden="true" />
      ))}
    </div>
  );
}
