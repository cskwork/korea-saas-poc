import Link from "next/link";
import clsx from "clsx";
import { Check, FilePlus2, Minus } from "lucide-react";
import { formatKrw } from "@/core/format";
import {
  ANNUAL_DISCOUNT,
  PLAN_COMPARISON,
  PLANS,
  planMonthlyPrice,
  planYearlyPrice,
  type Billing,
  type Plan,
} from "../../domain/pricing";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { PageHeader, SectionHead } from "../ui/PageHeader";
import ui from "../ui/ui.module.css";
import styles from "./pricing.module.css";

const PRICING = `${BASE_PATH}/pricing`;

/** Included automations drawn as stations on the plan's line; unlimited runs off the edge. */
function CapacityLine({ plan }: { plan: Plan }) {
  const count = plan.automations ?? 9;
  const width = 280;
  const step = (width - 24) / (plan.automations === null ? count : Math.max(count - 1, 1));
  return (
    <svg className={styles.capacity} viewBox={`0 0 ${width} 28`} aria-hidden="true" focusable="false">
      <path
        d={`M 12 14 H ${plan.automations === null ? width : 12 + step * (count - 1)}`}
        className={styles.capacityLine}
      />
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={12 + i * step} cy={14} r={6} className={styles.capacityStop} />
      ))}
    </svg>
  );
}

export function Pricing({ billing }: { billing: Billing }) {
  return (
    <>
      <PageHeader
        title="구축은 한 번, 운행은 매달"
        lede="자동화를 만든 다음에도 멈추지 않게 지키는 유지보수 요금제예요. 패키지별 구축비는 따로 견적하고, 금액은 모두 부가세 별도예요."
      />

      <nav className={styles.billing} aria-label="결제 주기">
        <Link href={PRICING} className={styles.billingOption} aria-current={billing === "monthly" ? "true" : undefined}>
          월간 결제
        </Link>
        <Link
          href={`${PRICING}?billing=annual`}
          className={styles.billingOption}
          aria-current={billing === "annual" ? "true" : undefined}
        >
          연간 결제 <span className={styles.discount}>{Math.round(ANNUAL_DISCOUNT * 100)}% 할인</span>
        </Link>
      </nav>

      <ol className={styles.plans}>
        {PLANS.map((plan) => (
          <li key={plan.id} className={clsx(styles.plan, plan.recommended && styles.recommended)}>
            <div className={styles.planHead}>
              <span className={styles.planBadge} aria-hidden="true">
                {plan.code}
              </span>
              <div>
                <h2 className={styles.planName}>
                  {plan.name}
                  {plan.recommended ? <span className={styles.pick}>추천</span> : null}
                </h2>
                <p className={styles.audience}>{plan.audience}</p>
              </div>
            </div>
            <div className={styles.planLine}>
              <CapacityLine plan={plan} />
              <p className={styles.capacityText}>
                {plan.automations === null ? "자동화 무제한" : `자동화 ${plan.automations}개까지`}
              </p>
            </div>
            <div className={styles.planPrice}>
              <p className={styles.price}>
                {formatKrw(planMonthlyPrice(plan, billing))}
                <span className={styles.per}>/월</span>
              </p>
              <p className={styles.priceNote}>
                {billing === "annual"
                  ? `연 ${formatKrw(planYearlyPrice(plan, billing))} · 월간 결제보다 연 ${formatKrw(planYearlyPrice(plan, "monthly") - planYearlyPrice(plan, billing))} 절약`
                  : `연간 결제 시 월 ${formatKrw(planMonthlyPrice(plan, "annual"))}`}
              </p>
              <Link
                href={`${BASE_PATH}/quotes/new?plan=${plan.id}${billing === "annual" ? "&billing=annual" : ""}`}
                className={clsx(buttonClass(plan.recommended ? "primary" : "secondary"), styles.planCta)}
              >
                <FilePlus2 size={16} aria-hidden="true" />이 요금제로 견적 작성
              </Link>
            </div>
            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Check size={14} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className={ui.section} aria-labelledby="compare-title">
        <SectionHead id="compare-title" title="요금제 비교" />
        <div className={ui.tableWrap}>
          <table className={clsx(ui.table, styles.compare)}>
            <thead>
              <tr>
                <th scope="col">항목</th>
                {PLANS.map((plan) => (
                  <th key={plan.id} scope="col" className={plan.recommended ? styles.compareRecommended : undefined}>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  {PLANS.map((plan) => {
                    const value = row.values[plan.id];
                    return (
                      <td key={plan.id} className={plan.recommended ? styles.compareRecommended : undefined}>
                        {value === true ? (
                          <>
                            <Check size={16} aria-hidden="true" className={styles.yes} />
                            <span className={ui.srOnly}>포함</span>
                          </>
                        ) : value === false ? (
                          <>
                            <Minus size={16} aria-hidden="true" className={styles.no} />
                            <span className={ui.srOnly}>미포함</span>
                          </>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th scope="row">월 요금 ({billing === "annual" ? "연간 결제" : "월간 결제"})</th>
                {PLANS.map((plan) => (
                  <td
                    key={plan.id}
                    className={clsx(styles.comparePrice, plan.recommended && styles.compareRecommended)}
                  >
                    {formatKrw(planMonthlyPrice(plan, billing))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.footnote}>
          요금제 금액은 이 제품이 제안하는 기본값이에요. 실제 계약 금액은 견적서에서 고객 조건에 맞춰 조정하세요.
        </p>
      </section>
    </>
  );
}
