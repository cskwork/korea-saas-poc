import { seatState, type SeatState } from "../domain/meetups";
import styles from "./seats.module.css";

export const SEAT_LABELS: Record<SeatState, string> = { open: "여유", closing: "마감 임박", full: "마감" };

/** One mark per seat (up to 40), filled for every RSVP — the room as the operator sees it. */
export function SeatMeter({ going, capacity, tone = "light" }: { going: number; capacity: number; tone?: "light" | "stage" }) {
  const state = seatState(going, capacity);
  const left = Math.max(0, capacity - going);
  const drawn = capacity <= 40;
  return (
    <div className={`${styles.meter} ${tone === "stage" ? styles.stage : ""}`} data-state={state}>
      {drawn ? (
        <span className={styles.seats} aria-hidden="true">
          {Array.from({ length: capacity }, (_, index) => (
            <span key={index} className={index < going ? styles.taken : styles.free} />
          ))}
        </span>
      ) : (
        <span className={styles.bar} aria-hidden="true">
          <span style={{ width: `${Math.min(100, (going / capacity) * 100)}%` }} />
        </span>
      )}
      <span className={styles.caption}>
        <span className={styles.stateDot} aria-hidden="true" />
        <span className={styles.num}>
          {capacity}석 중 {going}명 신청
        </span>
        <span className={styles.state}>{state === "full" ? SEAT_LABELS.full : `${SEAT_LABELS[state]} · ${left}석 남음`}</span>
      </span>
    </div>
  );
}
