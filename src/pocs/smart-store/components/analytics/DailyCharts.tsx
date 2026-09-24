"use client";

import { useId, useState, type KeyboardEvent, type PointerEvent } from "react";
import clsx from "clsx";
import { formatKrw, formatNumber } from "@/core/format";
import type { DayPoint } from "../../domain/analytics";
import { formatAxisWon, niceTicks } from "../../domain/chart-scale";
import styles from "./charts.module.css";

const W = 1000;
const LINE_H = 240;
const BAR_H = 120;

function dayLabel(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${m}/${d}`;
}

function weekday(date: string) {
  return new Intl.DateTimeFormat("ko-KR", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * Two charts on one day axis (small multiples): revenue and what is left
 * (emphasised) as lines, orders as columns. One crosshair drives both;
 * arrow keys move it for keyboard users.
 */
export function DailyCharts({ days }: { days: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();
  const n = days.length;
  const x = (i: number) => ((i + 0.5) / n) * W;
  const pct = (i: number) => ((i + 0.5) / n) * 100;

  const moneyTicks = niceTicks(Math.max(...days.map((d) => Math.max(d.revenue, d.profit)), 0));
  const moneyMin = Math.min(0, ...days.map((d) => d.profit));
  const moneyMax = moneyTicks[moneyTicks.length - 1];
  const yMoney = (v: number) => LINE_H - ((v - moneyMin) / (moneyMax - moneyMin || 1)) * LINE_H;
  const orderTicks = niceTicks(Math.max(...days.map((d) => d.orders), 3), 3);
  const orderMax = orderTicks[orderTicks.length - 1];

  const path = (key: "revenue" | "profit") =>
    days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${yMoney(d[key]).toFixed(1)}`).join(" ");
  const area = `${path("profit")} L${x(n - 1).toFixed(1)},${yMoney(0).toFixed(1)} L${x(0).toFixed(1)},${yMoney(0).toFixed(1)} Z`;
  const labelEvery = n > 14 ? 5 : n > 7 ? 2 : 1;

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const plot = event.currentTarget.querySelector("[data-plot]");
    if (!plot) return;
    const rect = plot.getBoundingClientRect();
    const index = Math.floor(((event.clientX - rect.left) / rect.width) * n);
    setActive(Math.min(Math.max(index, 0), n - 1));
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 1 : -1;
      setActive((current) => Math.min(Math.max((current ?? (step > 0 ? -1 : n)) + step, 0), n - 1));
    } else if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(n - 1);
    else if (event.key === "Escape") setActive(null);
  };
  const point = active === null ? null : days[active];

  return (
    <div className={styles.daily}>
      <ul className={styles.legend} aria-label="범례">
        <li>
          <span className={clsx(styles.key, styles.keyProfit)} aria-hidden />
          남는 돈
        </li>
        <li>
          <span className={clsx(styles.key, styles.keyRevenue)} aria-hidden />
          매출
        </li>
        <li>
          <span className={clsx(styles.key, styles.keyOrders)} aria-hidden />
          주문 수 (아래)
        </li>
      </ul>

      <div
        className={styles.interactive}
        tabIndex={0}
        role="group"
        aria-label="일별 매출·남는 돈·주문 수 차트. 좌우 화살표로 날짜를 옮겨요."
        aria-describedby={point ? tooltipId : undefined}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        <div className={styles.panel}>
          <div className={styles.yAxis} aria-hidden>
            {moneyTicks.map((tick) => (
              <span key={tick} style={{ top: `${(yMoney(tick) / LINE_H) * 100}%` }}>
                {formatAxisWon(tick)}
              </span>
            ))}
          </div>
          <div className={styles.plot} style={{ height: LINE_H }} data-plot>
            <svg viewBox={`0 0 ${W} ${LINE_H}`} preserveAspectRatio="none" className={styles.svg} aria-hidden>
              {moneyTicks.map((tick) => (
                <line key={tick} x1={0} x2={W} y1={yMoney(tick)} y2={yMoney(tick)} className={styles.grid} />
              ))}
              <path d={area} className={styles.profitArea} />
              <path d={path("revenue")} className={styles.revenueLine} />
              <path d={path("profit")} className={styles.profitLine} />
            </svg>
            {point && active !== null ? (
              <>
                <span className={styles.crosshair} style={{ left: `${pct(active)}%` }} />
                <span
                  className={clsx(styles.dot, styles.dotRevenue)}
                  style={{ left: `${pct(active)}%`, top: `${(yMoney(point.revenue) / LINE_H) * 100}%` }}
                />
                <span
                  className={clsx(styles.dot, styles.dotProfit)}
                  style={{ left: `${pct(active)}%`, top: `${(yMoney(point.profit) / LINE_H) * 100}%` }}
                />
              </>
            ) : null}
            <span
              className={styles.endLabel}
              style={{ top: `${(yMoney(days[n - 1].profit) / LINE_H) * 100}%` }}
              aria-hidden
            >
              {formatAxisWon(days[n - 1].profit)}
            </span>
          </div>
        </div>

        <div className={clsx(styles.panel, styles.barPanel)}>
          <div className={styles.yAxis} aria-hidden>
            {orderTicks.map((tick) => (
              <span key={tick} style={{ top: `${(1 - tick / (orderMax || 1)) * 100}%` }}>
                {formatNumber(tick, 1)}
              </span>
            ))}
          </div>
          <div className={styles.plot} style={{ height: BAR_H }}>
            <svg viewBox={`0 0 ${W} ${BAR_H}`} preserveAspectRatio="none" className={styles.svg} aria-hidden>
              {orderTicks.map((tick) => (
                <line
                  key={tick}
                  x1={0}
                  x2={W}
                  y1={BAR_H - (tick / (orderMax || 1)) * BAR_H}
                  y2={BAR_H - (tick / (orderMax || 1)) * BAR_H}
                  className={styles.grid}
                />
              ))}
            </svg>
            {days.map((d, i) => (
              <span
                key={d.date}
                className={clsx(styles.bar, active === i && styles.barActive)}
                style={{
                  left: `${pct(i)}%`,
                  height: `${(d.orders / (orderMax || 1)) * 100}%`,
                  width: `min(24px, ${60 / n}%)`,
                }}
              />
            ))}
            {point && active !== null ? (
              <span className={styles.crosshair} style={{ left: `${pct(active)}%` }} />
            ) : null}
          </div>
        </div>

        <div className={styles.xAxis} aria-hidden>
          {days.map((d, i) =>
            (n - 1 - i) % labelEvery === 0 ? (
              <span key={d.date} style={{ left: `${pct(i)}%` }}>
                {dayLabel(d.date)}
              </span>
            ) : null,
          )}
        </div>

        {point && active !== null ? (
          <div className={styles.overlay}>
            <div
              id={tooltipId}
              role="status"
              className={clsx(styles.tooltip, pct(active) > 60 && styles.tooltipLeft)}
              style={{ left: `${pct(active)}%` }}
            >
              <p className={styles.tooltipDate}>
                {dayLabel(point.date)} ({weekday(point.date)})
              </p>
              <p>
                <span className={clsx(styles.key, styles.keyProfit)} aria-hidden />
                <strong>{formatKrw(point.profit)}</strong> 남는 돈
              </p>
              <p>
                <span className={clsx(styles.key, styles.keyRevenue)} aria-hidden />
                <strong>{formatKrw(point.revenue)}</strong> 매출
              </p>
              <p>
                <span className={clsx(styles.key, styles.keyOrders)} aria-hidden />
                <strong>{formatNumber(point.orders)}건</strong> 주문
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
