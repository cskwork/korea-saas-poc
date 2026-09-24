import styles from "./skeleton.module.css";
import ui from "./ui.module.css";

/** Loading states shaped like the content they stand in for. */

function Bar({ width, height = 14, dark = false }: { width: string; height?: number; dark?: boolean }) {
  return <span className={`${styles.bar} ${dark ? styles.dark : ""}`} style={{ width, height }} />;
}

function SlidePlaceholder({ lines = 3 }: { lines?: number }) {
  return (
    <div className={`${ui.slide} ${styles.slide}`}>
      <Bar width="40%" height={12} />
      <Bar width="85%" height={24} />
      {Array.from({ length: lines }, (_, index) => (
        <Bar key={index} width={`${92 - index * 14}%`} />
      ))}
    </div>
  );
}

export function StageSkeleton() {
  return (
    <div className={styles.stage}>
      <Bar width="220px" height={40} dark />
      <div className={styles.stageText}>
        <Bar width="60%" height={22} dark />
        <Bar width="40%" height={12} dark />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div role="status" aria-label="피드를 불러오는 중" className={styles.wrap}>
      <StageSkeleton />
      <div className={styles.feed}>
        <div className={styles.agenda}>
          {Array.from({ length: 7 }, (_, index) => (
            <Bar key={index} width={`${70 - (index % 3) * 12}%`} height={16} />
          ))}
        </div>
        <div className={styles.column}>
          <Bar width="40%" height={28} />
          <SlidePlaceholder lines={1} />
          <SlidePlaceholder />
          <SlidePlaceholder />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className={`${ui.page} ${ui.pageNarrow} ${styles.column}`}>
      <Bar width="30%" height={14} />
      <div className={`${ui.slide} ${styles.slide} ${styles.tall}`}>
        <Bar width="35%" height={12} />
        <Bar width="80%" height={34} />
        <Bar width="30%" height={14} />
        {Array.from({ length: 6 }, (_, index) => (
          <Bar key={index} width={`${95 - (index % 3) * 10}%`} />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" className={`${ui.page} ${styles.column}`}>
      <Bar width="45%" height={30} />
      <Bar width="65%" height={14} />
      <div className={`${ui.slide} ${styles.slide}`}>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className={styles.row}>
            <span className={styles.circle} />
            <Bar width={`${60 - (index % 2) * 15}%`} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="대시보드를 불러오는 중" className={`${ui.page} ${styles.column}`}>
      <Bar width="30%" height={30} />
      <div className={`${ui.slide} ${styles.slide}`}>
        <Bar width="55%" height={22} />
        <div className={styles.kpis}>
          {Array.from({ length: 6 }, (_, index) => (
            <Bar key={index} width="70%" height={28} />
          ))}
        </div>
      </div>
      <div className={styles.deck}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`${ui.slide} ${styles.slide} ${styles.chart}`}>
            <Bar width="75%" height={18} />
            <div className={styles.columns}>
              {[40, 55, 50, 70, 80, 95].map((height, column) => (
                <span key={column} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
