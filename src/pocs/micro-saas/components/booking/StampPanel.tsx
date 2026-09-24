"use client";

import type { BookingStatus } from "../../db/schema";
import { STATUS_LABEL, nextStamps } from "../../domain/status";
import { useStampPress } from "../daybook/useStampPress";
import { Stamp } from "../world/Stamp";
import ui from "../world/ui.module.css";
import styles from "./detail.module.css";

const BUTTON: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: "확정 도장", className: ui.confirm },
  cancelled: { label: "취소 도장", className: ui.cancel },
  pending: { label: "대기로 되돌리기", className: ui.line },
};

/** The slip's 결재란: the current seal, large, and the stamps that can still be pressed. */
export function StampPanel({ booking }: { booking: { id: string; status: BookingStatus } }) {
  const { status, busy, press, fresh } = useStampPress(booking);
  return (
    <div className={styles.approval}>
      <p className={styles.approvalHead}>결재</p>
      <div className={styles.approvalBox}>
        <Stamp key={status} status={status} id={booking.id} fresh={fresh} />
      </div>
      <p className={styles.approvalNote}>현재 {STATUS_LABEL[status]}</p>
      <div className={styles.approvalActions}>
        {nextStamps(status).map((next) => (
          <button
            key={next}
            type="button"
            className={`${ui.btn} ${BUTTON[next].className} ${ui.small} ${ui.block}`}
            onClick={() => press(next)}
            disabled={busy}
          >
            {BUTTON[next].label}
          </button>
        ))}
      </div>
    </div>
  );
}
