"use client";

import Link from "next/link";
import { STATUS_LABEL } from "../../domain/status";
import { formatMinute, shortDayLabel } from "../../domain/time";
import type { BookingRow } from "../../server/store/bookings";
import { Stamp } from "../world/Stamp";
import ui from "../world/ui.module.css";
import styles from "./daybook.module.css";
import { useStampPress } from "./useStampPress";

/**
 * One ruled line of the day-book: time, customer and service, the stamps the owner can press,
 * and the 결재 cell. A stamp lands at once (optimistic) and can be taken back from the toast.
 */
export function BookingLine({
  booking,
  past,
  today,
  showDate = false,
}: {
  booking: BookingRow;
  past: boolean;
  today: string;
  showDate?: boolean;
}) {
  const { status, busy, press, fresh } = useStampPress(booking);

  const who = `${booking.customerName} ${formatMinute(booking.startMinute)}`;
  const end = formatMinute(booking.startMinute + booking.durationMinutes);

  return (
    <li
      className={`${styles.row}${status === "cancelled" ? ` ${styles.cancelled}` : ""}${past ? ` ${styles.past}` : ""}`}
      aria-busy={busy}
    >
      <span className={styles.time}>
        {showDate ? <span className={styles.day}>{shortDayLabel(booking.date, today)}</span> : null}
        <span className={styles.start}>{formatMinute(booking.startMinute)}</span>
        <span className={styles.end}>~{end}</span>
      </span>
      <div className={styles.main}>
        <p className={styles.name}>
          <Link href={`/micro-saas/bookings/${booking.id}`}>{booking.customerName}</Link>
          {booking.source === "online" ? <span className={ui.tag}>온라인</span> : null}
        </p>
        <p className={styles.meta}>
          {booking.serviceName} · {booking.customerPhone}
        </p>
        {booking.memo ? <p className={styles.memo}>{booking.memo}</p> : null}
      </div>
      {status === "pending" ? (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${ui.btn} ${ui.confirm} ${ui.small}`}
            onClick={() => press("confirmed")}
            disabled={busy}
            aria-label={`${who} 예약 확정`}
          >
            확정
          </button>
          <button
            type="button"
            className={`${ui.btn} ${ui.cancel} ${ui.small}`}
            onClick={() => press("cancelled")}
            disabled={busy}
            aria-label={`${who} 예약 취소`}
          >
            취소
          </button>
        </div>
      ) : status === "confirmed" && !past ? (
        <div className={`${styles.actions} ${styles.quiet}`}>
          <button
            type="button"
            className={`${ui.btn} ${ui.text} ${ui.small}`}
            onClick={() => press("cancelled")}
            disabled={busy}
            aria-label={`${who} 예약 취소`}
          >
            취소
          </button>
        </div>
      ) : null}
      <div className={styles.seal} title={`결재: ${STATUS_LABEL[status]}`}>
        <Stamp key={status} status={status} id={booking.id} fresh={fresh} />
      </div>
    </li>
  );
}
