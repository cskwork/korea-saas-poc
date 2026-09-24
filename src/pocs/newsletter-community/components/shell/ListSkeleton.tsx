import ui from "../ui/ui.module.css";
import styles from "./page.module.css";

/** A page title, a toolbar and rows: the shape of every list page while it loads. */
export function ListSkeleton({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <div className={styles.pageHeader}>
        <span className={ui.skeleton} style={{ width: 200, height: 40 }} />
      </div>
      <span className={ui.skeleton} style={{ height: 40, marginBottom: 24 }} />
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className={ui.skeleton} style={{ height: 52, marginBottom: 10 }} />
      ))}
    </div>
  );
}
