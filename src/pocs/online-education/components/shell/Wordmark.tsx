import styles from "./shell.module.css";

/** 에듀마켓 mark: a tiny timetable, two stacked lessons beside one long lesson. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden className={styles.mark}>
      <rect x="1" y="1" width="11" height="10" rx="2.5" data-part="a" />
      <rect x="1" y="13" width="11" height="12" rx="2.5" data-part="b" />
      <rect x="14" y="1" width="11" height="24" rx="2.5" data-part="c" />
    </svg>
  );
}

export function Wordmark({ caption }: { caption?: string }) {
  return (
    <span className={styles.wordmark}>
      <Mark />
      <span className={styles.wordmarkText}>
        <span className={styles.wordmarkName}>에듀마켓</span>
        {caption ? <span className={styles.wordmarkCaption}>{caption}</span> : null}
      </span>
    </span>
  );
}
