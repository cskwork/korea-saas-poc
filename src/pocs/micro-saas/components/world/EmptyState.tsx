import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./empty.module.css";

/** An open, unwritten ledger page: the illustration sits on the paper, the text carries the meaning. */
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <Image src="/micro-saas/empty-book-480.webp" width={480} height={480} alt="" className={styles.art} sizes="180px" />
      <p className={styles.title}>{title}</p>
      <p className={styles.body}>{children}</p>
      {action}
    </div>
  );
}
