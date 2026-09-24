import clsx from "clsx";
import type { CSSProperties } from "react";
import { formatWon } from "@/core/format";
import { monthLabel } from "../../domain/dates";
import type { MonthRevenue } from "../../domain/revenue";
import ui from "../ui/ui.module.css";
import styles from "./Revenue.module.css";

const UNITS = [100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000] as const;

/** Monthly paid revenue as stacks of squares (one square per unit of won), with the goal as a line. */
export function MonthCells({ months, goal }: { months: MonthRevenue[]; goal: number }) {
  const largest = Math.max(goal, ...months.map((m) => m.paid));
  const unit = UNITS.find((u) => largest / u <= 14) ?? UNITS[UNITS.length - 1];
  const rows = Math.max(1, Math.ceil(largest / unit));
  const goalRow = goal > 0 ? goal / unit : null;
  const summary = months.map((m) => `${monthLabel(m.month)} ${formatWon(m.paid)}`).join(", ");

  return (
    <figure className={styles.chart}>
      <div className={styles.chartBody} role="img" aria-label={`월별 입금(공급가액): ${summary}`} style={{ "--rows": rows } as CSSProperties}>
        {goalRow !== null ? (
          <span className={styles.goalLine} style={{ "--at": goalRow } as CSSProperties} aria-hidden="true">
            <span>목표 {formatWon(goal)}</span>
          </span>
        ) : null}
        {months.map((month, index) => {
          const exact = month.paid / unit;
          const whole = Math.floor(exact);
          const partial = exact - whole >= 0.25;
          const current = index === months.length - 1;
          return (
            <div key={month.month} className={clsx(styles.column, current && styles.current)} aria-hidden="true">
              <span className={styles.columnValue}>{month.paid > 0 ? formatCompactWon(month.paid) : ""}</span>
              <div className={styles.stack}>
                {Array.from({ length: whole }, (_, i) => (
                  <span key={i} className={ui.cell} data-state={current ? "bright" : "solid"} />
                ))}
                {partial ? <span className={ui.cell} data-state="partial" /> : null}
              </div>
              <span className={styles.columnLabel}>{monthLabel(month.month)}</span>
            </div>
          );
        })}
      </div>
      <figcaption className={styles.chartCaption}>
        칸 하나 = {formatWon(unit)} · 입금일 기준 공급가액 · 밝은 칸은 이번 달
      </figcaption>
      <details className={styles.tableToggle}>
        <summary>표로 보기</summary>
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">월</th>
              <th scope="col" className={ui.num}>
                입금 (공급가액)
              </th>
              <th scope="col" className={ui.num}>
                발행 (공급가액)
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month}>
                <td>{m.month.replace("-", ". ")}</td>
                <td className={ui.num}>{formatWon(m.paid)}</td>
                <td className={ui.num}>{formatWon(m.issued)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** 3,400,000 → "340만" */
function formatCompactWon(value: number) {
  if (value >= 100_000_000) return `${Math.round(value / 10_000_000) / 10}억`;
  return `${Math.round(value / 10_000)}만`;
}
