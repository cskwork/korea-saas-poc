"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { useActionState, useId, useOptimistic, useState, useTransition } from "react";
import { idleState } from "@/core/actions";
import { dDay, shortDay } from "../../domain/dates";
import { hoursLabel } from "../../domain/time";
import { deleteMilestone, moveMilestone, saveMilestone, toggleMilestone } from "../../server/actions";
import type { MilestoneRow } from "../../server/data/projects";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import { HourCellsBar } from "../ui/Cells";
import { EmptyState } from "../ui/EmptyState";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";
import styles from "./Milestones.module.css";

function MilestoneForm({ projectId, milestone, onDone }: { projectId: string; milestone?: MilestoneRow; onDone?: () => void }) {
  const [state, formAction] = useActionState(saveMilestone, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onDone);
  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      {milestone ? <input type="hidden" name="id" value={milestone.id} /> : null}
      <Field id={`${uid}-title`} label="마일스톤" errors={errors?.title} className={styles.formTitle}>
        {(a11y) => <input {...a11y} name="title" className={ui.input} defaultValue={milestone?.title} maxLength={80} placeholder="예: 결제 연동" required />}
      </Field>
      <Field id={`${uid}-hours`} label="예상 시간" errors={errors?.estimatedHours}>
        {(a11y) => (
          <input
            {...a11y}
            name="estimatedHours"
            type="number"
            step="0.5"
            min="0.5"
            className={`${ui.input} ${ui.numberInput}`}
            defaultValue={milestone?.estimatedHours ?? ""}
            placeholder="16"
          />
        )}
      </Field>
      <Field id={`${uid}-due`} label="기한" errors={errors?.dueOn}>
        {(a11y) => <input {...a11y} name="dueOn" type="date" className={ui.input} defaultValue={milestone?.dueOn ?? ""} />}
      </Field>
      <div className={styles.formActions}>
        <SubmitButton small>{milestone ? "저장" : "추가"}</SubmitButton>
        {onDone && milestone ? (
          <button type="button" className={buttonClass("ghost", { small: true })} onClick={onDone}>
            취소
          </button>
        ) : null}
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/**
 * Milestones: each is a square that fills — hollow (not started), partial (hours logged), solid (done).
 * Toggling done is optimistic; hours per milestone come from time entries linked to it.
 */
export function Milestones({ projectId, milestones, today }: { projectId: string; milestones: MilestoneRow[]; today: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [rows, setDone] = useOptimistic(milestones, (state, change: { id: string; done: boolean }) =>
    state.map((m) => (m.id === change.id ? { ...m, doneAt: change.done ? new Date() : null } : m)),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (milestone: MilestoneRow) =>
    startTransition(async () => {
      const done = !milestone.doneAt;
      setDone({ id: milestone.id, done });
      const result = await toggleMilestone({ id: milestone.id, done });
      setError(result.status === "error" ? result.message : null);
    });

  return (
    <div className={styles.wrap}>
      {rows.length === 0 ? (
        <EmptyState title="아직 마일스톤이 없어요">
          견적서에서 프로젝트를 만들면 견적 항목이 마일스톤이 돼요. 여기서 직접 추가해도 돼요.
        </EmptyState>
      ) : (
        <ol role="list" className={styles.list}>
          {rows.map((milestone, index) => {
            const state = milestone.doneAt ? "solid" : milestone.trackedMinutes > 0 ? "partial" : "hollow";
            if (editing === milestone.id) {
              return (
                <li key={milestone.id} className={styles.row}>
                  <MilestoneForm projectId={projectId} milestone={milestone} onDone={() => setEditing(null)} />
                </li>
              );
            }
            return (
              <li key={milestone.id} className={styles.row} data-done={milestone.doneAt ? "" : undefined}>
                <button
                  type="button"
                  className={styles.toggle}
                  data-state={state}
                  aria-pressed={Boolean(milestone.doneAt)}
                  aria-label={`${milestone.title} ${milestone.doneAt ? "완료 취소" : "완료 표시"}`}
                  onClick={() => toggle(milestone)}
                />
                <div className={styles.what}>
                  <span className={styles.title}>{milestone.title}</span>
                  <span className={styles.meta}>
                    {milestone.doneAt ? "완료" : milestone.trackedMinutes > 0 ? "진행 중" : "시작 전"}
                    {milestone.dueOn && !milestone.doneAt ? ` · ${shortDay(milestone.dueOn)} ${dDay(milestone.dueOn, today)}` : ""}
                  </span>
                </div>
                <div className={styles.hours}>
                  <HourCellsBar estimatedHours={milestone.estimatedHours} trackedMinutes={milestone.trackedMinutes} maxCells={24} caption={false} size={8} />
                  <span className={ui.measure}>
                    {hoursLabel(milestone.trackedMinutes)}
                    {milestone.estimatedHours !== null ? `/${milestone.estimatedHours}h` : "h"}
                  </span>
                </div>
                <div className={styles.actions}>
                  <ActionButton action={moveMilestone} payload={{ id: milestone.id, direction: -1 as const }} small iconOnly variant="ghost" label="위로" disabled={index === 0}>
                    <ArrowUp size={14} aria-hidden="true" />
                  </ActionButton>
                  <ActionButton
                    action={moveMilestone}
                    payload={{ id: milestone.id, direction: 1 as const }}
                    small
                    iconOnly
                    variant="ghost"
                    label="아래로"
                    disabled={index === rows.length - 1}
                  >
                    <ArrowDown size={14} aria-hidden="true" />
                  </ActionButton>
                  <button type="button" className={buttonClass("ghost", { small: true, iconOnly: true })} aria-label={`${milestone.title} 고치기`} title="고치기" onClick={() => setEditing(milestone.id)}>
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                  <ActionButton action={deleteMilestone} payload={{ id: milestone.id }} small iconOnly variant="danger" label={`${milestone.title} 삭제`} confirm="삭제할까요?" confirmLabel="삭제">
                    <Trash2 size={14} aria-hidden="true" />
                  </ActionButton>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {error ? (
        <p className={ui.fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <details className={styles.add}>
        <summary className={buttonClass("secondary", { small: true })}>마일스톤 추가</summary>
        <MilestoneForm projectId={projectId} />
      </details>
    </div>
  );
}
