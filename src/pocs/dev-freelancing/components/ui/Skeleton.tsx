import styles from "./Skeleton.module.css";

/** Loading placeholders shaped like the content they stand in for (no spinners over content). */

function Bar({ w, h = 12 }: { w: string; h?: number }) {
  return <span className={styles.bar} style={{ width: w, height: h }} />;
}

function Head() {
  return (
    <div className={styles.head}>
      <Bar w="160px" h={24} />
      <Bar w="min(420px, 80%)" />
    </div>
  );
}

function Cells({ weeks = 26 }: { weeks?: number }) {
  return (
    <div className={styles.cells} style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
      {Array.from({ length: weeks * 7 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

function Rows({ count = 5 }: { count?: number }) {
  return (
    <div className={styles.rows}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.square} />
          <Bar w={`${40 + ((i * 17) % 35)}%`} />
          <Bar w="90px" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ variant }: { variant: "overview" | "list" | "board" | "calendar" | "document" }) {
  return (
    <div className={styles.page} aria-busy="true" aria-label="불러오는 중">
      <span className={styles.srOnly} role="status">
        불러오는 중…
      </span>
      {variant === "document" ? (
        <div className={styles.document}>
          <div className={styles.side}>
            <Bar w="70%" h={20} />
            <Bar w="40%" />
            <Rows count={5} />
          </div>
          <div className={styles.sheet} />
        </div>
      ) : (
        <>
          <Head />
          {variant === "overview" || variant === "calendar" ? <Cells weeks={variant === "calendar" ? 52 : 26} /> : null}
          {variant === "board" ? (
            <div className={styles.board}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={styles.column}>
                  <Bar w="50%" />
                  {Array.from({ length: 3 - (i % 2) }, (_, j) => (
                    <span key={j} className={styles.card} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <Rows count={variant === "list" ? 8 : 4} />
          )}
        </>
      )}
    </div>
  );
}
