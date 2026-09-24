import styles from "./states.module.css";

/** Loading shape of a sheet: title block, header cells and cut rows. */
export function SheetSkeleton({ rows = 5, cells = 5 }: { rows?: number; cells?: number }) {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-live="polite">
      <span className={styles.srOnly}>불러오는 중</span>
      <div className={styles.skHeader}>
        <div className={styles.skTitle}>
          <span className={styles.skLine} style={{ width: "58%", height: 28 }} />
          <span className={styles.skLine} style={{ width: "82%" }} />
        </div>
        <div className={styles.skCells}>
          {Array.from({ length: cells }, (_, i) => (
            <div key={i} className={styles.skCell}>
              <span className={styles.skLine} style={{ width: "60%" }} />
              <span className={styles.skLine} style={{ width: "40%", height: 22 }} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.skRows}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.skRow}>
            <span className={styles.skFrame} />
            <div className={styles.skText}>
              <span className={styles.skLine} style={{ width: `${70 - (i % 3) * 12}%`, height: 18 }} />
              <span className={styles.skLine} style={{ width: "44%" }} />
            </div>
            <span className={styles.skLine} style={{ width: 72, height: 22 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
