import { formatCompact, formatKrw } from "@/core/format";
import type { JourneyPoint } from "../../domain/roi";
import { niceRange } from "../../domain/scale";
import styles from "./roi.module.css";

const W = 620;
const H = 240;
const PAD = { top: 24, right: 20, bottom: 32, left: 56 };

/**
 * Cumulative net position as a journey: the line starts below zero (the build fee)
 * and the month it crosses zero is marked as an interchange, 손익분기.
 */
export function JourneyChart({ points, paybackMonths }: { points: JourneyPoint[]; paybackMonths: number | null }) {
  const balances = points.map((p) => p.balance);
  const ticks = niceRange(Math.min(...balances), Math.max(...balances), 4);
  const low = ticks[0];
  const high = ticks[ticks.length - 1];
  const months = points.length - 1;
  const x = (month: number) => PAD.left + (month / months) * (W - PAD.left - PAD.right);
  const y = (value: number) => PAD.top + ((high - value) / (high - low || 1)) * (H - PAD.top - PAD.bottom);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.month).toFixed(1)} ${y(p.balance).toFixed(1)}`)
    .join(" ");
  const breakEven = paybackMonths !== null && paybackMonths <= months ? points[paybackMonths] : undefined;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-labelledby="journey-title">
      <title id="journey-title">
        {`누적 순이익: 시작 ${formatKrw(points[0].balance)}, ${months}개월 후 ${formatKrw(last.balance)}${
          breakEven ? `, ${breakEven.month}개월째 손익분기` : ", 기간 안에 손익분기 없음"
        }`}
      </title>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            className={tick === 0 ? styles.zero : styles.grid}
          />
          <text x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" className={styles.tick}>
            {tick === 0 ? "0" : `${tick < 0 ? "−" : ""}${formatCompact(Math.abs(tick))}`}
          </text>
        </g>
      ))}
      {points
        .filter((p) => p.month % 6 === 0)
        .map((p) => (
          <text key={p.month} x={x(p.month)} y={H - 8} textAnchor="middle" className={styles.tick}>
            {p.month === 0 ? "시작" : `${p.month}개월`}
          </text>
        ))}
      <path d={path} className={styles.journey} />
      {points
        .filter((p) => p.month % 3 === 0 && p.month !== breakEven?.month)
        .map((p) => (
          <circle key={p.month} cx={x(p.month)} cy={y(p.balance)} r={4.5} className={styles.stop}>
            <title>{`${p.month}개월: ${formatKrw(p.balance)}`}</title>
          </circle>
        ))}
      {breakEven ? (
        <g>
          <rect
            x={x(breakEven.month) - 13}
            y={y(breakEven.balance) - 8}
            width={26}
            height={16}
            rx={8}
            className={styles.interchange}
          />
          <text x={x(breakEven.month)} y={y(breakEven.balance) - 16} textAnchor="middle" className={styles.breakLabel}>
            손익분기 {breakEven.month}개월
          </text>
        </g>
      ) : null}
      <text
        x={x(last.month)}
        y={y(last.balance) + (last.balance >= 0 ? -12 : 20)}
        textAnchor="end"
        className={styles.endLabel}
      >
        {`${last.balance < 0 ? "−" : ""}${formatCompact(Math.abs(last.balance))}`}
      </text>
    </svg>
  );
}
