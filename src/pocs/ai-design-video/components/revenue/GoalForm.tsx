"use client";

import { setGoalAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { FormStatus } from "../ui/FormStatus";
import { controlProps, useFormAction } from "../ui/useFormAction";
import ui from "../ui.module.css";
import styles from "./revenue.module.css";

export function GoalForm({ goal }: { goal: number }) {
  const { state, pending, onSubmit, fieldError } = useFormAction(setGoalAction);
  return (
    <form className={styles.goalForm} onSubmit={onSubmit}>
      <Field id="goal" label="월 매출 목표 (원)" error={fieldError("monthlyGoal")}>
        <input
          {...controlProps("goal", fieldError("monthlyGoal"))}
          className={ui.input}
          type="number"
          name="monthlyGoal"
          inputMode="numeric"
          min={100000}
          step={100000}
          required
          defaultValue={goal}
        />
      </Field>
      <button type="submit" className={[ui.button, ui.secondary].join(" ")} disabled={pending} aria-busy={pending}>
        {pending && <span className={ui.spinner} aria-hidden="true" />}
        목표 저장
      </button>
      <FormStatus state={state} className={styles.goalStatus} />
    </form>
  );
}
