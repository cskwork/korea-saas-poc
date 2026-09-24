"use client";

import { publishCaseAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { Field, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import ui from "../ui/ui.module.css";
import { useActionForm } from "../ui/useActionForm";

/** Puts a delivered order on the 사례 board, with a title and one line of context. */
export function PublishCase({ orderId, defaultTitle, defaultSummary }: { orderId: string; defaultTitle: string; defaultSummary: string }) {
  const { state, pending, onSubmit, errorFor } = useActionForm(publishCaseAction);
  if (state.status === "success") {
    return <Notice tone="success">{state.message}</Notice>;
  }
  return (
    <form className={ui.form} onSubmit={onSubmit} noValidate>
      <input type="hidden" name="orderId" value={orderId} />
      <Field id="case-title" label="사례 제목" error={errorFor("title")}>
        <input
          id="case-title"
          name="title"
          className={ui.input}
          defaultValue={defaultTitle}
          maxLength={60}
          aria-invalid={errorFor("title") ? true : undefined}
          aria-describedby={describedBy("case-title", { error: errorFor("title") })}
        />
      </Field>
      <Field id="case-summary" label="한 줄 설명" hint="어떤 일을 맡아 무엇을 썼는지 적어 주세요." error={errorFor("summary")}>
        <input
          id="case-summary"
          name="summary"
          className={ui.input}
          defaultValue={defaultSummary}
          maxLength={160}
          aria-invalid={errorFor("summary") ? true : undefined}
          aria-describedby={describedBy("case-summary", { hint: true, error: errorFor("summary") })}
        />
      </Field>
      {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
      <div>
        <button type="submit" className={buttonClass("secondary")} disabled={pending} data-pending={pending}>
          <PendingLabel pending={pending} idle="사례 게시판에 올리기" busy="올리는 중…" />
        </button>
      </div>
    </form>
  );
}
