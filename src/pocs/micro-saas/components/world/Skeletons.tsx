import ui from "./ui.module.css";
import styles from "./skeleton.module.css";

/** Loading states drawn as the empty form they will fill: the same frames and rules, no text yet. */

const Bar = ({ w, h = 14 }: { w: string; h?: number }) => <span className={styles.bar} style={{ width: w, height: h }} />;

function Rows({ count, tall = true }: { count: number; tall?: boolean }) {
  return (
    <ol className={styles.rows}>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={tall ? styles.row : styles.rowShort}>
          <Bar w="44px" h={18} />
          <span className={styles.stack}>
            <Bar w={`${40 + ((i * 17) % 35)}%`} />
            <Bar w={`${25 + ((i * 11) % 25)}%`} h={11} />
          </span>
          {tall ? <span className={styles.sealCell} /> : null}
        </li>
      ))}
    </ol>
  );
}

export function DashboardSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="예약장을 불러오는 중">
      <div className={styles.ledger}>
        <span className={styles.stack}>
          <Bar w="56px" h={12} />
          <Bar w="220px" h={36} />
        </span>
        <span className={styles.tally}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={styles.tallyCell}>
              <Bar w="60%" h={10} />
              <Bar w="28px" h={26} />
            </span>
          ))}
        </span>
      </div>
      <div className={styles.split}>
        <section className={ui.sheet}>
          <div className={ui.sheetHead}>
            <Bar w="90px" />
          </div>
          <Rows count={6} />
        </section>
        <section className={ui.sheet}>
          <div className={ui.sheetHead}>
            <Bar w="70px" />
          </div>
          <Rows count={3} />
        </section>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className={styles.split} aria-busy="true" aria-label="달력을 불러오는 중">
      <section className={ui.sheet}>
        <div className={ui.sheetHead}>
          <Bar w="120px" h={20} />
        </div>
        <div className={styles.month}>
          {Array.from({ length: 35 }, (_, i) => (
            <span key={i} className={styles.dayCell} />
          ))}
        </div>
      </section>
      <section className={ui.sheet}>
        <div className={ui.sheetHead}>
          <Bar w="120px" />
        </div>
        <Rows count={5} />
      </section>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="목록을 불러오는 중">
      <section className={ui.sheet}>
        <span className={styles.search} />
        <Rows count={8} tall={false} />
      </section>
    </div>
  );
}

export function SlipSkeleton() {
  return (
    <div className={styles.slipWrap} aria-busy="true" aria-label="예약 페이지를 불러오는 중">
      <span className={styles.plate} />
      <span className={styles.slip}>
        <Bar w="100%" h={40} />
        <Bar w="40%" h={20} />
        <Rows count={4} tall={false} />
      </span>
    </div>
  );
}
