import Link from "next/link";
import clsx from "clsx";
import { formatKrw, formatNumber, formatPercent } from "@/core/format";
import { PERIODS, type Analytics } from "../../domain/analytics";
import { Delta } from "../ui/Delta";
import { PageHead } from "../ui/PageHead";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import styles from "./analytics.module.css";
import charts from "./charts.module.css";
import { DailyCharts } from "./DailyCharts";
import { CategoryShares, TopSellers } from "./Ranked";

function shortDay(dateKey: string) {
  const [, m, d] = dateKey.split("-").map(Number);
  return `${m}/${d}`;
}

export function AnalyticsPage({ analytics }: { analytics: Analytics }) {
  const { period, current, change, days } = analytics;
  const range = `${shortDay(days[0].date)} – ${shortDay(days[days.length - 1].date)}`;
  const figures = [
    { label: "매출", value: formatKrw(current.revenue), delta: <Delta value={change.revenue} label="매출" /> },
    { label: "주문", value: `${formatNumber(current.orders)}건`, delta: <Delta value={change.orders} label="주문" /> },
    {
      label: "남는 돈",
      value: formatKrw(current.profit),
      delta: <Delta value={change.profit} label="남는 돈" />,
      emphasis: true,
    },
    {
      label: "평균 마진율",
      value: formatPercent(current.marginRate),
      delta: <Delta value={change.marginRate} kind="points" label="평균 마진율" />,
    },
    { label: "취소", value: `${formatNumber(current.cancelled)}건`, delta: null },
  ];

  return (
    <>
      <PageHead
        title="매출"
        lede={`주문 기록으로 계산한 ${range} 매출이에요. 취소 주문은 매출에서 빠져요. 샘플 주문 기준이에요.`}
        actions={
          <nav className={styles.periods} aria-label="기간">
            {PERIODS.map((p) => (
              <Link
                key={p}
                href={p === 30 ? "/smart-store/analytics" : `/smart-store/analytics?period=${p}`}
                className={clsx(styles.period, p === period && styles.periodCurrent)}
                aria-current={p === period ? "page" : undefined}
                scroll={false}
              >
                최근 {p}일
              </Link>
            ))}
          </nav>
        }
      />

      <Slip flush className={styles.strip}>
        <dl className={styles.figures}>
          {figures.map((f) => (
            <div key={f.label} className={clsx(styles.figure, f.emphasis && styles.figureEmphasis)}>
              <dt>{f.label}</dt>
              <dd className={clsx(f.emphasis && current.profit < 0 && ui.loss)}>{f.value}</dd>
              <dd className={styles.figureDelta}>
                {f.delta ?? (
                  <span className={ui.muted}>
                    이전 {period}일 {formatNumber(analytics.previous.cancelled)}건
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.stripNote}>변화율은 바로 앞 {period}일과 비교한 값이에요.</p>
      </Slip>

      <Slip title="일별 매출과 남는 돈" titleId="daily-title" meta={range} className={styles.gap}>
        <DailyCharts days={days} />
        <details className={charts.tableToggle}>
          <summary>표로 보기</summary>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <caption className={ui.visuallyHidden}>일별 매출, 남는 돈, 주문 수</caption>
              <thead>
                <tr>
                  <th scope="col">날짜</th>
                  <th scope="col" className={ui.right}>
                    매출
                  </th>
                  <th scope="col" className={ui.right}>
                    남는 돈
                  </th>
                  <th scope="col" className={ui.right}>
                    주문
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...days].reverse().map((d) => (
                  <tr key={d.date}>
                    <th scope="row">{shortDay(d.date)}</th>
                    <td className={ui.right}>{formatKrw(d.revenue)}</td>
                    <td className={ui.right}>{formatKrw(d.profit)}</td>
                    <td className={ui.right}>{formatNumber(d.orders)}건</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Slip>

      <div className={styles.split}>
        <Slip title="카테고리별 매출" titleId="category-title" meta="매출 비중">
          <CategoryShares categories={analytics.categories} />
        </Slip>
        <Slip title="많이 판 상품 TOP 5" titleId="top-title" meta="매출 순">
          <TopSellers sellers={analytics.topSellers} />
        </Slip>
      </div>
    </>
  );
}
