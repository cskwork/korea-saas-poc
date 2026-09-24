"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { idleState } from "@/core/actions";
import { formatWon } from "@/core/format";
import { PLAN_CATEGORIES, PLAN_CATEGORY_LABEL, type PlanCategory } from "../../domain/labels";
import { deletePlan, savePlan } from "../../server/actions";
import type { ServicePlan } from "../../server/data/showcase";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";
import styles from "./Showcase.module.css";

interface PlanDraft {
  id?: string;
  category: PlanCategory;
  name: string;
  price: number;
  delivery: string;
  features: string[];
  featured: boolean;
}

function PlanForm({ plan, onDone }: { plan: PlanDraft; onDone: () => void }) {
  const [state, formAction] = useActionState(savePlan, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onDone);
  return (
    <form action={formAction} className={ui.region} noValidate>
      {plan.id ? <input type="hidden" name="id" value={plan.id} /> : null}
      <input type="hidden" name="category" value={plan.category} />
      <Field id={`${uid}-name`} label="요금제 이름" errors={errors?.name}>
        {(a11y) => <input {...a11y} name="name" className={ui.input} defaultValue={plan.name} maxLength={40} required />}
      </Field>
      <div className={styles.planFormRow}>
        <Field id={`${uid}-price`} label="시작 가격 (원)" errors={errors?.price}>
          {(a11y) => <input {...a11y} name="price" className={`${ui.input} ${ui.numberInput}`} inputMode="numeric" defaultValue={plan.price || ""} required />}
        </Field>
        <Field id={`${uid}-delivery`} label="납기" errors={errors?.delivery}>
          {(a11y) => <input {...a11y} name="delivery" className={ui.input} defaultValue={plan.delivery} maxLength={30} placeholder="4주" />}
        </Field>
      </div>
      <Field id={`${uid}-features`} label="포함 내용" hint="한 줄에 하나씩" errors={errors?.features}>
        {(a11y) => <textarea {...a11y} name="features" className={ui.textarea} defaultValue={plan.features.join("\n")} rows={5} />}
      </Field>
      <label className={ui.check}>
        <input type="checkbox" name="featured" defaultChecked={plan.featured} />
        추천으로 표시 (분류마다 하나)
      </label>
      <div className={ui.formActions}>
        <SubmitButton small>{plan.id ? "저장" : "추가"}</SubmitButton>
        <button type="button" className={buttonClass("ghost", { small: true })} onClick={onDone}>
          취소
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** The price list editor: three categories, each a column of plans that can be edited in place. */
export function PlanEditor({ plans }: { plans: ServicePlan[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className={styles.planColumns}>
      {PLAN_CATEGORIES.map((category) => {
        const list = plans.filter((p) => p.category === category);
        return (
          <section key={category} className={styles.planColumn} aria-labelledby={`plan-${category}`}>
            <h2 id={`plan-${category}`} className={styles.planCategory}>
              {PLAN_CATEGORY_LABEL[category]}
            </h2>
            <ul role="list" className={styles.planList}>
              {list.map((plan) =>
                editing === plan.id ? (
                  <li key={plan.id} className={styles.formPanel}>
                    <PlanForm plan={plan} onDone={() => setEditing(null)} />
                  </li>
                ) : (
                  <li key={plan.id} className={styles.plan} data-featured={plan.featured ? "" : undefined}>
                    <div className={styles.planHead}>
                      <h3>{plan.name}</h3>
                      {plan.featured ? (
                        <span className={ui.tag} data-tone="accent">
                          추천
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.planPrice}>
                      {formatWon(plan.price)}
                      <span>부터</span>
                    </p>
                    {plan.delivery ? <p className={ui.muted}>납기 {plan.delivery}</p> : null}
                    <ul role="list" className={styles.features}>
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                    <div className={styles.planActions}>
                      <button type="button" className={buttonClass("secondary", { small: true })} onClick={() => setEditing(plan.id)}>
                        <Pencil size={13} aria-hidden="true" />
                        고치기
                      </button>
                      <ActionButton action={deletePlan} payload={{ id: plan.id }} small variant="danger" iconOnly label={`${plan.name} 삭제`} confirm="지울까요?" confirmLabel="삭제">
                        <Trash2 size={13} aria-hidden="true" />
                      </ActionButton>
                    </div>
                  </li>
                ),
              )}
              {editing === `new-${category}` ? (
                <li className={styles.formPanel}>
                  <PlanForm plan={{ category, name: "", price: 0, delivery: "", features: [], featured: false }} onDone={() => setEditing(null)} />
                </li>
              ) : (
                <li>
                  <button type="button" className={buttonClass("ghost", { small: true })} onClick={() => setEditing(`new-${category}`)}>
                    <Plus size={14} aria-hidden="true" />
                    {PLAN_CATEGORY_LABEL[category]} 요금제 추가
                  </button>
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
