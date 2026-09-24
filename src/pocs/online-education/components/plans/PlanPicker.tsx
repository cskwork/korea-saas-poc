"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { formatWon } from "@/core/format";
import type { BillingCycle, PlanTier } from "../../db/schema";
import { PLAN_FEATURES, PLANS, planPrice } from "../../domain/plans";
import { changePlanAction } from "../../server/actions";
import { FormNotice, useFormAction } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./plans.module.css";

/** "베이직으로", "프로로": the directional particle depends on the final consonant. */
const SWITCH_LABEL: Record<PlanTier, string> = { free: "무료로 바꾸기", basic: "베이직으로 바꾸기", pro: "프로로 바꾸기" };

/** Plan comparison grid with a monthly/yearly switch; choosing a plan records it (no billing). */
export function PlanPicker({ current, billing: currentBilling }: { current: PlanTier; billing: BillingCycle }) {
  const [billing, setBilling] = useState<BillingCycle>(currentBilling);
  const { state, pending, formProps } = useFormAction(changePlanAction);

  return (
    <form {...formProps} className={styles.picker}>
      <fieldset className={styles.billing}>
        <legend className={ui.srOnly}>결제 주기</legend>
        <div className={ui.choices}>
          {(["monthly", "yearly"] as const).map((cycle) => (
            <label key={cycle} className={ui.choice}>
              <input type="radio" name="billing" value={cycle} checked={billing === cycle} onChange={() => setBilling(cycle)} />
              <span>{cycle === "monthly" ? "월간 결제" : "연간 결제 · 20% 할인"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={ui.tableWrap}>
        <table className={clsx(ui.table, styles.matrix)}>
          <caption className={ui.srOnly}>요금제별 기능 비교</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.featureHead}>
                기능
              </th>
              {PLANS.map((plan) => {
                const price = planPrice(plan.tier, billing);
                const isCurrent = plan.tier === current && billing === currentBilling;
                return (
                  <th key={plan.tier} scope="col" className={styles.planHead} data-current={plan.tier === current || undefined}>
                    <span className={styles.planName}>{plan.name}</span>
                    <span className={styles.planPrice}>
                      <strong className={ui.num}>{price.perMonth === 0 ? "0원" : formatWon(price.perMonth)}</strong>
                      <span>/월</span>
                    </span>
                    <span className={styles.planNote}>
                      {billing === "yearly" && price.perYear > 0 ? `연 ${formatWon(price.perYear)} 한 번에` : plan.summary}
                    </span>
                    {isCurrent ? (
                      <span className={clsx(ui.badge, styles.currentBadge)} data-tone="live">
                        사용 중
                      </span>
                    ) : (
                      <button
                        type="submit"
                        name="plan"
                        value={plan.tier}
                        className={clsx(ui.button, ui.small, plan.tier === "basic" || plan.tier === "pro" ? ui.primary : undefined)}
                        disabled={pending}
                      >
                        {plan.tier === current ? (billing === "yearly" ? "연간으로 바꾸기" : "월간으로 바꾸기") : SWITCH_LABEL[plan.tier]}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map((feature) => (
              <tr key={feature.label}>
                <th scope="row" className={styles.featureName}>
                  {feature.label}
                </th>
                {PLANS.map((plan) => {
                  const value = feature.value[plan.tier];
                  return (
                    <td key={plan.tier} className={styles.cell} data-current={plan.tier === current || undefined}>
                      {value === true ? (
                        <Check size={16} aria-label="포함" className={styles.yes} />
                      ) : value === false ? (
                        <Minus size={16} aria-label="미포함" className={styles.no} />
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormNotice state={state} />
    </form>
  );
}
