"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { niceTicks, percentOf } from "./scale";
import styles from "./charts.module.css";

export interface StackKey {
  key: string;
  label: string;
  color: string;
}

export interface StackColumn {
  label: string;
  values: Record<string, number>;
}

interface StackedColumnsProps {
  keys: StackKey[];
  columns: StackColumn[];
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  summary: string;
  tableCaption: string;
  height?: number;
  /** Index of the column to emphasise (e.g. the current month). */
  current?: number;
}

/**
 * Stacked columns from a single baseline, bottom segment first. Each column is
 * its own hover/focus target and its tooltip lists every series; the total
 * sits on the cap. The same numbers are in the table view.
 */
export function StackedColumns({
  keys,
  columns,
  formatValue,
  formatTick,
  summary,
  tableCaption,
  height = 240,
  current,
}: StackedColumnsProps) {
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();
  const totals = columns.map((column) => keys.reduce((sum, k) => sum + (column.values[k.key] ?? 0), 0));
  const ticks = niceTicks(Math.max(0, ...totals));
  const top = ticks[ticks.length - 1];

  return (
    <figure className={styles.figure}>
      <ul className={styles.legend} role="list">
        {keys.map((k) => (
          <li key={k.key}>
            <span className={styles.boxKey} style={{ background: k.color }} aria-hidden />
            {k.label}
          </li>
        ))}
      </ul>
      <div className={styles.frame} style={{ height }}>
        <div className={styles.yAxis} aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${percentOf(tick, top)}%` }}>
              {formatTick(tick)}
            </span>
          ))}
        </div>
        <div className={styles.plot} role="group" aria-label={summary} aria-describedby={tableId}>
          {ticks.map((tick) => (
            <span key={tick} className={styles.gridline} style={{ bottom: `${percentOf(tick, top)}%` }} aria-hidden />
          ))}
          <div className={styles.columns}>
            {columns.map((column, i) => (
              <button
                key={column.label}
                type="button"
                className={clsx(styles.column, current === i && styles.columnCurrent)}
                aria-label={`${column.label} 합계 ${formatValue(totals[i])}: ${keys
                  .map((k) => `${k.label} ${formatValue(column.values[k.key] ?? 0)}`)
                  .join(", ")}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className={styles.stack} style={{ height: `${percentOf(totals[i], top)}%` }}>
                  <span className={styles.capLabel}>{formatTick(totals[i])}</span>
                  {[...keys]
                    .reverse()
                    .filter((k) => (column.values[k.key] ?? 0) > 0)
                    .map((k, index) => (
                      <span
                        key={k.key}
                        className={clsx(styles.segment, index === 0 && styles.segmentTop)}
                        style={{ flexGrow: column.values[k.key], background: k.color }}
                        aria-hidden
                      />
                    ))}
                </span>
                {active === i && (
                  <span className={clsx(styles.tooltip, styles.columnTooltip, i >= columns.length - 2 && styles.tooltipLeft)} aria-hidden>
                    <span className={styles.tooltipTitle}>{column.label}</span>
                    {keys.map((k) => (
                      <span key={k.key} className={styles.tooltipRow}>
                        <span className={styles.lineKey} style={{ background: k.color }} />
                        <strong>{formatValue(column.values[k.key] ?? 0)}</strong>
                        <span>{k.label}</span>
                      </span>
                    ))}
                    <span className={clsx(styles.tooltipRow, styles.tooltipTotal)}>
                      <strong>{formatValue(totals[i])}</strong>
                      <span>합계</span>
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.columnLabels} aria-hidden>
        {columns.map((column, i) => (
          <span key={column.label} className={clsx(current === i && styles.columnLabelCurrent)}>
            {column.label}
          </span>
        ))}
      </div>
      <details className={styles.tableToggle}>
        <summary>표로 보기</summary>
        <table className={styles.table} id={tableId}>
          <caption>{tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">월</th>
              {keys.map((k) => (
                <th key={k.key} scope="col">
                  {k.label}
                </th>
              ))}
              <th scope="col">합계</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((column, i) => (
              <tr key={column.label}>
                <th scope="row">{column.label}</th>
                {keys.map((k) => (
                  <td key={k.key}>{formatValue(column.values[k.key] ?? 0)}</td>
                ))}
                <td>{formatValue(totals[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
