import Link from "next/link";
import { formatNumber, formatPercent, formatWon } from "@/core/format";
import { CHANNEL_LABEL, DEVICE_LABEL } from "../../domain/catalog";
import { shortDayLabel } from "../../domain/dates";
import { PERIODS, type AnalyticsReport } from "../../server/reports";
import { ColumnChart } from "../charts/ColumnChart";
import { clickColumns, hourColumns, revenueColumns } from "../charts/series";
import { BarList, ShareBar } from "../charts/ShareBar";
import { programShares } from "../display";
import { formStyles } from "../ui/Field";
import { Band, DeltaTag, Empty, Page, Section, ui } from "../ui/primitives";
import styles from "./analytics.module.css";

export function AnalyticsScreen({ report }: { report: AnalyticsReport }) {
  const { totals, deltas, range } = report;
  const shares = programShares(report.byProgram, report.programOrder);
  const peakEnd = (report.peak.start + 3) % 24;
  const rangeLabel = `${shortDayLabel(range.from)} ~ ${shortDayLabel(range.to)}`;

  return (
    <>
      <Band title="매출 분석" lead="클릭과 판매 기록으로 계산한 기간별 성과예요. 직전 같은 기간과 비교해 오르면 빨강, 내리면 파랑으로 표시해요.">
        <div className={styles.periodRow}>
          <nav className={formStyles.segmented} aria-label="기간">
            {PERIODS.map((days) => (
              <Link
                key={days}
                href={days === 30 ? "/affiliate-marketing/analytics" : `/affiliate-marketing/analytics?days=${days}`}
                className={formStyles.segment}
                aria-current={report.days === days ? "page" : undefined}
                scroll={false}
              >
                최근 {days}일
              </Link>
            ))}
          </nav>
          <p className={styles.rangeNote}>{rangeLabel}</p>
        </div>
        <dl className={styles.strip}>
          <div className={styles.cell}>
            <dt>수익</dt>
            <dd>
              <span className={styles.figure}>{formatWon(totals.revenue)}</span>
              <DeltaTag delta={deltas.revenue} label="수익" />
            </dd>
          </div>
          <div className={styles.cell}>
            <dt>클릭</dt>
            <dd>
              <span className={styles.figure}>{formatNumber(totals.clicks)}</span>
              <DeltaTag delta={deltas.clicks} label="클릭" />
            </dd>
          </div>
          <div className={styles.cell}>
            <dt>판매</dt>
            <dd>
              <span className={styles.figure}>{formatNumber(totals.conversions)}건</span>
              <DeltaTag delta={deltas.conversions} label="판매" />
            </dd>
          </div>
          <div className={styles.cell}>
            <dt>전환율 · 클릭당 수익</dt>
            <dd>
              <span className={styles.figure}>{formatPercent(totals.cvr)}</span>
              <DeltaTag delta={deltas.cvr} unit="points" label="전환율" />
              <span className={styles.compare}>클릭당 {formatWon(Math.round(totals.epc))}</span>
            </dd>
          </div>
        </dl>
      </Band>

      <Page>
        <div className={styles.pair}>
          <Section id="daily-revenue" title="일별 수익">
            <div className={ui.panelPad}>
              <ColumnChart title={`${rangeLabel} 일별 수익`} {...revenueColumns(report.series, { today: range.to })} />
            </div>
          </Section>
          <Section id="daily-clicks" title="일별 클릭" note="빨간 점은 판매가 있었던 날">
            <div className={ui.panelPad}>
              <ColumnChart title={`${rangeLabel} 일별 클릭`} {...clickColumns(report.series, { today: range.to, markOrders: true })} />
            </div>
          </Section>
        </div>

        <Section id="by-link" title="링크별 성과" note="수익 순 · 기간 안에 클릭이나 판매가 있었던 링크">
          {report.byLink.length > 0 ? (
            <div className={`${ui.panel} ${styles.scroll}`}>
              <table className={styles.table}>
                <caption className={ui.srOnly}>링크별 성과</caption>
                <thead>
                  <tr>
                    <th scope="col" className={styles.left}>
                      링크
                    </th>
                    <th scope="col">클릭</th>
                    <th scope="col">판매</th>
                    <th scope="col">전환율</th>
                    <th scope="col" className={styles.hideSm}>
                      클릭당
                    </th>
                    <th scope="col">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byLink.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className={styles.left}>
                        <Link href={`/affiliate-marketing/links/${row.key}`}>{row.link.productName}</Link>
                        <span className={styles.sub}>
                          {row.link.programName ?? "프로그램 미지정"} · {row.link.category}
                        </span>
                      </th>
                      <td>{formatNumber(row.clicks)}</td>
                      <td>{formatNumber(row.conversions)}</td>
                      <td>{formatPercent(row.cvr)}</td>
                      <td className={styles.hideSm}>{formatWon(Math.round(row.epc))}</td>
                      <td className={styles.revenue}>{formatWon(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="이 기간에는 기록이 없어요">기간을 늘려 보거나 짧은 링크를 글에 붙여 클릭을 모아 보세요.</Empty>
          )}
        </Section>

        <div className={styles.pair}>
          <Section id="by-program" title="프로그램별">
            <div className={ui.panelPad}>
              {shares.length > 0 ? <ShareBar title="프로그램별 수익 비중" items={shares} /> : <p className={styles.compare}>이 기간 수익이 없어요.</p>}
              <table className={`${styles.table} ${styles.tableGap}`}>
                <caption className={ui.srOnly}>프로그램별 성과</caption>
                <thead>
                  <tr>
                    <th scope="col" className={styles.left}>
                      프로그램
                    </th>
                    <th scope="col">클릭</th>
                    <th scope="col">전환율</th>
                    <th scope="col">클릭당</th>
                    <th scope="col">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {report.byProgram.map((row) => (
                    <tr key={row.key}>
                      <th scope="row" className={styles.left}>
                        {row.key}
                      </th>
                      <td>{formatNumber(row.clicks)}</td>
                      <td>{formatPercent(row.cvr)}</td>
                      <td>{formatWon(Math.round(row.epc))}</td>
                      <td className={styles.revenue}>{formatWon(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          <Section id="by-category" title="카테고리별 수익">
            <div className={ui.panelPad}>
              {report.byCategory.length > 0 ? (
                <BarList
                  label="카테고리별 수익"
                  items={report.byCategory.map((row) => ({
                    key: row.key,
                    label: row.key,
                    value: row.revenue,
                    valueLabel: formatWon(row.revenue),
                    note: `전환 ${formatPercent(row.cvr)}`,
                  }))}
                />
              ) : (
                <p className={styles.compare}>이 기간 기록이 없어요.</p>
              )}
            </div>
          </Section>
        </div>

        <div className={styles.triple}>
          <Section id="by-hour" title="시간대별 클릭">
            <div className={ui.panelPad}>
              <ColumnChart title="시간대별 클릭 (0~23시)" height={150} {...hourColumns(report.hours, report.peak)} />
              {report.totals.clicks > 0 ? (
                <p className={styles.insight}>
                  클릭이 가장 몰리는 시간은{" "}
                  <b>
                    {report.peak.start}시~{peakEnd === 0 ? 24 : peakEnd}시
                  </b>
                  예요. 새 글은 그 전에 올려 두세요.
                </p>
              ) : null}
            </div>
          </Section>
          <Section id="by-channel" title="채널별 클릭">
            <div className={ui.panelPad}>
              {report.byChannel.length > 0 ? (
                <BarList
                  label="채널별 클릭"
                  items={report.byChannel
                    .slice()
                    .sort((a, b) => b.clicks - a.clicks)
                    .map((row) => ({
                      key: row.key,
                      label: CHANNEL_LABEL[row.key],
                      value: row.clicks,
                      valueLabel: formatPercent(row.share, 0),
                      note: row.conversions > 0 ? `판매 ${row.conversions}` : undefined,
                    }))}
                />
              ) : (
                <p className={styles.compare}>이 기간 클릭이 없어요.</p>
              )}
            </div>
          </Section>
          <Section id="by-device" title="기기">
            <div className={ui.panelPad}>
              <BarList
                label="기기별 클릭"
                items={report.devices.map((row) => ({ key: row.device, label: DEVICE_LABEL[row.device], value: row.clicks, valueLabel: formatPercent(row.share, 0) }))}
              />
            </div>
          </Section>
        </div>
      </Page>
    </>
  );
}
