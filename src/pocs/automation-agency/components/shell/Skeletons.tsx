import type { ReactNode } from "react";
import clsx from "clsx";
import ui from "../ui/ui.module.css";
import styles from "./skeleton.module.css";

function Bar({ className }: { className?: string }) {
  return <span className={clsx(ui.skeleton, styles.bar, className)} />;
}

function Head() {
  return (
    <div className={styles.head}>
      <Bar className={styles.title} />
      <Bar className={styles.lede} />
    </div>
  );
}

function Loading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={styles.wrap}>
      <span className={ui.srOnly}>{label}</span>
      {children}
    </div>
  );
}

/** Network map shape: a line of five stations above the circle line. */
export function DashboardSkeleton() {
  return (
    <Loading label="운행 현황을 불러오는 중이에요">
      <Head />
      <div className={styles.line}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={styles.stop}>
            <span className={clsx(ui.skeleton, styles.disc)} />
            <Bar className={styles.short} />
            <Bar className={styles.shorter} />
          </span>
        ))}
      </div>
      <span className={clsx(ui.skeleton, styles.loop)} />
    </Loading>
  );
}

/** Filters plus timetable rows. */
export function TableSkeleton({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <Loading label={label}>
      <Head />
      <div className={styles.chips}>
        {Array.from({ length: 5 }, (_, i) => (
          <Bar key={i} className={styles.chip} />
        ))}
      </div>
      <div className={styles.rows}>
        {Array.from({ length: rows }, (_, i) => (
          <span key={i} className={styles.row}>
            <Bar className={styles.cellWide} />
            <Bar className={styles.cell} />
            <Bar className={styles.cell} />
          </span>
        ))}
      </div>
    </Loading>
  );
}

/** Canvas with an inspector column. */
export function BuilderSkeleton() {
  return (
    <Loading label="노선도를 불러오는 중이에요">
      <Head />
      <div className={styles.split}>
        <span className={clsx(ui.skeleton, styles.canvas)} />
        <span className={clsx(ui.skeleton, styles.side)} />
      </div>
    </Loading>
  );
}

/** A document sheet (quote) or detail page. */
export function DocumentSkeleton({ label }: { label: string }) {
  return (
    <Loading label={label}>
      <Head />
      <span className={clsx(ui.skeleton, styles.sheet)} />
    </Loading>
  );
}
