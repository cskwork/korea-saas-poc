import type { CSSProperties } from "react";
import { formatWon } from "@/core/format";
import type { WeekSeries } from "../../domain/stats";
import ui from "../world/ui.module.css";
import styles from "./dashboard.module.css";

const height = (count: number, max: number) => ({ "--h": `${(count / max) * 100}%` }) as CSSProperties;

/** This week's bars, Monday to Sunday: confirmed as printed fill, pending as a dashed box on top. */
export function WeekChart({ week }: { week: WeekSeries }) {
  return (
    <div className={styles.week}>
      <ol className={styles.bars} aria-label="이번 주 요일별 예약 건수 (취소 제외)">
        {week.days.map((day) => {
          const total = day.confirmed + day.pending;
          return (
            <li key={day.date} className={`${styles.bar}${day.isToday ? ` ${styles.today}` : ""}`}>
              <span className={styles.barCount} aria-hidden="true">
                {total}
              </span>
              <span className={styles.barCol} aria-hidden="true">
                {day.pending > 0 ? <span className={styles.barPending} style={height(day.pending, week.max)} /> : null}
                {day.confirmed > 0 ? <span className={styles.barFill} style={height(day.confirmed, week.max)} /> : null}
              </span>
              <span className={styles.barLabel}>
                <span aria-hidden="true">{day.label}</span>
                <span className={ui.visuallyHidden}>
                  {Number(day.date.slice(5, 7))}월 {Number(day.date.slice(8))}일 {day.label}요일
                  {day.isToday ? " (오늘)" : ""}: 확정 {day.confirmed}건, 대기 {day.pending}건
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className={styles.weekNote}>
        이번 주 {week.total}건 · 확정 기준 매출 <strong>{formatWon(week.confirmedRevenue)}</strong>
      </p>
    </div>
  );
}
