import { Check, Minus, TriangleAlert } from "lucide-react";
import { KIND_LABEL, type ContentKind } from "../../domain/content";
import { josa } from "../../domain/korean";
import { PLANS, PLAN_IDS, planPriceLabel, type PlanId } from "../../domain/plans";
import { Grommets } from "../shell/Grommets";
import ui from "../ui/ui.module.css";
import { PlanChoice } from "./PlanChoice";
import styles from "./pricing.module.css";

/** What this month would look like on a plan: quota against orders taken, kinds still open. */
function planFit(id: PlanId, used: number, openKinds: readonly ContentKind[]) {
  const plan = PLANS[id];
  const missing = openKinds.filter((k) => !plan.kinds.includes(k));
  const over = plan.monthlyQuota !== null && used > plan.monthlyQuota ? used - plan.monthlyQuota : 0;
  const warnings = [
    over > 0 ? `이번 달 받은 ${used}건이 한도보다 ${over}건 많아요. 바꾸면 이번 달에는 더 받을 수 없어요.` : null,
    missing.length > 0
      ? `진행 중인 ${josa(missing.map((k) => KIND_LABEL[k]).join("·"), "은/는")} 이 요금제로 새로 받을 수 없어요.`
      : null,
  ].filter((w): w is string => w !== null);
  return { plan, warnings };
}

/** The three plans as lamp-post banners; each says how this month's work would fit on it. */
export function PlanPoles({ current, used, openKinds }: { current: PlanId; used: number; openKinds: readonly ContentKind[] }) {
  const currentRank = PLAN_IDS.indexOf(current);
  return (
    <ul className={styles.poles} role="list">
      {PLAN_IDS.map((id, rank) => {
        const { plan, warnings } = planFit(id, used, openKinds);
        const isCurrent = id === current;
        const quota = plan.monthlyQuota;
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
            <div className={styles.fit}>
              <p className={styles.fitLine}>
                <span>이번 달 의뢰</span>
                <strong>{quota === null ? `${used}건 · 제한 없음` : `${used} / ${quota}건`}</strong>
              </p>
              {quota !== null ? (
                <span className={styles.fitMeter} aria-hidden="true">
                  <span style={{ width: `${Math.min(100, (used / quota) * 100)}%` }} data-over={used > quota} />
                </span>
              ) : null}
              {!isCurrent && warnings.length > 0 ? (
                <ul className={styles.fitWarnings} role="list">
                  {warnings.map((w) => (
                    <li key={w}>
                      <TriangleAlert size={14} aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <ul className={styles.features} role="list">
              {plan.features.map((feature) => (
                <li key={feature.label} data-included={feature.included}>
                  {feature.included ? <Check size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
                  <span>
                    {feature.included ? null : <span className={ui.srOnly}>포함 안 됨: </span>}
                    {feature.label}
                    {feature.included ? null : <span className={styles.excluded}> 없음</span>}
                  </span>
                </li>
              ))}
            </ul>
            {isCurrent ? (
              <span className={styles.current}>
                <Check size={16} aria-hidden="true" />
                지금 쓰는 요금제
              </span>
            ) : plan.priceWon === null ? (
              <div className={styles.choose}>
                <a href="#inquiry-title" className={styles.quoteLink}>
                  견적 문의하기
                </a>
                <PlanChoice plan={id} name={plan.name} variant="quiet" label="데모에서 바로 바꿔 보기" />
              </div>
            ) : (
              // Moving down is possible but should not be the loudest button on the page.
              <PlanChoice plan={id} name={plan.name} variant={rank < currentRank ? "secondary" : "primary"} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
