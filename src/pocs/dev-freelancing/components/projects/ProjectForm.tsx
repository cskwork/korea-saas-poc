"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { PRIORITY_LABEL, PROJECT_STATUS_LABEL } from "../../domain/labels";
import { PRIORITIES, PROJECT_STATUSES, type Priority, type ProjectStatus } from "../../domain/pipeline";
import { saveProject } from "../../server/actions";
import type { ClientOption } from "../../server/data/clients";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";

export interface ProjectDraft {
  id?: string;
  title: string;
  clientId: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  startOn: string | null;
  dueOn: string | null;
  description: string;
}

const EMPTY: ProjectDraft = {
  title: "",
  clientId: null,
  status: "inquiry",
  priority: "medium",
  budget: 0,
  startOn: null,
  dueOn: null,
  description: "",
};

/** Create or edit a project. A new project lands at the bottom of its column. */
export function ProjectForm({
  clients,
  project = EMPTY,
  onSaved,
  submitLabel,
}: {
  clients: ClientOption[];
  project?: ProjectDraft;
  onSaved?: () => void;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(saveProject, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onSaved);

  return (
    <form action={formAction} className={ui.region} noValidate>
      {project.id ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className={ui.formGrid}>
        <Field id={`${uid}-title`} label="프로젝트명" errors={errors?.title} className={ui.span2}>
          {(a11y) => <input {...a11y} name="title" className={ui.input} defaultValue={project.title} required maxLength={80} placeholder="예: 로컬푸드 배달 앱 1차 개발" />}
        </Field>
        <Field id={`${uid}-client`} label="고객" errors={errors?.clientId}>
          {(a11y) => (
            <select {...a11y} name="clientId" className={ui.select} defaultValue={project.clientId ?? ""}>
              <option value="">고객 없이</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company ? `${client.company} · ${client.name}` : client.name}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-status`} label="단계" errors={errors?.status}>
          {(a11y) => (
            <select {...a11y} name="status" className={ui.select} defaultValue={project.status}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PROJECT_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-priority`} label="우선순위" errors={errors?.priority}>
          {(a11y) => (
            <select {...a11y} name="priority" className={ui.select} defaultValue={project.priority}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABEL[priority]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-budget`} label="예산 (원)" errors={errors?.budget}>
          {(a11y) => (
            <input
              {...a11y}
              name="budget"
              className={`${ui.input} ${ui.numberInput}`}
              inputMode="numeric"
              defaultValue={project.budget ? String(project.budget) : ""}
              placeholder="3000000"
            />
          )}
        </Field>
        <Field id={`${uid}-start`} label="시작일" errors={errors?.startOn}>
          {(a11y) => <input {...a11y} type="date" name="startOn" className={ui.input} defaultValue={project.startOn ?? ""} />}
        </Field>
        <Field id={`${uid}-due`} label="마감일" errors={errors?.dueOn}>
          {(a11y) => <input {...a11y} type="date" name="dueOn" className={ui.input} defaultValue={project.dueOn ?? ""} />}
        </Field>
        <Field id={`${uid}-desc`} label="메모" hint="범위, 연락 채널, 특이사항" errors={errors?.description} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="description" className={ui.textarea} defaultValue={project.description} maxLength={2000} rows={3} />}
        </Field>
      </div>
      <div className={ui.formActions}>
        <SubmitButton>{submitLabel ?? (project.id ? "저장" : "보드에 추가")}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
