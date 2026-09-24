import type { Tally as TallyCounts } from "../../domain/stats";
import { Mark } from "../world/Stamp";
import styles from "./dashboard.module.css";

/** Four ruled cells in one ink frame: 전체, 확정, 대기, 취소, each with its mark shape. */
export function Tally({ tally, label, totalLabel = "오늘 전체 예약" }: { tally: TallyCounts; label: string; totalLabel?: string }) {
  return (
    <dl className={styles.tally} aria-label={label}>
      <div className={styles.tallyCell}>
        <dt>{totalLabel}</dt>
        <dd>{tally.total}</dd>
      </div>
      <div className={`${styles.tallyCell} ${styles.isConfirmed}`}>
        <dt>
          <Mark status="confirmed" />
          확정
        </dt>
        <dd>{tally.confirmed}</dd>
      </div>
      <div className={`${styles.tallyCell} ${styles.isPending}`}>
        <dt>
          <Mark status="pending" />
          대기
        </dt>
        <dd>{tally.pending}</dd>
      </div>
      <div className={`${styles.tallyCell} ${styles.isCancelled}`}>
        <dt>
          <Mark status="cancelled" />
          취소
        </dt>
        <dd>{tally.cancelled}</dd>
      </div>
    </dl>
  );
}
