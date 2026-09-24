import { formatDate, formatTime } from "@/core/format";
import { ORDER_STATUSES, STATUS_LABEL, statusIndex, type OrderStatus } from "../../domain/pipeline";
import styles from "./orders.module.css";

/** 접수 → 작성중 → 검수 → 납품완료 with the time each was reached. */
export function StageSteps({ status, events }: { status: OrderStatus; events: { status: OrderStatus; createdAt: Date }[] }) {
  const current = statusIndex(status);
  const reachedAt = (s: OrderStatus) => events.filter((e) => e.status === s).at(-1)?.createdAt;
  return (
    <ol className={styles.steps} aria-label="진행 단계">
      {ORDER_STATUSES.map((s, i) => {
        const at = i <= current ? reachedAt(s) : undefined;
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s} className={styles.step} data-state={state} aria-current={state === "current" ? "step" : undefined}>
            <strong>{STATUS_LABEL[s]}</strong>
            <span>{at ? `${formatDate(at, { month: "numeric", day: "numeric" })} ${formatTime(at)}` : i <= current ? "기록 없음" : "대기"}</span>
          </li>
        );
      })}
    </ol>
  );
}
