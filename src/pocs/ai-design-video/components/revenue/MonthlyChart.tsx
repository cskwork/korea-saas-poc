"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompact, formatKrw, formatPercent } from "@/core/format";
import { monthLabel } from "../../domain/calendar";
import type { MonthTotal } from "../../domain/revenue";
import styles from "./revenue.module.css";

interface MonthlyChartProps {
  months: MonthTotal[];
  goal: number;
  /** The month still in progress (drawn in blue pencil). */
  currentMonth: string;
}

const HEIGHT = 260;
const M = { top: 28, right: 12, bottom: 30, left: 52 };

function niceStep(max: number): number {
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw);
  return step ?? 10 * magnitude;
}

/** Twelve months of delivered revenue against the goal line. */
export function MonthlyChart({ months, goal, currentMonth }: MonthlyChartProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const node = wrap.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(Math.round(entry.contentRect.width), 280)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const peak = Math.max(...months.map((m) => m.total), goal);
  const step = niceStep(peak * 1.05);
  const top = Math.ceil((peak * 1.05) / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const innerW = width - M.left - M.right;
  const innerH = HEIGHT - M.top - M.bottom;
  const band = innerW / months.length;
  const barW = Math.min(24, band * 0.56);
  const y = (value: number) => M.top + innerH - (value / top) * innerH;
  const maxIndex = months.reduce((best, m, i) => (m.total > months[best].total ? i : best), 0);
  const narrow = band < 34;

  const column = (i: number, total: number) => {
    const x = M.left + band * i + (band - barW) / 2;
    const yTop = y(total);
    const h = M.top + innerH - yTop;
    if (h <= 0) return "";
    const r = Math.min(4, h, barW / 2);
    return `M${x} ${M.top + innerH}V${yTop + r}Q${x} ${yTop} ${x + r} ${yTop}H${x + barW - r}Q${x + barW} ${yTop} ${x + barW} ${yTop + r}V${M.top + innerH}Z`;
  };

  const activeMonth = active === null ? null : months[active];

  return (
    <div className={styles.chart} ref={wrap}>
      <svg
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={`최근 12개월 월별 납품액. 목표 ${formatKrw(goal)}.`}
      >
        <g className={styles.grid}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={M.left} x2={width - M.right} y1={y(tick)} y2={y(tick)} />
              <text x={M.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">
                {tick === 0 ? "0" : formatCompact(tick)}
              </text>
            </g>
          ))}
        </g>
        <line className={styles.goalLine} x1={M.left} x2={width - M.right} y1={y(goal)} y2={y(goal)} />
        <text className={styles.goalLabel} x={width - M.right} y={y(goal) - 6} textAnchor="end">
          목표 {formatCompact(goal)}
        </text>
        {months.map((m, i) => {
          const current = m.month === currentMonth;
          const labelled = current || i === maxIndex;
          const cx = M.left + band * i + band / 2;
          return (
            <g key={m.month}>
              <path
                className={current ? styles.barCurrent : styles.bar}
                d={column(i, m.total)}
                data-active={active === i || undefined}
              />
              {labelled && m.total > 0 && (
                <text className={styles.barLabel} x={cx} y={y(m.total) - 7} textAnchor="middle">
                  {formatCompact(m.total)}
                </text>
              )}
              {(!narrow || i % 2 === months.length % 2 || current) && (
                <text className={styles.axisLabel} x={cx} y={HEIGHT - 10} textAnchor="middle">
                  {monthLabel(m.month)}
                </text>
              )}
              <rect
                className={styles.hit}
                x={M.left + band * i}
                y={M.top}
                width={band}
                height={innerH}
                tabIndex={0}
                aria-label={`${m.month.slice(0, 4)}년 ${monthLabel(m.month)} ${formatKrw(m.total)}, ${m.count}건`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            </g>
          );
        })}
      </svg>
      {activeMonth && active !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(Math.max(M.left + band * active + band / 2, 90), width - 90),
            top: Math.max(y(activeMonth.total) - 12, 0),
          }}
          aria-hidden="true"
        >
          <strong>{formatKrw(activeMonth.total)}</strong>
          <span>
            {activeMonth.month.slice(0, 4)}년 {monthLabel(activeMonth.month)} · {activeMonth.count}건
          </span>
          <span>목표의 {formatPercent(goal > 0 ? activeMonth.total / goal : 0)}</span>
        </div>
      )}
    </div>
  );
}
