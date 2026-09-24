import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** An empty slip that says what would be here and how to get it. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
