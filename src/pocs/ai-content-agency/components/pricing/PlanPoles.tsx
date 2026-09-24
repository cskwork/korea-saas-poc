import { Check, Minus } from "lucide-react";
import { PLANS, PLAN_IDS, planPriceLabel, type PlanId } from "../../domain/plans";
import { Grommets } from "../shell/Grommets";
import ui from "../ui/ui.module.css";
import { PlanChoice } from "./PlanChoice";
import styles from "./pricing.module.css";

/** The three plans as lamp-post banners; the workspace's current one wears a sticker. */
export function PlanPoles({ current }: { current: PlanId }) {
  return (
    <ul className={styles.poles} role="list">
      {PLAN_IDS.map((id) => {
        const plan = PLANS[id];
        const isCurrent = id === current;
        return (
          <li key={id} className={styles.pole} data-plan={id} aria-labelledby={`plan-${id}`}>
            <Grommets />
            <span className={styles.stickers}>
              {id === "pro" ? (
                <span className={styles.sticker} data-type="recommend">
                  추천
                </span>
              ) : null}
              {isCurrent ? (
                <span className={styles.sticker} data-type="current">
                  이용 중
                </span>
              ) : null}
            </span>
            <h2 id={`plan-${id}`} className={styles.planName}>
              {plan.name}
            </h2>
            <p className={styles.audience}>{plan.audience}</p>
            <p className={styles.price}>
              {planPriceLabel(plan)}
              {plan.priceWon !== null ? <small>/ 월 · 부가세 별도</small> : null}
            </p>
            <ul className={styles.features} role="list">
              {plan.features.map((feature) => (
                <li key={feature.label} data-included={feature.included}>
                  {feature.included ? <Check size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
                  <span>
                    {feature.included ? null : <span className={ui.srOnly}>포함 안 됨: </span>}
                    {feature.label}
                  </span>
                </li>
              ))}
            </ul>
            {isCurrent ? (
              <span className={styles.current}>
                <Check size={16} aria-hidden="true" />
                지금 쓰는 요금제
              </span>
            ) : (
              <PlanChoice plan={id} name={plan.name} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
