import Link from "next/link";
import { formatNumber, formatPercent } from "@/core/format";
import { PLANS, type PlanId } from "../../domain/plans";
import type { DeliveryPerformance } from "../../domain/stats";
import styles from "./dashboard.module.css";

/** This month in rows: plan usage, output in 원고지 매수, delivery record. */
export function MonthLedger({
  usage,
  output,
  performance,
}: {
  usage: { plan: PlanId; used: number };
  output: { orders: number; characters: number };
  performance: DeliveryPerformance;
}) {
  const plan = PLANS[usage.plan];
  const quota = plan.monthlyQuota;
  const share = quota ? Math.min(1, usage.used / quota) : null;
  return (
    <section className={styles.section} aria-labelledby="ledger-title">
      <div className={styles.sectionHead}>
        <h2 id="ledger-title" className={styles.sectionLabel}>
          이번 달 장부
        </h2>
        <Link href="/ai-content-agency/pricing">요금제</Link>
      </div>
      <dl className={styles.ledger}>
        <div className={styles.ledgerRow}>
          <dt>의뢰 사용량 ({plan.name})</dt>
          <dd>{quota ? `${usage.used} / ${quota}건` : `${usage.used}건 · 무제한`}</dd>
          {share !== null ? (
            <div className={styles.meter} role="meter" aria-valuemin={0} aria-valuemax={quota ?? 0} aria-valuenow={usage.used} aria-label="이번 달 의뢰 사용량">
              <div className={styles.meterFill} data-full={share >= 1} style={{ width: `${share * 100}%` }} />
            </div>
          ) : null}
        </div>
        <div className={styles.ledgerRow}>
          <dt>이번 달 납품</dt>
          <dd>{output.orders}건</dd>
          <span className={styles.ledgerNote}>
            {output.characters > 0
              ? `${formatNumber(output.characters)}자, 200자 원고지 ${formatNumber(output.characters / 200, 1)}매 분량`
              : "아직 이번 달에 납품한 원고가 없어요."}
          </span>
        </div>
        <div className={styles.ledgerRow}>
          <dt>마감 준수율</dt>
          <dd>{performance.onTimeRate === null ? "—" : formatPercent(performance.onTimeRate, 0)}</dd>
          <span className={styles.ledgerNote}>
            {performance.delivered > 0 ? `납품한 ${performance.delivered}건 중 ${performance.onTime}건을 마감일 안에 넘겼어요.` : "납품 기록이 쌓이면 계산돼요."}
          </span>
        </div>
        <div className={styles.ledgerRow}>
          <dt>평균 납품 소요</dt>
          <dd>{performance.averageTurnaroundDays === null ? "—" : `${formatNumber(performance.averageTurnaroundDays, 1)}일`}</dd>
          <span className={styles.ledgerNote}>의뢰서를 받은 날부터 납품한 날까지</span>
        </div>
      </dl>
    </section>
  );
}
