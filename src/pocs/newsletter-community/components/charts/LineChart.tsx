"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import clsx from "clsx";
import { niceTicks, percentOf } from "./scale";
import styles from "./charts.module.css";

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  values: number[];
}

interface LineChartProps {
  series: LineSeries[];
  /** One label per x position (tooltips and the table). */
  labels: string[];
  /** Shorter labels for the x axis (defaults to `labels`). */
  axisLabels?: string[];
  /** Every how many x positions an axis label is printed (every other one is dropped on phones). */
  axisLabelEvery?: number;
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  /** Accessible summary of what the chart shows. */
  summary: string;
  height?: number;
  tableCaption: string;
}

/**
 * A responsive line chart: marks are an SVG stretched to the plot box
 * (non-scaling strokes), while every piece of text is HTML so it never scales.
 * A crosshair snaps to the nearest x; arrow keys move it when the chart has focus.
 */
export function LineChart({
  series,
  labels,
  axisLabels = labels,
  axisLabelEvery = 1,
  formatValue,
  formatTick = formatValue,
  summary,
  height = 220,
  tableCaption,
}: LineChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();
  const count = labels.length;
  const ticks = niceTicks(Math.max(0, ...series.flatMap((s) => s.values)));
  const top = ticks[ticks.length - 1];
  const x = (i: number) => (count > 1 ? (i / (count - 1)) * 100 : 50);
  const y = (value: number) => 100 - percentOf(value, top);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setActive(Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1)))));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") setActive((i) => Math.min(count - 1, (i ?? -1) + 1));
    else if (event.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? count) - 1));
    else if (event.key === "Escape") setActive(null);
    else return;
    event.preventDefault();
  };

  const last = count - 1;

  return (
    <figure className={styles.figure}>
      {series.length > 1 && (
        <ul className={styles.legend} role="list">
          {series.map((s) => (
            <li key={s.key}>
              <span className={styles.lineKey} style={{ background: s.color }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.frame} style={{ height }}>
        <div className={styles.yAxis} aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} style={{ bottom: `${percentOf(tick, top)}%` }}>
              {formatTick(tick)}
            </span>
          ))}
        </div>
        <div
          className={styles.plot}
          role="img"
          aria-label={summary}
          aria-describedby={tableId}
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((i) => i ?? last)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          {ticks.map((tick) => (
            <span key={tick} className={styles.gridline} style={{ bottom: `${percentOf(tick, top)}%` }} aria-hidden />
          ))}
          <svg className={styles.marks} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {series.map((s) => (
              <g key={s.key}>
                {series.length === 1 && (
                  <path
                    d={`M0,100 ${s.values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(s.values.length - 1)},100 Z`}
                    fill={s.color}
                    opacity={0.1}
                  />
                )}
                <polyline
                  points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>
          {series.map((s) => (
            <span
              key={s.key}
              className={styles.endDot}
              style={{ left: `${x(last)}%`, top: `${y(s.values[last] ?? 0)}%`, background: s.color }}
              aria-hidden
            />
          ))}
          {active !== null && (
            <>
              <span className={styles.crosshair} style={{ left: `${x(active)}%` }} aria-hidden />
              {series.map((s) => (
                <span
                  key={s.key}
                  className={styles.hoverDot}
                  style={{ left: `${x(active)}%`, top: `${y(s.values[active] ?? 0)}%`, background: s.color }}
                  aria-hidden
                />
              ))}
              <div
                className={clsx(styles.tooltip, x(active) > 60 && styles.tooltipLeft)}
                style={{ left: `${x(active)}%` }}
                aria-hidden
              >
                <p className={styles.tooltipTitle}>{labels[active]}</p>
                {series.map((s) => (
                  <p key={s.key} className={styles.tooltipRow}>
                    <span className={styles.lineKey} style={{ background: s.color }} />
                    <strong>{formatValue(s.values[active] ?? 0)}</strong>
                    <span>{s.label}</span>
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.endLabels} aria-hidden>
          {series.map((s) => (
            <span key={s.key} style={{ top: `${y(s.values[last] ?? 0)}%` }}>
              {formatValue(s.values[last] ?? 0)}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden>
        {axisLabels.map((label, i) => {
          const shown = i === last || (i % axisLabelEvery === 0 && last - i >= Math.ceil(axisLabelEvery / 2));
          if (!shown) return null;
          const minor = i !== 0 && i !== last && (i / axisLabelEvery) % 2 === 1;
          return (
            <span
              key={i}
              style={{ left: `${x(i)}%` }}
              className={clsx(i === 0 && styles.first, i === last && styles.last, minor && styles.minor)}
            >
              {label}
            </span>
          );
        })}
      </div>
      <details className={styles.tableToggle}>
        <summary>표로 보기</summary>
        <table className={styles.table} id={tableId}>
          <caption>{tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">구간</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={i}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.key}>{formatValue(s.values[i] ?? 0)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
