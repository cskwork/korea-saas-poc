import { Cell } from "./Cells";
import styles from "./EmptyState.module.css";

/** Empty lists teach the next step instead of saying "nothing here". */
export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <div className={styles.cells} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <Cell key={i} state="hollow" size={10} />
        ))}
      </div>
      <p className={styles.title}>{title}</p>
      {children ? <p className={styles.text}>{children}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
