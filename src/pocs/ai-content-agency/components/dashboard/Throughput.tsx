"use client";

import { useState } from "react";
import { shortDate } from "../../domain/dates";
import type { WeekThroughput } from "../../domain/stats";
import styles from "./chart.module.css";
import dashboard from "./dashboard.module.css";

/** Rounds the axis top up to a clean even number (at least 4). */
function axisTop(max: number): number {
  const top = Math.max(4, Math.ceil(max));
  return top % 2 === 0 ? top : top + 1;
}

const SERIES = [
  { key: "received", label: "접수" },
  { key: "delivered", label: "납품" },
] as const;

/** Orders received and delivered per week: grouped columns, hover or focus a week for its numbers. */
export function Throughput({ weeks }: { weeks: WeekThroughput[] }) {
  const [active, setActive] = useState<string | null>(null);
  const top = axisTop(Math.max(...weeks.flatMap((w) => [w.received, w.delivered])));
  const last = weeks[weeks.length - 1];
  const totals = weeks.reduce((sum, w) => ({ received: sum.received + w.received, delivered: sum.delivered + w.delivered }), {
    received: 0,
    delivered: 0,
  });

  return (
    <section className={`${dashboard.section} ${styles.chart}`} aria-labelledby="throughput-title">
      <div className={dashboard.sectionHead}>
        <h2 id="throughput-title" className={dashboard.sectionLabel}>
          주간 처리량
        </h2>
        <ul className={styles.legend} aria-label="범례">
          {SERIES.map((s) => (
            <li key={s.key}>
              <span className={styles.key} data-series={s.key} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.summary}>
        최근 {weeks.length}주 동안 {totals.received}건을 받고 {totals.delivered}건을 납품했어요.
      </p>

      <div className={styles.frame} style={{ "--weeks": weeks.length } as React.CSSProperties}>
        <div className={styles.yAxis} aria-hidden="true">
          {[0, top / 2, top].map((tick) => (
            <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className={styles.plot} role="list" aria-label="주별 접수·납품 건수">
          {[top / 2, top].map((tick) => (
            <span key={tick} className={styles.grid} style={{ bottom: `${(tick / top) * 100}%` }} aria-hidden="true" />
          ))}
          {weeks.map((week) => {
            const isLast = week === last;
            const isActive = active === week.weekStart;
            const label = `${shortDate(week.weekStart)} 주: 접수 ${week.received}건, 납품 ${week.delivered}건`;
            return (
              <div
                key={week.weekStart}
                role="listitem"
                tabIndex={0}
                aria-label={label}
                className={styles.group}
                data-active={isActive}
                onPointerEnter={() => setActive(week.weekStart)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(week.weekStart)}
                onBlur={() => setActive(null)}
              >
                {SERIES.map((s) => {
                  const value = week[s.key];
                  return (
                    <span
                      key={s.key}
                      className={styles.bar}
                      data-series={s.key}
                      data-zero={value === 0}
                      style={value > 0 ? { height: `${(value / top) * 100}%` } : undefined}
                    >
                      {isLast && !isActive ? <span className={styles.value}>{value}</span> : null}
                    </span>
                  );
                })}
                {isActive ? (
                  <span className={styles.tooltip} aria-hidden="true">
                    <span className={styles.tooltipTitle}>{shortDate(week.weekStart)} 주</span>
                    {SERIES.map((s) => (
                      <span key={s.key} className={styles.tooltipRow}>
                        <span className={styles.line} data-series={s.key} />
                        <strong>{week[s.key]}건</strong>
                        {s.label}
                      </span>
                    ))}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className={styles.xAxis} aria-hidden="true">
          {weeks.map((week) => (
            <span key={week.weekStart} data-current={week === last}>
              {week === last ? "이번 주" : shortDate(week.weekStart)}
            </span>
          ))}
        </div>
      </div>

      <details className={styles.table}>
        <summary>표로 보기</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">주 시작</th>
              <th scope="col">접수</th>
              <th scope="col">납품</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.weekStart}>
                <th scope="row">{shortDate(week.weekStart)}</th>
                <td>{week.received}건</td>
                <td>{week.delivered}건</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
