"use client";

import { useState } from "react";
import clsx from "clsx";
import { formatPercent, formatWon } from "@/core/format";
import type { GoalProgress } from "../../domain/metrics";
import { setGoalAction } from "../../server/actions";
import { ActionNotice, SubmitButton } from "../ui/actions";
import { Field } from "../ui/Field";
import { ui } from "../ui/primitives";
import { useActionForm } from "../ui/useActionForm";
import styles from "./dashboard.module.css";

/** Monthly goal: progress, a straight-line projection, and an inline editor. */
export function GoalMeter({ goal }: { goal: GoalProgress }) {
  const [editing, setEditing] = useState(false);
  const { state, pending, onSubmit, errors } = useActionForm(setGoalAction);
  const done = goal.ratio >= 1;

  return (
    <div className={styles.goal}>
      <div className={styles.goalHead}>
        <span>목표 {formatWon(goal.goal)}</span>
        <span className={styles.goalPercent}>{formatPercent(goal.ratio, 0)}</span>
      </div>
      <div
        className={styles.meter}
        role="meter"
        aria-label="이번 달 목표 달성률"
        aria-valuemin={0}
        aria-valuemax={goal.goal}
        aria-valuenow={Math.min(goal.earned, goal.goal)}
        aria-valuetext={`${formatWon(goal.earned)} / ${formatWon(goal.goal)}`}
      >
        <span className={clsx(styles.meterFill, done && styles.meterDone)} style={{ transform: `scaleX(${Math.min(1, goal.ratio)})` }} />
      </div>
      <p className={styles.goalNote}>
        {done
          ? `목표를 넘겼어요. 이 속도면 월말 약 ${formatWon(goal.projected)}이에요.`
          : `이 속도면 월말 약 ${formatWon(goal.projected)} · 하루 ${formatWon(goal.neededPerDay)}씩 더 벌면 목표 달성`}
      </p>
      {editing ? (
        <form onSubmit={onSubmit} className={styles.goalForm}>
          <Field label="새 월 목표" unit="원" error={errors.goal}>
            <input name="goal" inputMode="numeric" defaultValue={String(goal.goal)} autoComplete="off" required />
          </Field>
          <SubmitButton small pending={pending} pendingLabel="저장 중…">
            저장
          </SubmitButton>
          <button type="button" className={clsx(ui.base, ui.small)} onClick={() => setEditing(false)}>
            닫기
          </button>
        </form>
      ) : (
        <button type="button" className={clsx(ui.quiet, ui.small, styles.goalEdit)} onClick={() => setEditing(true)}>
          목표 금액 바꾸기
        </button>
      )}
      <ActionNotice state={state} />
    </div>
  );
}
