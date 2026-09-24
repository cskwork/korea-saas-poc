import ui from "../ui/ui.module.css";
import styles from "./desk.module.css";

/** The desk's shape while it loads: a cover field and a contents column. */
export function DeskSkeleton() {
  return (
    <div className={styles.desk} aria-busy="true" aria-label="편집실을 불러오는 중">
      <div className={styles.cover} style={{ background: "var(--paper-3)" }}>
        <span className={ui.skeleton} style={{ width: 180, height: 96 }} />
        <span className={ui.skeleton} style={{ width: "80%", height: 36, marginTop: "auto" }} />
        <span className={ui.skeleton} style={{ width: "60%", height: 18 }} />
      </div>
      <div className={styles.lineup}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className={ui.skeleton} style={{ height: 40, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}
