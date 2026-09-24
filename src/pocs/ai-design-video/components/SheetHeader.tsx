import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./sheet.module.css";

interface SheetHeaderProps {
  title: string;
  /** One line under the title. */
  lead?: ReactNode;
  /** Buttons at the title's side. */
  actions?: ReactNode;
  /** Labelled form cells printed beside the title. */
  children?: ReactNode;
}

/** The sheet's title block: the page title plus the printed cells of a 콘티 header. */
export function SheetHeader({ title, lead, actions, children }: SheetHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleCell}>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {children && <dl className={styles.cells}>{children}</dl>}
    </header>
  );
}

interface HeaderCellProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  href?: string;
  /** Highlights the cell (current filter). */
  current?: boolean;
  tone?: "alert";
  wide?: boolean;
}

export function HeaderCell({ label, value, sub, href, current, tone, wide }: HeaderCellProps) {
  return (
    <div
      className={[styles.cell, wide ? styles.cellWide : "", href ? styles.cellLinked : ""].join(" ")}
      data-tone={tone}
      data-current={current || undefined}
    >
      <dt className={styles.cellLabel}>{label}</dt>
      <dd className={styles.cellValue}>
        {href ? (
          // The link stretches over the whole cell (see .cellLinked).
          <Link href={href} className={styles.cellLink} aria-current={current ? "true" : undefined}>
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
      {sub && <dd className={styles.cellSub}>{sub}</dd>}
    </div>
  );
}
