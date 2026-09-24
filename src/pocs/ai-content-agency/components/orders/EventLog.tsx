import { formatDate, formatTime } from "@/core/format";
import { STATUS_LABEL, type OrderStatus } from "../../domain/pipeline";
import styles from "./orders.module.css";

/** The order's history, newest last. */
export function EventLog({ events }: { events: { id: string; status: OrderStatus; note: string; createdAt: Date }[] }) {
  return (
    <ol className={styles.log}>
      {events.map((event) => (
        <li key={event.id} className={styles.logItem}>
          <time dateTime={event.createdAt.toISOString()}>
            {formatDate(event.createdAt, { month: "numeric", day: "numeric" })} {formatTime(event.createdAt)}
          </time>
          <span>
            <span className={styles.logStage}>{STATUS_LABEL[event.status]}</span>
            {event.note ? ` · ${event.note}` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}
