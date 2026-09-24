import styles from "./ui.module.css";

export function PageHeader({ title, lead, actions }: { title: React.ReactNode; lead?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {lead ? <p className={styles.pageLead}>{lead}</p> : null}
      </div>
      {actions ? <div className={styles.pageActions}>{actions}</div> : null}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      {children}
    </div>
  );
}
