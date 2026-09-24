import { formatPercent } from "@/core/format";
import { daysInMonth } from "../domain/calendar";
import type { GoalProgress } from "../domain/revenue";
import styles from "./goal-meter.module.css";

/** Delivered revenue against the monthly goal, with a tick where an even pace would be today. */
export function GoalMeter({ progress, today }: { progress: GoalProgress; today: string }) {
  const month = today.slice(0, 7);
  const pace = Number(today.slice(8, 10)) / daysInMonth(month);
  const fill = Math.min(progress.ratio, 1);
  return (
    <div className={styles.meter}>
      <div
        className={styles.track}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={progress.goal}
        aria-valuenow={progress.achieved}
        aria-label={`이번 달 목표 달성률 ${formatPercent(progress.ratio)}`}
      >
        <span className={styles.fill} style={{ width: `${fill * 100}%` }} data-over={progress.ratio >= 1} />
        <span className={styles.pace} style={{ left: `${pace * 100}%` }} title="오늘까지 고르게 벌었다면 여기" />
      </div>
    </div>
  );
}
