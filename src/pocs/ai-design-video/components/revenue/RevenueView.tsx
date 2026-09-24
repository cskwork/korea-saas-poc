import Link from "next/link";
import { formatCompact, formatDate, formatKrw, formatPercent } from "@/core/format";
import { monthLabel } from "../../domain/calendar";
import { ORDER_TYPE_INFO, PLAN_LABEL } from "../../domain/catalog";
import {
  averageTicket,
  categorySplit,
  monthChange,
  monthlyTotals,
  planSplit,
  type GoalProgress,
} from "../../domain/revenue";
import type { Delivery } from "../../server/studio-data";
import { GoalMeter } from "../GoalMeter";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import { GoalForm } from "./GoalForm";
import { MonthlyChart } from "./MonthlyChart";
import styles from "./revenue.module.css";

export type RevenuePeriod = "month" | "quarter" | "year";

const PERIODS: { id: RevenuePeriod; label: string; months: number }[] = [
  { id: "month", label: "이번 달", months: 1 },
  { id: "quarter", label: "최근 3개월", months: 3 },
  { id: "year", label: "최근 12개월", months: 12 },
];

interface RevenueViewProps {
  today: string;
  months: string[];
  deliveries: Delivery[];
  progress: GoalProgress;
  pipeline: { total: number; count: number };
  period: RevenuePeriod;
}

