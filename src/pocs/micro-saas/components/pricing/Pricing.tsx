import { formatKrw, formatNumber } from "@/core/format";
import type { getPricing } from "../../server/queries";
import { COMPARISON, FEATURED_PLAN, PLANS, planById, usageAgainst } from "../../domain/plans";
import { Icon } from "../world/Icon";
import { RoundSeal } from "../world/Stamp";
import ui from "../world/ui.module.css";
import { PlanButton } from "./PlanButton";
import styles from "./pricing.module.css";

type Data = Awaited<ReturnType<typeof getPricing>>;

/** Three plans printed side by side in one frame, each checked against this shop's real usage. */
export function Pricing({ data }: { data: Data }) {
  const { shop, usage } = data;
  const current = planById(shop.plan);

  return (
    <>
      <div className={styles.intro}>
        <h2>매장 규모에 맞는 요금제</h2>
        <p>
          예약이 늘면 올리고, 한가해지면 내리세요. 언제든 바꿀 수 있어요.{" "}
          <span className={ui.tag}>POC 기획안 가격</span>
        </p>
      </div>

      <p className={styles.usage}>
        <strong>{shop.name}</strong> <span className={ui.tag}>샘플</span> 이번 달 예약 <strong>{formatNumber(usage.monthlyBookings)}건</strong>
        <span className={ui.sep} aria-hidden="true">
          /
        </span>
        등록 고객 <strong>{formatNumber(usage.customers)}명</strong>
        <span className={ui.sep} aria-hidden="true">
          /
        </span>
        지금 <strong>{current.name}</strong> 사용 중
      </p>

      <div className={styles.plans}>
        {PLANS.map((plan) => {
          const featured = plan.id === FEATURED_PLAN;
          const fit = usageAgainst(plan, usage).filter((line) => line.limit !== null);
          return (
            <article key={plan.id} className={`${styles.plan}${featured ? ` ${styles.featured}` : ""}`} aria-labelledby={`plan-${plan.id}`}>
              {featured ? (
                <span className={styles.seal}>
                  <RoundSeal text="인기" tilt={10} />
                  <span className={ui.visuallyHidden}>인기 요금제</span>
                </span>
              ) : null}
              <h3 id={`plan-${plan.id}`} className={styles.name}>
                {plan.name}
              </h3>
              <p className={styles.desc}>{plan.summary}</p>
              <p className={styles.price}>
                <span className={styles.num}>{formatKrw(plan.price)}</span>
                <span className={styles.per}>/월</span>
              </p>
              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f.label} className={f.included ? undefined : styles.no}>
                    <Icon name={f.included ? "check" : "x"} className={f.included ? styles.yes : undefined} />
                    <span>
                      {f.label}
                      {f.included ? null : <span className={ui.visuallyHidden}> (미포함)</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.fit}>
                {fit.length === 0
                  ? "이 매장 규모에 한도 걱정 없음"
                  : fit.map((line) => (
                      <span key={line.label} className={line.over ? styles.over : undefined}>
                        {line.label} {formatNumber(line.used)}/{formatNumber(line.limit ?? 0)}
                        {line.over ? " 초과" : ""}
                      </span>
                    ))}
              </p>
              <PlanButton plan={plan.id} name={plan.name} current={plan.id === shop.plan} featured={featured} />
            </article>
          );
        })}
      </div>
      <p className={styles.demoNote}>데모에서는 결제 없이 요금제만 바뀌고, 한도는 안내만 해요.</p>

      <section className={`${ui.sheet} ${styles.compare}`} aria-labelledby="compare-title">
        <div className={ui.sheetHead}>
          <h2 id="compare-title">기능 비교표</h2>
        </div>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-labelledby="compare-title">
          <table>
            <thead>
              <tr>
                <th scope="col">기능</th>
                {PLANS.map((p) => (
                  <th key={p.id} scope="col" className={p.id === FEATURED_PLAN ? styles.hl : undefined}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  {PLANS.map((p) => {
                    const value = row.values[p.id];
                    const classes = [p.id === FEATURED_PLAN ? styles.hl : "", value ? "" : styles.off].filter(Boolean).join(" ");
                    return (
                      <td key={p.id} className={classes || undefined}>
                        {value ?? "없음"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
