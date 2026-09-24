"use client";

import { Plus } from "lucide-react";
import { PLATFORM_INFO, PLATFORMS } from "../../domain/labels";
import { WORKFLOW_TEMPLATES } from "../../domain/workflow";
import { createWorkflowAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";

/** Create a workflow, blank or from one of the starter templates. */
export function NewWorkflowForm({
  projects,
  defaultProjectId,
}: {
  projects: { id: string; clientName: string }[];
  defaultProjectId?: string;
}) {
  const { state, pending, errors, formProps } = useActionForm(createWorkflowAction);
  return (
    <form className={ui.form} {...formProps} noValidate>
      <Field id="nwf-name" label="워크플로 이름" errors={errors("name")}>
        {(p) => <input {...p} name="name" className={ui.input} placeholder="예: 그린마트 재고 알림" maxLength={60} />}
      </Field>
      <Field id="nwf-platform" label="플랫폼 (노선)" errors={errors("platform")} hint="노선 색이 플랫폼을 나타내요.">
        {(p) => (
          <select {...p} name="platform" className={ui.select} defaultValue="make">
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_INFO[platform].label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="nwf-template" label="시작 방법" errors={errors("template")}>
        {(p) => (
          <select {...p} name="template" className={ui.select} defaultValue="">
            <option value="">빈 노선 (트리거 하나)</option>
            {WORKFLOW_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                템플릿: {t.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="nwf-project" label="연결 프로젝트" optional errors={errors("projectId")}>
        {(p) => (
          <select {...p} name="projectId" className={ui.select} defaultValue={defaultProjectId ?? ""}>
            <option value="">연결 안 함</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.clientName}
              </option>
            ))}
          </select>
        )}
      </Field>
      <div className={ui.formFoot}>
        <SubmitButton pending={pending} pendingLabel="만드는 중…" icon={<Plus size={16} aria-hidden="true" />}>
          노선 만들기
        </SubmitButton>
        <ActionNotice state={state} />
      </div>
    </form>
  );
}