export function RevenueView({ today, months, deliveries, progress, pipeline, period }: RevenueViewProps) {
  const currentMonth = today.slice(0, 7);
  const totals = monthlyTotals(deliveries, currentMonth, 12);
  const previous = totals.at(-2)?.total ?? 0;
  const change = monthChange(progress.achieved, previous);
  const periodMonths = months.slice(-(PERIODS.find((p) => p.id === period)?.months ?? 3));
  const inPeriod = deliveries.filter((d) => periodMonths.includes(d.deliveredOn.slice(0, 7)));
  const split = categorySplit(inPeriod);
  const plans = planSplit(inPeriod);
  const periodTotal = plans.single + plans.subscription;
  const topShare = split[0]?.total ?? 0;
  const periodLabel = PERIODS.find((p) => p.id === period)?.label;

  return (
    <>
      <SheetHeader
        title="수익 분석"
        lead="납품을 마친 주문을 납품한 달의 매출로 셌어요. 금액에는 추가 수정 비용이 포함돼요."
      >
        <HeaderCell
          wide
          label={`${monthLabel(currentMonth)} 납품액 · 목표 ${formatKrw(progress.goal)}`}
          value={formatKrw(progress.achieved)}
          sub={
            <>
              {formatPercent(progress.ratio)} 달성 ·{" "}
              {progress.remaining > 0 ? `${formatKrw(progress.remaining)} 남음` : "목표 달성"}
              <GoalMeter progress={progress} today={today} />
            </>
          }
        />
        <HeaderCell
          label="지난달 대비"
          value={change === null ? "—" : `${change >= 0 ? "+" : ""}${formatPercent(change)}`}
          sub={`지난달 ${formatCompact(previous)}원`}
        />
        <HeaderCell
          label="평균 단가 (12개월)"
          value={formatKrw(averageTicket(deliveries))}
          sub={`${deliveries.length}건 기준`}
        />
        <HeaderCell
          label="진행 중 수주액"
          value={formatKrw(pipeline.total)}
          sub={`${pipeline.count}건 납품 전`}
          href={`${paths.orders}?status=open`}
        />
      </SheetHeader>

      <section className={styles.section} aria-labelledby="monthly">
        <div className={styles.sectionHead}>
          <h2 id="monthly" className={styles.sectionTitle}>
            월별 납품액
          </h2>
          <p className={styles.key}>
            <span className={styles.keyInk} aria-hidden="true" /> 마감한 달
            <span className={styles.keyBlue} aria-hidden="true" /> 이번 달(진행 중)
            <span className={styles.keyGoal} aria-hidden="true" /> 월 목표
          </p>
        </div>
        <MonthlyChart months={totals} goal={progress.goal} currentMonth={currentMonth} />
        <details className={styles.table}>
          <summary>표로 보기</summary>
          <table>
            <thead>
              <tr>
                <th scope="col">월</th>
                <th scope="col">납품액</th>
                <th scope="col">건수</th>
                <th scope="col">목표 대비</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((m) => (
                <tr key={m.month}>
                  <th scope="row">
                    {m.month.slice(0, 4)}년 {monthLabel(m.month)}
                  </th>
                  <td>{formatKrw(m.total)}</td>
                  <td>{m.count}건</td>
                  <td>{formatPercent(progress.goal > 0 ? m.total / progress.goal : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <GoalForm goal={progress.goal} />
      </section>

      <section className={styles.section} aria-labelledby="split">
        <div className={styles.sectionHead}>
          <h2 id="split" className={styles.sectionTitle}>
            어디서 벌었나
          </h2>
          <nav className={styles.periods} aria-label="기간">
            {PERIODS.map((p) => (
              <Link
                key={p.id}
                href={p.id === "quarter" ? paths.revenue : `${paths.revenue}?period=${p.id}`}
                className={styles.period}
                aria-current={p.id === period ? "true" : undefined}
                scroll={false}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </div>

        {periodTotal === 0 ? (
          <p className={ui.hint}>{periodLabel}에 납품한 주문이 없어요.</p>
        ) : (
          <div className={styles.splitGrid}>
            <div>
              <h3 className={styles.subTitle}>작업 종류별 · {formatKrw(periodTotal)}</h3>
              <ul role="list" className={styles.bars}>
                {split.map((row) => (
                  <li key={row.type} className={styles.barRow}>
                    <span className={styles.barName}>{ORDER_TYPE_INFO[row.type].short}</span>
                    <span className={styles.barTrack}>
                      <span className={styles.barFill} style={{ width: `${(row.total / topShare) * 100}%` }} />
                    </span>
                    <span className={styles.barValue}>
                      {formatCompact(row.total)}원{" "}
                      <span className={styles.barShare}>{formatPercent(row.share, 0)}</span>
                    </span>
                    <span className={styles.srOnly}>{row.count}건</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={styles.subTitle}>단건 · 구독</h3>
              <div
                className={styles.stack}
                role="img"
                aria-label={`단건 ${formatKrw(plans.single)}, 구독 ${formatKrw(plans.subscription)}`}
              >
                {(["single", "subscription"] as const).map((plan) =>
                  plans[plan] > 0 ? (
                    <span
                      key={plan}
                      className={plan === "single" ? styles.stackSingle : styles.stackSub}
                      style={{ flexGrow: plans[plan] }}
                    />
                  ) : null,
                )}
              </div>
              <dl className={styles.planLegend}>
                {(["single", "subscription"] as const).map((plan) => (
                  <div key={plan}>
                    <dt>
                      <span className={plan === "single" ? styles.keyInk : styles.keyBlue} aria-hidden="true" />
                      {PLAN_LABEL[plan]}
                    </dt>
                    <dd>
                      {formatKrw(plans[plan])}{" "}
                      <span className={styles.barShare}>{formatPercent(plans[plan] / periodTotal, 0)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        <h3 className={[styles.subTitle, styles.spaced].join(" ")}>납품 내역 · {periodLabel}</h3>
        {inPeriod.length > 0 ? (
          <div className={styles.ledgerWrap}>
            <table className={styles.ledger}>
              <thead>
                <tr>
                  <th scope="col">납품일</th>
                  <th scope="col">고객</th>
                  <th scope="col">작업</th>
                  <th scope="col" className={styles.right}>
                    금액
                  </th>
                </tr>
              </thead>
              <tbody>
                {inPeriod.slice(0, 15).map((d) => (
                  <tr key={d.id}>
                    <td className={styles.date}>
                      {formatDate(`${d.deliveredOn}T12:00:00+09:00`, { month: "numeric", day: "numeric" })}
                    </td>
                    <td>{d.clientName}</td>
                    <td>
                      <Link href={paths.order(d.id)}>{d.title}</Link>
                      <span className={styles.ledgerType}>
                        {ORDER_TYPE_INFO[d.type].short}
                        {d.plan === "subscription" ? " · 구독" : ""}
                      </span>
                    </td>
                    <td className={styles.right}>{formatKrw(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inPeriod.length > 15 && (
              <p className={ui.hint}>최근 15건만 보여줘요. 전체는 주문 목록에서 ‘납품완료’로 볼 수 있어요.</p>
            )}
          </div>
        ) : (
          <p className={ui.hint}>이 기간에 납품한 주문이 없어요.</p>
        )}
      </section>
    </>
  );
}
