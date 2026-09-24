import clsx from "clsx";
import { Page } from "./primitives";
import styles from "./states.module.css";

/** Loading placeholders shaped like the screens they stand in for. */

function Bone({ w = "100%", h = 14 }: { w?: string | number; h?: number }) {
  return <span className={styles.bone} style={{ width: w, height: h }} />;
}

function BandSkeleton({ split }: { split?: boolean }) {
  return (
    <div className={clsx(styles.skBand, styles.onYellow)}>
      <div className={clsx(styles.skBandInner, !split && styles.skBandSimple)}>
        <div className={styles.skStack}>
          <Bone w="45%" h={36} />
          {split ? <Bone w="70%" h={84} /> : <Bone w="55%" h={16} />}
          {split ? <Bone w="90%" h={96} /> : null}
        </div>
        {split ? (
          <div className={styles.skStack}>
            <Bone w="30%" h={22} />
            <Bone h={200} />
            <Bone h={58} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className={styles.skRail}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={styles.skLabel}>
          <Bone w="60%" h={10} />
          <Bone w="85%" h={16} />
          <Bone w="50%" h={32} />
          <Bone w="70%" h={10} />
          <Bone h={28} />
        </div>
      ))}
    </div>
  );
}

function RowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className={styles.skRows}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skRow}>
          <Bone w="80%" />
          <Bone w="60%" />
          <Bone w="50%" />
          <Bone w="55%" />
          <Bone w="70%" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="대시보드를 불러오는 중">
      <BandSkeleton split />
      <Page>
        <div className={styles.skStack}>
          <Bone w={220} h={24} />
          <RailSkeleton />
        </div>
        <div className={styles.skColumns}>
          <RowsSkeleton rows={4} />
          <RowsSkeleton rows={6} />
        </div>
      </Page>
    </div>
  );
}

export function ListSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <BandSkeleton />
      <Page>
        <Bone h={44} />
        <RowsSkeleton rows={9} />
      </Page>
    </div>
  );
}

export function DetailSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <BandSkeleton split />
      <Page>
        <div className={styles.skColumns}>
          <RowsSkeleton rows={6} />
          <RowsSkeleton rows={6} />
        </div>
      </Page>
    </div>
  );
}

export function ChartsSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <BandSkeleton />
      <Page>
        <Bone h={220} />
        <div className={styles.skColumns}>
          <RowsSkeleton rows={6} />
          <Bone h={240} />
        </div>
      </Page>
    </div>
  );
}
