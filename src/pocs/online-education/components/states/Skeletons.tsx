import clsx from "clsx";
import ui from "../ui/ui.module.css";
import styles from "./states.module.css";

/** Loading placeholders shaped like the screens they stand in for. */

function Bar({ w, h = 14, className }: { w: string | number; h?: number; className?: string }) {
  return <span className={clsx(ui.skeleton, styles.bar, className)} style={{ width: w, height: h }} />;
}

export function HeaderSkeleton() {
  return (
    <div className={styles.header}>
      <Bar w={220} h={34} />
      <Bar w={320} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="시간표를 불러오는 중">
      <HeaderSkeleton />
      <div className={styles.dashboard}>
        <div className={styles.weekGrid}>
          {Array.from({ length: 8 * 12 }, (_, i) => (
            <span key={i} className={styles.weekCell} />
          ))}
        </div>
        <div className={styles.sidePanel}>
          <Bar w="50%" h={18} />
          <Bar w="90%" h={28} />
          <Bar w="80%" />
          <Bar w="100%" h={22} />
          <Bar w="60%" />
          <Bar w="70%" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="목록을 불러오는 중">
      <HeaderSkeleton />
      <div className={styles.toolbar}>
        <Bar w={280} h={40} />
        <Bar w={220} h={38} />
      </div>
      <div className={styles.list}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.row}>
            <Bar w={72} h={54} />
            <div className={styles.rowText}>
              <Bar w="55%" h={16} />
              <Bar w="35%" h={12} />
            </div>
            <Bar w={90} h={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div aria-busy="true" aria-label="커리큘럼을 불러오는 중">
      <HeaderSkeleton />
      <div className={styles.board}>
        {[3, 4, 2].map((count, column) => (
          <div key={column} className={styles.boardColumn}>
            <Bar w="70%" h={18} />
            {Array.from({ length: count }, (_, i) => (
              <Bar key={i} w="100%" h={56 + ((i + column) % 3) * 22} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div aria-busy="true" aria-label="리포트를 불러오는 중">
      <HeaderSkeleton />
      <div className={styles.chart}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className={clsx(ui.skeleton, styles.chartBar)} style={{ height: `${30 + i * 5}%` }} />
        ))}
      </div>
      <div className={styles.list}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.row}>
            <Bar w="40%" />
            <Bar w={120} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <div aria-busy="true" aria-label="강의 정보를 불러오는 중" className={styles.landing}>
      <div className={styles.landingMain}>
        <Bar w={120} />
        <Bar w="80%" h={40} />
        <Bar w="90%" />
        <Bar w="60%" />
        <div className={styles.board}>
          {[3, 3, 4].map((count, column) => (
            <div key={column} className={styles.boardColumn}>
              <Bar w="70%" h={18} />
              {Array.from({ length: count }, (_, i) => (
                <Bar key={i} w="100%" h={60} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.sidePanel}>
        <Bar w="60%" h={30} />
        <Bar w="100%" h={120} />
        <Bar w="100%" h={44} />
      </div>
    </div>
  );
}
