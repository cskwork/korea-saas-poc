import { formatCompact, formatKrw } from "@/core/format";
import type { MrrPoint } from "../../domain/dashboard";
import { monthLabel } from "../../domain/dates";
import { niceTicks } from "../../domain/scale";
import ui from "../ui/ui.module.css";
import styles from "./dashboard.module.css";

const PAD = { top: 28, right: 24, bottom: 34, left: 52 };

/**
 * Maintenance revenue month by month, drawn as a stretch of the circle line.
 * Two geometries (wide and compact) keep the labels at reading size on every screen.
 */
export function MrrChart({ points, currentYear }: { points: MrrPoint[]; currentYear: number }) {
  return (
    <figure className={styles.chart}>
      <MrrPlot
        points={points}
        currentYear={currentYear}
        width={560}
        height={220}
        className={styles.chartWide}
        idSuffix="wide"
      />
      <MrrPlot
        points={points}
        currentYear={currentYear}
        width={340}
        height={200}
        className={styles.chartCompact}
        idSuffix="compact"
      />
      <MrrTable points={points} currentYear={currentYear} />
    </figure>
  );
}

function MrrPlot({
  points,
  currentYear,
  width: W,
  height: H,
  className,
  idSuffix,
}: {
  points: MrrPoint[];
  currentYear: number;
  width: number;
  height: number;
  className: string;
  idSuffix: string;
}) {
  const max = Math.max(...points.map((p) => p.mrr), 0);
  const ticks = niceTicks(max, 3);
  const top = ticks[ticks.length - 1] || 1;
  const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, points.length - 1);
  const y = (v: number) => PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.mrr).toFixed(1)}`).join(" ");
  const last = points.length - 1;
  const peak = points.reduce((best, p, i) => (p.mrr > points[best].mrr ? i : best), 0);

  const titleId = `mrr-chart-title-${idSuffix}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={titleId} className={`${styles.chartSvg} ${className}`}>
      <title id={titleId}>
        {`최근 ${points.length}개월 월 정기 수익: ${points.map((p) => `${monthLabel(p.month, currentYear)} ${formatKrw(p.mrr)}`).join(", ")}`}
      </title>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} className={styles.grid} />
          <text x={PAD.left - 8} y={y(tick)} className={styles.tick} textAnchor="end" dominantBaseline="middle">
            {tick === 0 ? "0" : formatCompact(tick)}
          </text>
        </g>
      ))}
      <path d={path} className={styles.mrrLine} />
      {points.map((p, i) => (
        <g
          key={p.month}
          className={styles.point}
          tabIndex={0}
          aria-label={`${monthLabel(p.month, currentYear)} ${formatKrw(p.mrr)}`}
        >
          <rect
            x={x(i) - 24}
            y={PAD.top - 20}
            width={48}
            height={H - PAD.top - PAD.bottom + 20}
            className={styles.hit}
          />
          <circle cx={x(i)} cy={y(p.mrr)} r={6} className={i === last ? styles.pointNow : styles.pointDisc} />
          <text x={x(i)} y={H - 10} textAnchor="middle" className={styles.tick}>
            {monthLabel(p.month, currentYear)}
          </text>
          <text
            x={x(i)}
            y={y(p.mrr) - 14}
            textAnchor="middle"
            className={i === last || (i === peak && peak !== last) ? styles.valueLabel : styles.valueHover}
          >
            {formatCompact(p.mrr)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MrrTable({ points, currentYear }: { points: MrrPoint[]; currentYear: number }) {
  return (
    <details className={styles.tableToggle}>
      <summary>표로 보기</summary>
      <table className={ui.table}>
        <thead>
          <tr>
            <th scope="col">월</th>
            <th scope="col" className={ui.num}>
              월 정기 수익
            </th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.month}>
              <td>{monthLabel(p.month, currentYear)}</td>
              <td className={ui.num}>{formatKrw(p.mrr)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
