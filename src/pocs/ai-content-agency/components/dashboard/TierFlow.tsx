import Link from "next/link";
import { ORDER_STATUSES, STATUS_HINT, STATUS_LABEL, type OrderStatus } from "../../domain/pipeline";
import styles from "./dashboard.module.css";

/** The pipeline as one strip in the stage ramp; the list below is its legend and its table. */
export function TierFlow({ counts }: { counts: Record<OrderStatus, number> }) {
  const total = ORDER_STATUSES.reduce((sum, s) => sum + counts[s], 0);
  return (
    <section className={styles.section} aria-labelledby="flow-title">
      <div className={styles.sectionHead}>
        <h2 id="flow-title" className={styles.sectionLabel}>
          단계별 의뢰 {total}건
        </h2>
        <Link href="/ai-content-agency/orders">게시대 보기</Link>
      </div>
      {total > 0 ? (
        <div className={styles.flow} aria-hidden="true">
          {ORDER_STATUSES.filter((s) => counts[s] > 0).map((status) => (
            <span
              key={status}
              className={styles.flowSegment}
              data-stage={status}
              style={{ flexGrow: counts[status] }}
              title={`${STATUS_LABEL[status]} ${counts[status]}건`}
            />
          ))}
        </div>
      ) : null}
      <ul className={styles.flowList} role="list">
        {ORDER_STATUSES.map((status) => (
          <li key={status}>
            <Link href={`/ai-content-agency/orders#tier-${status}`} className={styles.flowItem}>
              <span className={`${styles.flowSegment} ${styles.flowSwatch}`} data-stage={status} aria-hidden="true" />
              <span className={styles.flowName}>{STATUS_LABEL[status]}</span>
              <span className={styles.flowCount}>{counts[status]}건</span>
              <span className={styles.flowHint}>{STATUS_HINT[status]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
