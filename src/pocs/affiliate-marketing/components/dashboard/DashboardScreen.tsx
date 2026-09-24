import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { formatNumber, formatPercent, formatWon } from "@/core/format";
import { monthLabel } from "../../domain/dates";
import type { DashboardReport } from "../../server/reports";
import { ColumnChart } from "../charts/ColumnChart";
import { revenueColumns } from "../charts/series";
import { ShareBar } from "../charts/ShareBar";
import { programShares, shortUrl } from "../display";
import { Rail, RailItem, ShelfLabel } from "../label/ShelfLabel";
import { ScanTape } from "../tape/ScanTape";
import { DeltaTag, Empty, Page, Section, Won, ui } from "../ui/primitives";
import { GoalMeter } from "./GoalMeter";
import styles from "./dashboard.module.css";

export function DashboardScreen({ data, origin }: { data: DashboardReport; origin: string }) {
  const month = monthLabel(data.today);
  const shares = programShares(data.programs, data.programOrder);
  const chart = revenueColumns(data.series, { today: data.today });

  return (
    <>
      <div className={styles.flyer}>
        <div className={styles.flyerInner}>
          <div className={styles.headline}>
            <h1 className={styles.title}>{month}, 링크로 번 돈</h1>
            <Won value={data.totals.revenue} size="xl" className={styles.bigPrice} />
            <p className={styles.period}>
              {Number(data.monthFrom.slice(5, 7))}.1 ~ {Number(data.today.slice(5, 7))}.{Number(data.today.slice(8, 10))} 합계 · 취소 제외
            </p>
            <p className={styles.split}>
              <span>
                구매 확정 <b>{formatWon(data.status.confirmed.commission)}</b>
              </span>
              <span>
                확정 대기 <b>{formatWon(data.status.pending.commission)}</b>
              </span>
              <span>
                지난달 같은 기간보다 <DeltaTag delta={data.deltas.revenue} label="수익" />
              </span>
            </p>
            <GoalMeter goal={data.goal} />
            <div className={styles.actions}>
              <Link href="/affiliate-marketing/links/new" className={ui.primary}>
                <Plus aria-hidden />
                링크 등록
              </Link>
              <Link href="/affiliate-marketing/conversions#record" className={ui.base}>
                <ClipboardList aria-hidden />
                판매 기록
              </Link>
            </div>
          </div>

          <div className={styles.chartBlock}>
            <div className={styles.chartHead}>
              <h2 className={styles.chartTitle}>최근 30일 수익</h2>
              <p className={styles.chartNote}>막대를 가리키면 그날의 클릭과 판매가 보여요</p>
            </div>
            <ColumnChart title="최근 30일 일별 수익" onYellow height={200} {...chart} />
            <dl className={styles.smallPrint}>
              <div className={styles.cell}>
                <dt>{month} 클릭</dt>
                <dd>
                  {formatNumber(data.totals.clicks)}
                  <DeltaTag delta={data.deltas.clicks} label="클릭" />
                </dd>
              </div>
              <div className={styles.cell}>
                <dt>판매</dt>
                <dd>
                  {formatNumber(data.totals.conversions)}건
                  <DeltaTag delta={data.deltas.conversions} label="판매" />
                </dd>
              </div>
              <div className={styles.cell}>
                <dt>전환율</dt>
                <dd>
                  {formatPercent(data.totals.cvr)}
                  <DeltaTag delta={data.deltas.cvr} unit="points" label="전환율" />
                </dd>
              </div>
              <div className={styles.cell}>
                <dt>클릭당 수익</dt>
                <dd>{formatWon(Math.round(data.totals.epc))}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Page>
        <Section
          id="shelf"
          title="이번 달 잘 팔린 링크"
          note="가격표의 금액은 이번 달 링크가 번 수수료예요. 바코드를 누르면 짧은 링크가 복사돼요."
          link={{ href: "/affiliate-marketing/links", label: `링크 ${data.linkCount}개 모두 보기` }}
        >
          {data.topLinks.length > 0 ? (
            <Rail label="이번 달 수익 순 링크">
              {data.topLinks.map((row, index) => (
                <RailItem key={row.key}>
                  <ShelfLabel
                    data={{ ...row.link, clicks: row.clicks, conversions: row.conversions, revenue: row.revenue, cvr: row.cvr, epc: row.epc }}
                    url={shortUrl(origin, row.link.code)}
                    rank={index === 0 ? 1 : undefined}
                    promo={index === 0}
                  />
                </RailItem>
              ))}
            </Rail>
          ) : (
            <Empty
              title="이번 달엔 아직 클릭이 없어요"
              action={
                <Link href="/affiliate-marketing/links/new" className={ui.primary}>
                  <Plus aria-hidden />첫 링크 등록하기
                </Link>
              }
            >
              링크를 등록하고 짧은 링크를 글이나 SNS에 붙이면, 클릭이 들어오는 대로 여기 가격표가 채워져요.
            </Empty>
          )}
        </Section>

        <div className={styles.lower}>
          <Section id="programs" title="프로그램별 수익" link={{ href: "/affiliate-marketing/programs", label: "프로그램 비교" }}>
            <div className={`${ui.panelPad} ${styles.programList}`}>
              {shares.length > 0 ? (
                <ShareBar title={`${month} 프로그램별 수익 비중`} items={shares} />
              ) : (
                <p className={styles.goalNote}>이번 달 수익이 생기면 프로그램별 비중이 표시돼요.</p>
              )}
              <table className={styles.programTable}>
                <caption className={ui.srOnly}>{month} 프로그램별 성과</caption>
                <thead>
                  <tr>
                    <th scope="col">프로그램</th>
                    <th scope="col">클릭</th>
                    <th scope="col">판매</th>
                    <th scope="col">전환율</th>
                    <th scope="col">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {data.programs.map((row) => (
                    <tr key={row.key}>
                      <th scope="row">{row.key}</th>
                      <td>{formatNumber(row.clicks)}</td>
                      <td>{formatNumber(row.conversions)}</td>
                      <td>{formatPercent(row.cvr)}</td>
                      <td>{formatWon(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="tape" title="방금 들어온 클릭">
            <ScanTape
              clicks={data.recent}
              head={
                <>
                  <span>
                    오늘 클릭 <b>{formatNumber(data.todayTotals.clicks)}</b> · 판매 <b>{formatNumber(data.todayTotals.conversions)}</b>
                  </span>
                  <span>
                    오늘 수익 <b>{formatWon(data.todayTotals.revenue)}</b>
                  </span>
                </>
              }
              empty="아직 기록된 클릭이 없어요. 짧은 링크를 누르면 이곳에 바로 찍혀요."
            />
          </Section>
        </div>
      </Page>
    </>
  );
}
