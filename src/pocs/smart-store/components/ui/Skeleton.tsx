import clsx from "clsx";
import styles from "./skeleton.module.css";

type Variant = "overview" | "board" | "detail" | "charts";

function Lines({ count, className }: { count: number; className?: string }) {
  return (
    <div className={clsx(styles.lines, className)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={styles.line} style={{ width: `${88 - ((i * 17) % 40)}%` }} />
      ))}
    </div>
  );
}

/** Loading placeholders shaped like the page that is coming (no spinners in content). */
export function Skeleton({ variant }: { variant: Variant }) {
  return (
    <div className={styles.root} aria-busy="true" aria-label="불러오는 중">
      <span className={styles.title} />
      <span className={styles.lede} />
      {variant === "overview" ? (
        <>
          <div className={styles.split}>
            <div className={styles.slip}>
              <Lines count={6} />
            </div>
            <div className={styles.slip}>
              <Lines count={7} />
            </div>
          </div>
          <div className={styles.tags}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={styles.tag} />
            ))}
          </div>
        </>
      ) : null}
      {variant === "board" ? (
        <>
          <span className={styles.filters} />
          <div className={styles.slip}>
            <Lines count={9} className={styles.rows} />
          </div>
        </>
      ) : null}
      {variant === "detail" ? (
        <div className={styles.split}>
          <div className={styles.slip}>
            <Lines count={10} />
          </div>
          <div className={styles.slip}>
            <span className={styles.tag} />
            <Lines count={5} />
          </div>
        </div>
      ) : null}
      {variant === "charts" ? (
        <>
          <span className={styles.filters} />
          <div className={styles.slip}>
            <span className={styles.chart} />
          </div>
        </>
      ) : null}
    </div>
  );
}
