import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** The heavy-over-light rule that opens every block, with its title. */
export function SectionHead({
  title,
  as: Heading = "h2",
  aside,
  id,
}: {
  title: ReactNode;
  as?: "h1" | "h2" | "h3";
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <Heading className={styles.sectionTitle} id={id}>
        {title}
      </Heading>
      {aside && <div className={styles.sectionAside}>{aside}</div>}
    </div>
  );
}

/** Marks sample or simulated figures so no visitor mistakes them for real ones. */
export function SampleNote({ children }: { children: ReactNode }) {
  return (
    <span className={styles.sampleNote}>
      <mark>샘플</mark>
      {children}
    </span>
  );
}
