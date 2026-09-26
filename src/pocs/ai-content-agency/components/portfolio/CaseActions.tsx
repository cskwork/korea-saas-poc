"use client";

import { PencilLine } from "lucide-react";
import { useState } from "react";
import { deleteCaseAction, updateCaseAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { ConfirmAction } from "../ui/ConfirmAction";
import { Field, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import ui from "../ui/ui.module.css";
import { useActionForm } from "../ui/useActionForm";
import styles from "./portfolio.module.css";

/** Correct a case's title and line in place, or take it down. */
export function CaseActions({ caseId, title, summary }: { caseId: string; title: string; summary: string }) {
  const [editing, setEditing] = useState(false);
  const { state, pending, onSubmit, errorFor } = useActionForm<undefined>(async (prev, formData) => {
    const result = await updateCaseAction(prev, formData);
    if (result.status === "success") setEditing(false);
    return result;
  });

  if (editing) {
    const titleId = `case-${caseId}-title`;
    const summaryId = `case-${caseId}-summary`;
    return (
      <form className={`${ui.form} ${styles.caseEdit}`} onSubmit={onSubmit} noValidate aria-label="사례 고치기">
        <input type="hidden" name="caseId" value={caseId} />
        <Field id={titleId} label="사례 제목" error={errorFor("title")}>
          <input
            id={titleId}
            name="title"
            className={ui.input}
            defaultValue={title}
            maxLength={60}
            aria-invalid={errorFor("title") ? true : undefined}
            aria-describedby={describedBy(titleId, { error: errorFor("title") })}
          />
        </Field>
        <Field id={summaryId} label="한 줄 설명" error={errorFor("summary")}>
          <input
            id={summaryId}
            name="summary"
            className={ui.input}
            defaultValue={summary}
            maxLength={160}
            aria-invalid={errorFor("summary") ? true : undefined}
            aria-describedby={describedBy(summaryId, { error: errorFor("summary") })}
          />
        </Field>
        {state.status === "error" && !state.fieldErrors ? <Notice tone="error">{state.message}</Notice> : null}
        <div className={styles.caseEditActions}>
          <button type="submit" className={buttonClass("primary", "small")} disabled={pending} data-pending={pending}>
            <PendingLabel pending={pending} idle="저장" busy="저장하는 중…" />
          </button>
          <button type="button" className={buttonClass("secondary", "small")} onClick={() => setEditing(false)} disabled={pending}>
            취소
          </button>
        </div>
      </form>
    );
  }

  return (
    <span className={styles.caseButtons}>
      <button type="button" className={buttonClass("quiet", "small")} onClick={() => setEditing(true)}>
        <PencilLine size={14} aria-hidden="true" />
        고치기
      </button>
      <ConfirmAction size="small" quiet label="내리기" question="게시판에서 내릴까요?" confirmLabel="내리기" run={() => deleteCaseAction({ caseId })} />
    </span>
  );
}
