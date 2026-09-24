import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { formatKrw, formatNumber, formatPercent } from "@/core/format";
import type { Analytics } from "../../domain/analytics";
import { Delta } from "../ui/Delta";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import styles from "./overview.module.css";

function shortDay(dateKey: string) {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${m}/${d}`;
}

/** The last 7 days as a 장끼 (wholesale receipt): lines with dotted leaders and the change vs the week before. */
export function WeekTally({ week }: { week: Analytics }) {
  const { current, change, days } = week;
  const costs = current.revenue - current.profit;
  const max = Math.max(...days.map((d) => d.revenue), 1);
  const lines = [
    { label: "매출", value: formatKrw(current.revenue), delta: <Delta value={change.revenue} label="매출" /> },
    { label: "주문", value: `${formatNumber(current.orders)}건`, delta: <Delta value={change.orders} label="주문" /> },
    { label: "매입·수수료·배송", value: `−${formatKrw(costs)}`, delta: null },
  ];
  return (
    <Slip
      title="최근 7일 장끼"
      titleId="tally-title"
      meta={`${shortDay(days[0].date)} – ${shortDay(days[days.length - 1].date)}`}
    >
      <dl className={styles.tally}>
        {lines.map((line) => (
          <div key={line.label} className={styles.tallyLine}>
            <dt>{line.label}</dt>
            <dd>
              <span className={ui.num}>{line.value}</span>
              {line.delta}
            </dd>
          </div>
        ))}
        <div className={clsx(styles.tallyLine, styles.tallyTotal)}>
          <dt>남은 돈</dt>
          <dd>
            <span className={clsx(ui.num, current.profit < 0 && ui.loss)}>{formatKrw(current.profit)}</span>
            <Delta value={change.profit} label="남은 돈" />
          </dd>
        </div>
        <div className={styles.tallyLine}>
          <dt>마진율</dt>
          <dd>
            <span className={ui.num}>{formatPercent(current.marginRate)}</span>
            <Delta value={change.marginRate} kind="points" label="마진율" />
          </dd>
        </div>
        <div className={styles.tallyLine}>
          <dt>취소</dt>
          <dd>
            <span className={ui.num}>{formatNumber(current.cancelled)}건</span>
          </dd>
        </div>
      </dl>
      <figure className={styles.week}>
        <figcaption className={ui.visuallyHidden}>일별 매출</figcaption>
        <ol className={styles.weekBars}>
          {days.map((day) => (
            <li key={day.date} className={styles.weekDay}>
              <span className={styles.weekTrack}>
                <span
                  className={styles.weekBar}
                  style={{ height: `${Math.max((day.revenue / max) * 100, day.revenue > 0 ? 4 : 0)}%` }}
                />
              </span>
              <span className={styles.weekLabel}>{shortDay(day.date)}</span>
              <span className={ui.visuallyHidden}>
                {formatKrw(day.revenue)}, 주문 {day.orders}건
              </span>
            </li>
          ))}
        </ol>
      </figure>
      <Link href="/smart-store/analytics" className={styles.footLink}>
        매출 자세히 보기 <ArrowRight size={14} strokeWidth={2} aria-hidden />
      </Link>
    </Slip>
  );
}
