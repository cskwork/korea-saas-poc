import { formatDate } from "@/core/format";
import { dueState } from "../domain/calendar";
import { STATUS_INFO, type OrderStatus } from "../domain/catalog";
import { revisionAllowance } from "../domain/workflow";
import styles from "./ui.module.css";

/** "S#2 시안작업" — the order's scene on the sheet. */
export function StatusMark({ status }: { status: OrderStatus }) {
  const info = STATUS_INFO[status];
  return (
    <span className={styles.status} data-medium={info.medium}>
      <span className={styles.scene}>S#{info.scene}</span>
      {info.label}
    </span>
  );
}

/** Deadline in the sheet's 마감 column: D-day plus the calendar date. */
export function DueMark({
  dueDate,
  today,
  done,
  align = "end",
}: {
  dueDate: string;
  today: string;
  done?: boolean;
  align?: "start" | "end";
}) {
  const state = dueState(dueDate, today);
  return (
    <span className={styles.due} data-tone={done ? "later" : state.tone} data-align={align}>
      <span className={styles.dueLabel}>{done ? "납품" : state.label}</span>
      <span className={styles.dueDate}>
        {formatDate(`${dueDate}T00:00:00+09:00`, { month: "short", day: "numeric", weekday: "short" })}
      </span>
    </span>
  );
}

/** Revision rounds as tick boxes: filled = used, red = billed beyond the allowance. */
export function RevisionTally({ limit, used }: { limit: number | null; used: number }) {
  if (limit === null) {
    return <span className={styles.tally}>수정 {used}회 · 무제한</span>;
  }
  const { remaining } = revisionAllowance(limit, used);
  const boxes = Math.max(limit, used);
  return (
    <span className={styles.tally}>
      <span className={styles.tallyBoxes} aria-hidden="true">
        {Array.from({ length: Math.min(boxes, 8) }, (_, i) => (
          <span key={i} className={styles.tallyBox} data-used={i < used} data-extra={i >= limit && i < used} />
        ))}
      </span>
      <span>
        수정 {used}/{limit}
        {used > limit ? ` · 추가 ${used - limit}회` : remaining === 0 ? " · 소진" : ""}
      </span>
    </span>
  );
}
