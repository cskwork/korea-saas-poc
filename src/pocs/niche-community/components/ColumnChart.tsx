"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatCompact, formatNumber, formatWon } from "@/core/format";
import styles from "./chart.module.css";

export interface ChartCategory {
  key: string;
  /** Axis label ("9월", "24"). */
  label: string;
  /** Tooltip heading ("2026년 9월", "9월 24일 (수)"). */
  detail: string;
}

export interface ChartSeries {
  key: string;
  label: string;
  /** lead = the series the story is about (accent), ink = strong neutral, base = recessive gray. */
  tone: "lead" | "ink" | "base";
  values: number[];
}

interface ColumnChartProps {
  categories: ChartCategory[];
  /** Stacked bottom-up in this order. */
  series: ChartSeries[];
  unit: "won" | "count";
  /** Single series only: paint the last column in the lead tone, the rest recessive. */
  highlightLast?: boolean;
  /** Show every n-th axis label (dense daily charts). */
  labelEvery?: number;
  height?: number;
  /** Accessible summary of the whole chart. */
  label: string;
}

const PAD = { top: 24, right: 8, bottom: 28, left: 44 };
const BAR_MAX = 24;
const GAP = 2;

const fmt = (unit: ColumnChartProps["unit"], value: number) => (unit === "won" ? formatWon(value) : `${formatNumber(value)}`);
const tick = (unit: ColumnChartProps["unit"], value: number) =>
  unit === "won" ? (value >= 10_000 ? formatCompact(value) : formatNumber(value)) : formatNumber(value);

/** A "nice" axis maximum: 1, 2, 2.5 or 5 × 10^n at or above the data maximum. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= value) ?? 10;
  return step * power;
}

/** A column with a 4px rounded data end and a square foot on the baseline. */
function columnPath(x: number, y: number, width: number, height: number, rounded: boolean): string {
  if (height <= 0) return "";
  const r = rounded ? Math.min(4, width / 2, height) : 0;
  return [
    `M${x},${y + height}`,
    `V${y + r}`,
    r ? `Q${x},${y} ${x + r},${y}` : "",
    `H${x + width - r}`,
    r ? `Q${x + width},${y} ${x + width},${y + r}` : "",
    `V${y + height}`,
    "Z",
  ].join(" ");
}

/**
 * Column chart drawn in SVG at the container's real width (so type never scales),
 * with a per-column hover/focus tooltip and a table view for every value.
 */
export function ColumnChart({ categories, series, unit, highlightLast = false, labelEvery = 1, height = 220, label }: ColumnChartProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    const element = wrap.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const totals = categories.map((_, index) => series.reduce((sum, item) => sum + (item.values[index] ?? 0), 0));
  const max = niceMax(Math.max(...totals, 0));
  const plotWidth = width - PAD.left - PAD.right;
  const plotHeight = height - PAD.top - PAD.bottom;
  const band = plotWidth / Math.max(categories.length, 1);
  const barWidth = Math.min(BAR_MAX, Math.max(4, band * 0.62));
  const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight;
  const ticks = [0, max / 2, max];
  const single = series.length === 1;

  const toneOf = (seriesTone: ChartSeries["tone"], index: number) => {
    if (single && highlightLast) return index === categories.length - 1 ? styles.lead : styles.base;
    return styles[seriesTone];
  };

  const activeLeft = active === null ? 0 : ((PAD.left + band * active + band / 2) / width) * 100;

  return (
    <figure className={styles.figure} aria-labelledby={titleId}>
      <figcaption id={titleId} className={styles.srOnly}>
        {label}
      </figcaption>
      {single ? null : (
        <ul className={styles.legend} aria-hidden="true">
          {[...series].reverse().map((item) => (
            <li key={item.key}>
              <span className={`${styles.swatch} ${styles[item.tone]}`} />
              {item.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={wrap} className={styles.plot} onPointerLeave={() => setActive(null)}>
        <svg width={width} height={height} className={styles.svg} role="presentation">
          {ticks.map((value) => (
            <g key={value}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(value)} y2={y(value)} className={value === 0 ? styles.baseline : styles.grid} />
              <text x={PAD.left - 8} y={y(value)} dy="0.32em" textAnchor="end" className={styles.tick}>
                {tick(unit, value)}
              </text>
            </g>
          ))}
          {categories.map((category, index) => {
            const x = PAD.left + band * index + (band - barWidth) / 2;
            let base = 0;
            const segments = series.map((item, seriesIndex) => {
              const value = item.values[index] ?? 0;
              const top = y(base + value);
              const bottom = y(base);
              base += value;
              const isTop = series.slice(seriesIndex + 1).every((rest) => (rest.values[index] ?? 0) === 0);
              // 2px surface gap between stacked segments.
              const segmentHeight = Math.max(0, bottom - top - (seriesIndex > 0 ? GAP : 0));
              return (
                <path
                  key={item.key}
                  d={columnPath(x, top, barWidth, segmentHeight, isTop)}
                  className={`${styles.bar} ${toneOf(item.tone, index)}`}
                />
              );
            });
            const labelled = index % labelEvery === 0 || index === categories.length - 1;
            const isLast = index === categories.length - 1;
            return (
              <g
                key={category.key}
                tabIndex={0}
                role="img"
                aria-label={`${category.detail}: ${series.map((item) => `${item.label} ${fmt(unit, item.values[index] ?? 0)}`).join(", ")}`}
                className={styles.column}
                data-active={active === index}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                <rect x={PAD.left + band * index} y={PAD.top} width={band} height={plotHeight} className={styles.hit} />
                {segments}
                {isLast && totals[index] > 0 ? (
                  <text x={x + barWidth / 2} y={y(totals[index]) - 8} textAnchor="middle" className={styles.valueLabel}>
                    {unit === "won" ? formatWon(totals[index]) : formatNumber(totals[index])}
                  </text>
                ) : null}
                {labelled ? (
                  <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className={isLast ? styles.axisStrong : styles.axis}>
                    {category.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        {active !== null ? (
          <div
            className={styles.tooltip}
            style={{ left: `${Math.min(Math.max(activeLeft, 18), 82)}%` }}
            role="presentation"
          >
            <p className={styles.tooltipTitle}>{categories[active].detail}</p>
            {[...series].reverse().map((item) => (
              <p key={item.key} className={styles.tooltipRow}>
                <span className={`${styles.key} ${toneOf(item.tone, active)}`} />
                <strong>{fmt(unit, item.values[active] ?? 0)}</strong>
                <span>{item.label}</span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
      <details className={styles.tableView}>
        <summary>표로 보기</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">구간</th>
              {series.map((item) => (
                <th key={item.key} scope="col">
                  {item.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.key}>
                <th scope="row">{category.detail}</th>
                {series.map((item) => (
                  <td key={item.key}>{fmt(unit, item.values[index] ?? 0)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
