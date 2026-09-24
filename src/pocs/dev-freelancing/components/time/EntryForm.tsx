"use client";

import { useActionState, useId, useState } from "react";
import { idleState } from "@/core/actions";
import { saveEntry } from "../../server/actions";
import type { PickerProject } from "../../server/data/time";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";
import styles from "./EntryForm.module.css";

export interface EntryDraft {
  id: string;
  projectId: string;
  milestoneId: string | null;
  workedOn: string;
  minutes: number;
  note: string;
}

/**
 * Log hours by hand (or correct an entry). With `fixedProjectId` the project is implied (project page).
 */
export function EntryForm({
  projects,
  today,
  fixedProjectId,
  entry,
  onDone,
  compact = false,
}: {
  projects: PickerProject[];
  today: string;
  fixedProjectId?: string;
  entry?: EntryDraft;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(saveEntry, idleState);
  const uid = useId();
  const firstOpen = projects.find((p) => !p.done)?.id ?? projects[0]?.id ?? "";
  const [projectId, setProjectId] = useState(entry?.projectId ?? fixedProjectId ?? firstOpen);
  const [milestoneId, setMilestoneId] = useState(entry?.milestoneId ?? "");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onDone);

  const milestones = projects.find((p) => p.id === projectId)?.milestones ?? [];

  return (
    <form action={formAction} className={ui.region} noValidate>
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <div className={compact ? `${ui.formGrid} ${styles.compact}` : ui.formGrid}>
        {fixedProjectId ? (
          <input type="hidden" name="projectId" value={fixedProjectId} />
        ) : (
          <Field id={`${uid}-project`} label="프로젝트" errors={errors?.projectId} className={ui.span2}>
            {(a11y) => (
              <select
                {...a11y}
                name="projectId"
                className={ui.select}
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  setMilestoneId("");
                }}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.done ? `${project.title} (완료)` : project.title}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        {milestones.length > 0 ? (
          <Field id={`${uid}-milestone`} label="마일스톤" errors={errors?.milestoneId} className={compact ? ui.span2 : undefined}>
            {(a11y) => (
              <select {...a11y} name="milestoneId" className={ui.select} value={milestoneId} onChange={(event) => setMilestoneId(event.target.value)}>
                <option value="">마일스톤 없이</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.done ? `${m.title} (완료)` : m.title}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        <Field id={`${uid}-day`} label="작업한 날" errors={errors?.workedOn}>
          {(a11y) => <input {...a11y} type="date" name="workedOn" className={ui.input} defaultValue={entry?.workedOn ?? today} max={today} required />}
        </Field>
        <Field id={`${uid}-hours`} label="시간" hint="0.25 = 15분" errors={errors?.hours}>
          {(a11y) => (
            <input
              {...a11y}
              name="hours"
              className={`${ui.input} ${ui.numberInput}`}
              inputMode="decimal"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              defaultValue={entry ? String(Math.round((entry.minutes / 60) * 100) / 100) : ""}
              placeholder="1.5"
              required
            />
          )}
        </Field>
        <Field id={`${uid}-note`} label="한 일" errors={errors?.note} className={ui.span2}>
          {(a11y) => <input {...a11y} name="note" className={ui.input} defaultValue={entry?.note ?? ""} maxLength={200} placeholder="예: 결제 웹훅 처리" />}
        </Field>
      </div>
      <div className={ui.formActions}>
        <SubmitButton pendingLabel="기록 중…">{entry ? "고친 내용 저장" : "기록하기"}</SubmitButton>
        {entry && onDone ? (
          <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={onDone}>
            취소
          </button>
        ) : null}
        <FormMessage state={state} />
      </div>
    </form>
  );
}
