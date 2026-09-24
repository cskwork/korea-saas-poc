import { longDate, shortDate, weekdayLabel } from "../../domain/dates";
import { dueState, type OrderStatus } from "../../domain/pipeline";
import styles from "./ui.module.css";

/** The 게시기간 sticker: due day and how it stands today. */
export function DueSticker({
  dueDate,
  today,
  status,
  deliveredOn,
}: {
  dueDate: string;
  today: string;
  status: OrderStatus;
  deliveredOn?: string | null;
}) {
  const state = dueState({ dueDate, today, status, deliveredOn });
  return (
    <span className={styles.sticker} data-tone={state.tone} title={`마감 ${longDate(dueDate)}`}>
      <span className={styles.stickerDate}>
        마감 {shortDate(dueDate)} ({weekdayLabel(dueDate)})
      </span>
      <span className={styles.stickerLabel}>{state.label}</span>
    </span>
  );
}
