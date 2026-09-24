import Link from "next/link";
import { formatPercent, formatWon } from "@/core/format";
import { dDay, longDay } from "../../domain/dates";
import { INVOICE_STATUS_LABEL, PROJECT_STATUS_LABEL } from "../../domain/labels";
import { formatDuration, hoursLabel } from "../../domain/time";
import type { RevenueReport } from "../../server/data/insights";
import { invoiceCell } from "../documents/status";
import { Cell, StateLabel } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { PageHeader } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import { MonthCells } from "./MonthCells";
import styles from "./Revenue.module.css";

const BUCKETS = [
  { key: "current", label: "기한 전" },
  { key: "d1_30", label: "1–30일 지남" },
  { key: "d31_60", label: "31–60일 지남" },
  { key: "d61", label: "61일 넘음" },
] as const;

export function RevenueView({ report, hourlyRate }: { report: RevenueReport; hourlyRate: number }) {
  const { tax } = report;
  return (
    <div className={styles.page}>
      <PageHeader
        title="수익"
        description={`${report.year}년 입금 ${formatWon(report.yearPaid)} · 월평균 ${formatWon(report.monthlyAverage)} · 올해 ${hoursLabel(report.yearMinutes)}시간 작업`}
      />

      <section className={ui.region} aria-labelledby="rv-months">
        <div className={ui.regionHead}>
          <h2 id="rv-months" className={ui.regionTitle}>
            최근 12개월
          </h2>
          <p className={ui.regionNote}>
            올해 입금 ÷ 올해 작업 시간 = <strong className={styles.strong}>{report.yearRate === null ? "—" : `${formatWon(report.yearRate)}/시간`}</strong>
          </p>
        </div>
        <MonthCells months={report.months} goal={report.goal} />
      </section>

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="rv-owed">
          <div className={ui.regionHead}>
            <h2 id="rv-owed" className={ui.regionTitle}>
              받을 돈
            </h2>
            <p className={ui.regionNote}>
              {report.receivables.count}건 · {formatWon(report.receivables.amount)}
            </p>
          </div>
          <dl className={styles.buckets}>
            {BUCKETS.map((bucket) => (
              <div key={bucket.key} data-late={bucket.key !== "current" && report.receivables.buckets[bucket.key] > 0 ? "" : undefined}>
                <dt>{bucket.label}</dt>
                <dd>{formatWon(report.receivables.buckets[bucket.key])}</dd>
              </div>
            ))}
          </dl>
          {report.open.length === 0 ? (
            <EmptyState title="받을 돈이 없어요">모든 인보이스가 입금완료예요.</EmptyState>
          ) : (
            <ul role="list" className={styles.openList}>
              {report.open.map((invoice) => (
                <li key={invoice.id}>
                  <Cell state={invoiceCell(invoice.status, invoice.overdue)} size={10} />
                  <Link href={`/dev-freelancing/invoices/${invoice.id}`} className={ui.rowLink}>
                    {invoice.title}
                  </Link>
                  <span className={ui.num}>{formatWon(invoice.totals.payout)}</span>
                  <span className={invoice.overdue > 0 ? styles.late : ui.muted}>
                    {invoice.overdue > 0 ? `${invoice.overdue}일 지남` : `${INVOICE_STATUS_LABEL[invoice.status]} · ${dDay(invoice.dueOn, report.today)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.wallet} aria-labelledby="rv-tax">
          <h2 id="rv-tax" className={ui.regionTitle}>
            {report.year}년 세금 칸
          </h2>
          <div className={styles.walletRow}>
            <p className={styles.walletLabel}>원천징수된 세액 (기납부세액)</p>
            <p className={styles.walletValue}>{formatWon(tax.withheld)}</p>
            <p className={ui.hint}>
              3.3%로 받은 사업소득 {formatWon(tax.withheldIncomeTaxBase)}에서 떼인 세금이에요. {report.year + 1}년 5월 종합소득세 신고 때 정산해요.
            </p>
          </div>
          <div className={styles.walletRow}>
            <p className={styles.walletLabel}>부가세 예수금</p>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col">과세기간</th>
                  <th scope="col" className={ui.num}>
                    공급가액
                  </th>
                  <th scope="col" className={ui.num}>
                    부가세
                  </th>
                  <th scope="col">신고·납부 기한</th>
                </tr>
              </thead>
              <tbody>
                {tax.vatPeriods.map((period) => (
                  <tr key={period.period}>
                    <td>{period.period}기 ({period.period === 1 ? "1–6월" : "7–12월"})</td>
                    <td className={ui.num}>{formatWon(period.supply)}</td>
                    <td className={ui.num}>{formatWon(period.vat)}</td>
                    <td>{longDay(period.dueOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={ui.hint}>부가세 10%로 발행한 인보이스만 모여요. 사업자 미등록이면 비어 있는 게 정상이에요.</p>
          </div>
        </section>
      </div>

      <div className={styles.split}>
        <section className={ui.region} aria-labelledby="rv-clients">
          <div className={ui.regionHead}>
            <h2 id="rv-clients" className={ui.regionTitle}>
              고객별 입금 ({report.year}년)
            </h2>
          </div>
          {report.shares.length === 0 ? (
            <p className={ui.muted}>올해 입금이 아직 없어요.</p>
          ) : (
            <ul role="list" className={styles.shares}>
              {report.shares.map((share) => (
                <li key={share.clientId ?? "none"}>
                  <span className={styles.shareName}>
                    {share.clientId ? <Link href={`/dev-freelancing/clients/${share.clientId}`}>{share.clientName}</Link> : share.clientName}
                  </span>
                  <span className={styles.shareCells} role="img" aria-label={`${formatPercent(share.share, 0)}`}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <span key={i} className={ui.cell} data-state={i < Math.round(share.share * 20) ? "solid" : undefined} />
                    ))}
                  </span>
                  <span className={ui.num}>
                    {formatWon(share.paid)} <span className={ui.muted}>{formatPercent(share.share, 0)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={ui.region} aria-labelledby="rv-projects">
          <div className={ui.regionHead}>
            <h2 id="rv-projects" className={ui.regionTitle}>
              프로젝트별 실효 시급
            </h2>
            <p className={ui.regionNote}>입금 ÷ 기록한 시간 · 완료 프로젝트만 기본 시급 {formatWon(hourlyRate)}과 비교</p>
          </div>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col">프로젝트</th>
                  <th scope="col" className={ui.num}>
                    입금
                  </th>
                  <th scope="col" className={ui.num}>
                    시간
                  </th>
                  <th scope="col" className={ui.num}>
                    시급
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link href={`/dev-freelancing/projects/${project.id}`} className={ui.rowLink}>
                        {project.title}
                      </Link>
                      <p className={ui.muted}>
                        <StateLabel state={project.status === "done" ? "solid" : "partial"}>{PROJECT_STATUS_LABEL[project.status]}</StateLabel>
                      </p>
                    </td>
                    <td className={ui.num}>{formatWon(project.paid)}</td>
                    <td className={`${ui.num} ${ui.measure}`}>{formatDuration(project.trackedMinutes)}</td>
                    <td className={ui.num}>
                      {project.paid === 0 || project.rate === null ? (
                        <span className={ui.muted}>입금 전</span>
                      ) : project.status === "done" ? (
                        <span className={project.rate < hourlyRate ? styles.below : styles.above}>{formatWon(project.rate)}</span>
                      ) : (
                        <>
                          {formatWon(project.rate)}
                          {project.paid < project.budget ? <p className={ui.muted}>일부 입금</p> : null}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
