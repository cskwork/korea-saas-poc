import clsx from "clsx";
import { formatNumber } from "@/core/format";
import { monthLabel } from "../../domain/dates";
import type { RevenueOverview } from "../../server/store/revenue";
import { RevenueChart } from "../charts/RevenueChart";
import { percent, won } from "../format";
import { SampleNote, SectionHead } from "../ui/SectionHead";
import styles from "./revenue.module.css";

function change(current: number, previous: number) {
  if (previous === 0) return current > 0 ? "새로 생김" : "—";
  const ratio = (current - previous) / previous;
  return `${ratio >= 0 ? "+" : "−"}${percent(Math.abs(ratio))}`;
}

/** This month's statement, the goals, and six months of income. */
export function RevenueSummary({ overview }: { overview: RevenueOverview }) {
  const { thisMonth, lastMonth } = overview;
  const lines = [
    { label: "구독료", now: thisMonth.subscription, before: lastMonth.subscription, note: "유료 구독자 × 플랜 가격" },
    { label: "광고", now: thisMonth.sponsorship, before: lastMonth.sponsorship, note: "확정·정산된 광고 계약" },
    { label: "멤버십", now: thisMonth.membership, before: lastMonth.membership, note: "모임·후원 멤버십 매출" },
  ];
  return (
    <div className={styles.summary}>
      <section className={styles.statement} aria-labelledby="statement-title">
        <SectionHead id="statement-title" title={`${monthLabel(overview.currentMonth)} 결산`} aside={<SampleNote>샘플 장부</SampleNote>} />
        <table className={styles.statementTable}>
          <caption className={styles.caption}>이번 달과 지난달 수입</caption>
          <thead>
            <tr>
              <th scope="col">항목</th>
              <th scope="col">이번 달</th>
              <th scope="col">지난달</th>
              <th scope="col">변화</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.label}>
                <th scope="row">
                  {line.label}
                  <span className={styles.lineNote}>{line.note}</span>
                </th>
                <td>{won(line.now)}</td>
                <td>{won(line.before)}</td>
                <td>{change(line.now, line.before)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">합계</th>
              <td>{won(thisMonth.total)}</td>
              <td>{won(lastMonth.total)}</td>
              <td>{change(thisMonth.total, lastMonth.total)}</td>
            </tr>
          </tfoot>
        </table>
        <dl className={styles.figures}>
          <div>
            <dt>월 반복 수입(MRR)</dt>
            <dd>{won(overview.mrr)}</dd>
          </div>
          <div>
            <dt>유료 1인당(ARPU)</dt>
            <dd>{won(overview.arpu)}</dd>
          </div>
          <div>
            <dt>유료 전환율</dt>
            <dd>{percent(overview.conversion)}</dd>
          </div>
          <div>
            <dt>30일 유료 이탈률</dt>
            <dd>{percent(overview.churn)}</dd>
          </div>
          <div>
            <dt>협의·예정 광고</dt>
            <dd>{won(overview.pipeline)}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.goals} aria-labelledby="goals-title">
        <SectionHead id="goals-title" title="목표" aside={<a href="/newsletter-community/settings#goals">목표 바꾸기</a>} />
        <Goal
          label="월 수입"
          value={won(overview.goals.revenue.value)}
          goal={won(overview.goals.revenue.goal)}
          ratio={overview.goals.revenue.ratio}
        />
        <Goal
          label="유료 구독자"
          value={`${formatNumber(overview.goals.paid.value)}명`}
          goal={`${formatNumber(overview.goals.paid.goal)}명`}
          ratio={overview.goals.paid.ratio}
        />
      </section>

      <section className={styles.chart} aria-labelledby="chart-title">
        <SectionHead
          id="chart-title"
          title="월별 수입"
          aside={<span>구독료는 각 달에 유료였던 구독자 × 현재 플랜 가격으로 추정해요</span>}
        />
        <RevenueChart series={overview.series} />
      </section>
    </div>
  );
}

function Goal({ label, value, goal, ratio }: { label: string; value: string; goal: string; ratio: number }) {
  return (
    <div className={styles.goal}>
      <p className={styles.goalHead}>
        <span>{label}</span>
        <span className={styles.goalFigure}>
          <strong>{value}</strong> / {goal}
        </span>
      </p>
      <div
        className={styles.meter}
        role="meter"
        aria-label={`${label} 목표 달성`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuetext={`${percent(ratio)} 달성`}
      >
        <span className={clsx(styles.meterFill, ratio >= 1 && styles.meterDone)} style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <p className={styles.goalRatio}>{percent(ratio)} 달성</p>
    </div>
  );
}
