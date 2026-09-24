import type { ReactNode } from "react";
import styles from "./book.module.css";

/** Centres a fallback (error, unknown receipt) in the booking page's column. */
export function BookNotice({ children }: { children: ReactNode }) {
  return <div className={styles.notice}>{children}</div>;
}
