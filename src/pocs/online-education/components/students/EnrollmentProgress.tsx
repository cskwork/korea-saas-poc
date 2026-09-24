import { PACE_STATUS_LABEL, type PaceStatus } from "../../domain/study-plan";
import ui from "../ui/ui.module.css";
import styles from "./students.module.css";

const TONE: Record<PaceStatus, string | undefined> = {
  completed: "ok",
  refunded: "danger",
  behind: "warn",
  on_track: undefined,
};

/** Progress bar with a tick where the learner's own plan says they should be. */
export function EnrollmentProgress({
  progress,
  expected,
  pace,
  compact = false,
}: {
  progress: number;
  expected: number;
  pace: PaceStatus;
  compact?: boolean;
}) {
  const expectedPercent = Math.round(expected * 100);
  const label = `진도 ${progress}%, 계획상 ${expectedPercent}%, ${PACE_STATUS_LABEL[pace]}`;
  return (
    <span className={compact ? styles.progressCompact : styles.progressFull}>
      <span className={ui.progress} role="img" aria-label={label}>
        <span className={ui.progressFill} style={{ width: `${progress}%` }} />
        {pace === "on_track" || pace === "behind" ? (
          <span className={ui.progressMark} style={{ left: `calc(${expectedPercent}% - 1px)` }} />
        ) : null}
      </span>
      <span className={styles.progressText} aria-hidden>
        <span className={ui.num}>{progress}%</span>
        <span className={ui.badge} data-tone={TONE[pace]}>
          {PACE_STATUS_LABEL[pace]}
        </span>
      </span>
    </span>
  );
}
