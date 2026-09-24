import type { ReactNode } from "react";
import styles from "./page.module.css";

/** Studio page title: the section's name set large, one line of context, actions on the right. */
export function PageHeader({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

/** A one-off notice after a redirect (e.g. "지웠어요"). */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className={styles.notice} role="status">
      {children}
    </p>
  );
}
