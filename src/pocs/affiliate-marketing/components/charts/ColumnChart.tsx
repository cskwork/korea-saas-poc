"use client";

import { useState } from "react";
import clsx from "clsx";
import styles from "./charts.module.css";

export interface ColumnPoint {
  /** Readout heading, e.g. "9월 24일 (목)". */
  label: string;
  value: number;
  /** Readout lines, pre-formatted on the server. */
  lines: string[];
  /** Draws a dot above the column (e.g. days with orders). */
  marked?: boolean;
}

export interface ColumnChartProps {
  title: string;
  points: ColumnPoint[];
  max: number;
  yTicks: { value: number; label: string }[];
  xTicks: { index: number; label: string }[];
  tone?: "red" | "ink";
  onYellow?: boolean;
  highlight?: number;
  band?: { from: number; to: number };
  height?: number;
}

/**
 * Single-series column chart (one axis, square flyer bars). Hover or focus the plot and
 * use ←/→ to read any column; a hidden table carries every value for screen readers.
 */
export function ColumnChart({ title, points, max, yTicks, xTicks, tone = "red", onYellow, highlight, band, height = 180 }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const n = points.length;
  const width = n * 10;
  const shown = active ?? null;

  function indexFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    return Math.min(n - 1, Math.max(0, Math.floor(ratio * n)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const current = active ?? highlight ?? n - 1;
    const next =
      event.key === "ArrowLeft" ? current - 1 : event.key === "ArrowRight" ? current + 1 : event.key === "Home" ? 0 : event.key === "End" ? n - 1 : null;
    if (next == null) return;
    event.preventDefault();
    setActive(Math.min(n - 1, Math.max(0, next)));
  }

  const readout = shown != null ? points[shown] : null;

  return (
    <figure className={clsx(styles.chart, tone === "ink" && styles.inkBars, onYellow && styles.onYellow)}>
      <div className={styles.frame} style={{ height }}>
        <div className={styles.yAxis} aria-hidden>
          {yTicks.map((tick) => (
            <span key={tick.value} className={styles.yTick} style={{ bottom: `${(tick.value / max) * 100}%` }}>
              {tick.label}
            </span>
          ))}
        </div>
        <div
          className={styles.plot}
          tabIndex={0}
          role="group"
          aria-label={`${title}. 좌우 화살표로 날짜별 값을 읽을 수 있어요.`}
          onPointerMove={(event) => setActive(indexFromPointer(event))}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          <svg className={styles.svg} viewBox={`0 0 ${width} 100`} preserveAspectRatio="none" aria-hidden>
            {band ? <rect className={styles.band} x={band.from * 10} y={0} width={(band.to - band.from + 1) * 10} height={100} /> : null}
            {yTicks.map((tick) => (
              <line key={tick.value} className={styles.grid} x1={0} x2={width} y1={100 - (tick.value / max) * 100} y2={100 - (tick.value / max) * 100} />
            ))}
            {shown != null ? <rect className={styles.cursor} x={shown * 10} y={0} width={10} height={100} /> : null}
            {points.map((point, index) => {
              const h = max > 0 ? (point.value / max) * 100 : 0;
              return (
                <rect
                  key={index}
                  className={styles.bar}
                  data-today={index === highlight ? "true" : undefined}
                  data-dim={band && (index < band.from || index > band.to) ? "true" : undefined}
                  x={index * 10 + 1.5}
                  width={7}
                  y={100 - h}
                  height={h}
                />
              );
            })}
            <line className={styles.baseline} x1={0} x2={width} y1={100} y2={100} />
          </svg>
          {points.map((point, index) =>
            point.marked ? (
              <span
                key={`m${index}`}
                className={styles.marker}
                style={{ left: `${((index + 0.5) / n) * 100}%`, bottom: `${max > 0 ? (point.value / max) * 100 : 0}%` }}
                aria-hidden
              />
            ) : null,
          )}
          {readout ? (
            <div className={styles.readout} style={{ left: `${Math.min(88, Math.max(12, ((shown! + 0.5) / n) * 100))}%`, bottom: "100%" }} aria-live="polite">
              <b>{readout.label}</b>
              {readout.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.xAxis} aria-hidden>
        {xTicks.map((tick) => (
          <span key={tick.index} className={styles.xTick} style={{ left: `${((tick.index + 0.5) / n) * 100}%` }}>
            {tick.label}
          </span>
        ))}
      </div>
      <div className={styles.srTable}>
        <table>
        <caption>{title}</caption>
        <tbody>
          {points.map((point, index) => (
            <tr key={index}>
              <th scope="row">{point.label}</th>
              <td>{point.lines.join(", ")}</td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </figure>
  );
}
