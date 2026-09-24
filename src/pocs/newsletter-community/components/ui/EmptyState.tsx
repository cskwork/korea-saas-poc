import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** An empty state that says what belongs here and how to put it there. */
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <div className={styles.emptyText}>{children}</div>
      {action}
    </div>
  );
}
