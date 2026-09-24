import { formatCompact, formatWon } from "@/core/format";
import type { CourseColor } from "../../db/schema";
import type { MonthRevenue } from "../../domain/revenue";
import styles from "./revenue.module.css";

const W = 960;
const H = 300;
const PAD = { top: 26, right: 8, bottom: 30, left: 52 };

/** 1, 2, 2.5, 5 × 10^n: a readable axis ceiling above `value`. */
function niceCeil(value: number): number {
  if (value <= 0) return 100_000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * Monthly revenue as timetable columns: each month stacks one block per course
 * in that course's colour, with digital products as the outlined block on top.
 */
export function MonthlyChart({
  series,
  courseOrder,
  colors,
  titles,
}: {
  series: MonthRevenue[];
  courseOrder: string[];
  colors: Record<string, CourseColor>;
  titles: Record<string, string>;
}) {
  const max = niceCeil(Math.max(...series.map((m) => m.total)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / series.length;
  const bar = Math.min(44, slot * 0.58);
  const y = (value: number) => PAD.top + plotH - (value / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const last = series.at(-1);

  return (
    <svg className={styles.chart} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="chart-title">
      <title id="chart-title">
        {`월별 매출: ${series[0]?.label}부터 ${last?.label}까지, 가장 최근 달 ${formatWon(last?.total ?? 0)}. 자세한 숫자는 아래 월별 상세 표에 있어요.`}
      </title>
      {ticks.map((tick) => (
        <g key={tick} className={styles.tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">
            {tick === 0 ? "0" : formatCompact(tick)}
          </text>
        </g>
      ))}
      {series.map((month, index) => {
        const x = PAD.left + slot * index + (slot - bar) / 2;
        let top = y(0);
        const keys = [...courseOrder.filter((key) => month.byCourse[key]), ...Object.keys(month.byCourse).filter((key) => !courseOrder.includes(key))];
        const breakdown = keys.map((key) => `${titles[key] ?? "삭제된 강의"} ${formatWon(month.byCourse[key])}`).join(", ");
        const current = index === series.length - 1;
        return (
          <g key={month.month} className={styles.column}>
            <title>{`${month.label}: 합계 ${formatWon(month.total)} (${breakdown}${month.product ? `, 디지털 상품 ${formatWon(month.product)}` : ""})`}</title>
            {keys.map((key) => {
              const h = (month.byCourse[key] / max) * plotH;
              top -= h;
              return (
                <rect
                  key={key}
                  data-color={colors[key]}
                  className={styles.courseBlock}
                  x={x}
                  y={top + 1}
                  width={bar}
                  height={Math.max(0, h - 2)}
                  rx="3"
                />
              );
            })}
            {month.product > 0 ? (
              <rect
                className={styles.productBlock}
                x={x + 0.75}
                y={top - (month.product / max) * plotH + 1.75}
                width={bar - 1.5}
                height={Math.max(0, (month.product / max) * plotH - 3)}
                rx="3"
              />
            ) : null}
            {month.total > 0 ? (
              <text className={styles.value} x={x + bar / 2} y={y(month.total) - 7} textAnchor="middle">
                {formatCompact(month.total)}
              </text>
            ) : null}
            <text className={current ? styles.monthCurrent : styles.month} x={x + bar / 2} y={H - 10} textAnchor="middle">
              {current ? `${month.label}·진행 중` : month.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
