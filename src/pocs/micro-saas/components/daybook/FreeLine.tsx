"use client";

import { formatMinute } from "../../domain/time";
import { useNewBooking } from "../booking/NewBooking";
import styles from "./daybook.module.css";

/**
 * Empty time, drawn: a dashed ghost line per free slot, or one line for a run of them.
 * Upcoming free time opens the new-booking slip at that time.
 */
export function FreeLine({
  date,
  minute,
  lastMinute,
  count = 1,
  past,
}: {
  date: string;
  minute: number;
  lastMinute?: number;
  count?: number;
  past: boolean;
}) {
  const open = useNewBooking();
  const run = count > 1;
  const text = run ? `~ ${formatMinute(lastMinute ?? minute)} · 빈 시간 ${count}칸` : null;
  const content = (
    <>
      <span className={styles.ghostTime}>{formatMinute(minute)}</span>
      {run ? <span className={styles.ghostSpan}>{text}</span> : <span className={styles.ghostLine} />}
      {past ? null : (
        <span className={styles.ghostAdd} aria-hidden="true">
          + 예약
        </span>
      )}
    </>
  );

  if (past) {
    return (
      <li className={`${styles.ghost}${run ? ` ${styles.run}` : ""}`} aria-hidden={run ? undefined : true}>
        {content}
      </li>
    );
  }
  return (
    <li className={`${styles.ghost}${run ? ` ${styles.run}` : ""}`}>
      <button
        type="button"
        className={styles.ghostButton}
        onClick={() => open({ date, time: formatMinute(minute) })}
        aria-label={`${formatMinute(minute)}${run ? `부터 ${count}칸` : ""} 빈 시간, 예약 적기`}
      >
        {content}
      </button>
    </li>
  );
}
