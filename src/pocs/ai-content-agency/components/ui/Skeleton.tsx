import styles from "./skeleton.module.css";

type Shape = "dashboard" | "board" | "list" | "document" | "form" | "wall" | "plans";

const b = (...names: string[]) => [styles.block, ...names].join(" ");

/** A quiet placeholder shaped like the page that is loading. */
export function Skeleton({ shape, label }: { shape: Shape; label: string }) {
  return (
    <div className={styles.page} role="status" aria-label={label}>
      <div className={b(styles.title)} />
      {shape === "dashboard" || shape === "board" ? (
        <div className={styles.stand}>
          {Array.from({ length: shape === "dashboard" ? 7 : 4 }, (_, i) =>
            shape === "dashboard" ? (
              <div key={i} className={b(styles.bar, styles.onBlue)} />
            ) : (
              <div key={i} className={styles.columns}>
                <div className={b(styles.card, styles.onBlue)} />
                <div className={b(styles.card, styles.onBlue)} />
              </div>
            ),
          )}
        </div>
      ) : null}
      {shape === "list" ? (
        <div className={styles.stack}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={b(styles.row)} />
          ))}
        </div>
      ) : null}
      {shape === "document" || shape === "form" ? (
        <div className={styles.split}>
          <div className={styles.stack}>
            {shape === "document" ? <div className={b(styles.proof)} /> : null}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={b(styles.line)} />
            ))}
          </div>
          <div className={styles.stack}>
            <div className={b(styles.card)} />
            <div className={b(styles.card)} />
          </div>
        </div>
      ) : null}
      {shape === "wall" ? (
        <div className={styles.columns}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={styles.stack}>
              <div className={b(styles.proof)} />
              <div className={b(styles.line)} />
              <div className={b(styles.line)} />
            </div>
          ))}
        </div>
      ) : null}
      {shape === "plans" ? (
        <div className={styles.poles}>
          <div className={b(styles.pole)} />
          <div className={b(styles.pole)} />
          <div className={b(styles.pole)} />
        </div>
      ) : null}
    </div>
  );
}
