import Link from "next/link";
import clsx from "clsx";
import { Download, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { formatPercent, formatWon } from "@/core/format";
import type { RevenueReport as Report } from "../../server/reads";
import { monthLabel } from "../../domain/calendar";
import { settlement, type ItemRevenue } from "../../domain/revenue";
import ui from "../ui/ui.module.css";
import { MonthlyChart } from "./MonthlyChart";
import styles from "./revenue.module.css";

const BASE = "/online-education/revenue";

export function RevenueReport({ report }: { report: Report & { months: number } }) {
  const { series, month, period, items, refunds, courseColors, courseTitles, months } = report;
  const courseItems = items.filter((item) => item.kind === "course");
  const productItems = items.filter((item) => item.kind === "product");
  const courseOrder = courseItems.map((item) => item.key);
  const { fee, net } = settlement(period.total);
  const titles = { ...courseTitles, ...Object.fromEntries(courseItems.map((item) => [item.key, item.title])) };
  const totals = series.reduce(
    (sum, row) => ({
      course: sum.course + row.course,
      product: sum.product + row.product,
      total: sum.total + row.total,
      sales: sum.sales + row.sales,
      refunded: sum.refunded + row.refunded,
    }),
    { course: 0, product: 0, total: 0, sales: 0, refunded: 0 },
  );

  return (
    <>
      <header className={ui.pageHeader}>
        <div>
          <h1 className={ui.pageTitle}>수익 분석</h1>
          <p className={ui.pageLede}>
            결제 기록으로 계산한 매출이에요. 환불된 결제는 매출에서 빠져요.{" "}
            <span className={ui.badge} data-tone="sample">
              샘플 데이터
            </span>
          </p>
        </div>
        <div className={ui.headerActions}>
          <nav className={ui.tabs} aria-label="기간">
            {[6, 12].map((value) => (
              <Link key={value} href={`${BASE}?months=${value}`} className={ui.tab} aria-current={months === value ? "page" : undefined}>
                최근 {value}개월
              </Link>
            ))}
          </nav>
          <a href={`${BASE}/export?months=${months}`} className={ui.button} download>
            <Download size={16} aria-hidden />
            CSV 내보내기
          </a>
        </div>
      </header>

      <div className={styles.ledger}>
        <p className={styles.ledgerLead}>
          {monthLabel(month.month)} 1–{month.throughDay}일 매출은 <strong className={ui.num}>{formatWon(month.current)}</strong>
          {month.growth === null ? (
            "이에요. 지난달 같은 기간에는 매출이 없어 비교할 수 없어요."
          ) : (
            <>
              으로, 지난달 같은 기간({formatWon(month.previous)})보다{" "}
              <span className={styles.growth} data-trend={month.growth >= 0 ? "up" : "down"}>
                {month.growth >= 0 ? <TrendingUp size={16} aria-hidden /> : <TrendingDown size={16} aria-hidden />}
                {formatPercent(Math.abs(month.growth), 0)} {month.growth >= 0 ? "늘었어요" : "줄었어요"}
              </span>
              .
            </>
          )}
        </p>
        <p className={styles.ledgerDetail}>
          최근 {months}개월 동안 결제 {totals.sales.toLocaleString("ko-KR")}건으로 <strong className={ui.num}>{formatWon(period.total)}</strong>을
          벌었고, 강의가 {formatPercent(period.courseShare, 0)}, 디지털 상품이 {formatPercent(period.total ? 1 - period.courseShare : 0, 0)}예요.
          환불 {formatWon(refunds)}은 이미 뺐고, 결제 수수료 3.5%({formatWon(fee)})를 빼면{" "}
          <strong className={ui.num}>{formatWon(net)}</strong>이 정산될 예정이에요.
        </p>
      </div>

      <section className={styles.chartSection} aria-labelledby="chart-heading">
        <div className={ui.sectionHead}>
          <h2 id="chart-heading" className={ui.sectionTitle}>
            월별 매출
          </h2>
        </div>
        <ul role="list" className={styles.legend} aria-label="범례">
          {courseItems.map((item) => (
            <li key={item.key} data-color={item.id ? courseColors[item.id] : undefined}>
              <span className={ui.swatch} aria-hidden />
              {item.title}
              {item.id ? "" : " (삭제됨)"}
            </li>
          ))}
          <li>
            <span className={styles.productSwatch} aria-hidden />
            디지털 상품
          </li>
        </ul>
        {period.total === 0 ? (
          <p className={clsx(ui.notice, ui.info)}>이 기간에는 결제가 없어요. 강의를 게시하고 스쿨 링크를 나눠 보세요.</p>
        ) : (
          <MonthlyChart series={series} courseOrder={courseOrder} colors={courseColors} titles={titles} />
        )}
      </section>

      <div className={styles.tables}>
        <ItemTable title="강의별 매출" items={courseItems} total={period.total} colors={courseColors} />
        <ItemTable title="디지털 상품별 매출" items={productItems} total={period.total} />
      </div>

      <section aria-labelledby="monthly-heading" className={styles.monthly}>
        <div className={ui.sectionHead}>
          <h2 id="monthly-heading" className={ui.sectionTitle}>
            월별 상세
          </h2>
        </div>
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">월</th>
                <th scope="col" className={ui.right}>
                  강의
                </th>
                <th scope="col" className={ui.right}>
                  디지털 상품
                </th>
                <th scope="col" className={ui.right}>
                  합계
                </th>
                <th scope="col" className={ui.right}>
                  결제
                </th>
                <th scope="col" className={ui.right}>
                  환불
                </th>
                <th scope="col" className={ui.right}>
                  정산 예정
                </th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((row) => (
                <tr key={row.month}>
                  <th scope="row" className={styles.rowHead}>
                    {monthLabel(row.month, true)}
                  </th>
                  <td className={ui.right}>{formatWon(row.course)}</td>
                  <td className={ui.right}>{formatWon(row.product)}</td>
                  <td className={clsx(ui.right, styles.strong)}>{formatWon(row.total)}</td>
                  <td className={ui.right}>{row.sales.toLocaleString("ko-KR")}건</td>
                  <td className={ui.right}>{row.refunded ? formatWon(row.refunded) : "–"}</td>
                  <td className={ui.right}>{formatWon(settlement(row.total).net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className={styles.rowHead}>
                  합계
                </th>
                <td className={ui.right}>{formatWon(totals.course)}</td>
                <td className={ui.right}>{formatWon(totals.product)}</td>
                <td className={ui.right}>{formatWon(totals.total)}</td>
                <td className={ui.right}>{totals.sales.toLocaleString("ko-KR")}건</td>
                <td className={ui.right}>{formatWon(totals.refunded)}</td>
                <td className={ui.right}>{formatWon(net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </>
  );
}

function ItemTable({
  title,
  items,
  total,
  colors,
}: {
  title: string;
  items: ItemRevenue[];
  total: number;
  colors?: Record<string, string>;
}) {
  return (
    <section aria-label={title}>
      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className={clsx(ui.notice, ui.info)}>이 기간의 판매가 없어요.</p>
      ) : (
        <ul role="list" className={styles.items}>
          {items.map((item) => (
            <li key={item.key} className={styles.item} data-color={item.id && colors ? colors[item.id] : undefined}>
              <span className={styles.itemName}>
                {colors ? <span className={ui.swatch} aria-hidden /> : <FileText size={14} aria-hidden className={styles.itemIcon} />}
                <span>
                  {item.title}
                  {item.id ? "" : <span className={styles.deleted}> 삭제됨</span>}
                </span>
              </span>
              <span className={clsx(ui.num, styles.itemAmount)}>{formatWon(item.revenue)}</span>
              <span className={styles.itemBar} aria-hidden>
                <span data-kind={colors ? "course" : "product"} style={{ width: `${total ? (item.revenue / total) * 100 : 0}%` }} />
              </span>
              <span className={styles.itemMeta}>
                {item.sales.toLocaleString("ko-KR")}건 · 비중 {formatPercent(total ? item.revenue / total : 0, 0)}
                {item.refunds ? ` · 환불 ${item.refunds}건` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
