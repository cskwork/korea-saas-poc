"use client";

import { inquiryAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { Field, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import ui from "../ui/ui.module.css";
import { useActionForm } from "../ui/useActionForm";

/** 엔터프라이즈 견적 문의: saved to the workspace; nobody is contacted in the demo. */
export function InquiryForm() {
  const { state, pending, onSubmit, errorFor } = useActionForm(inquiryAction);
  if (state.status === "success") return <Notice tone="success">{state.message}</Notice>;

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, hint?: string) => (
    <Field id={`inq-${name}`} label={label} error={errorFor(name)} hint={hint}>
      <input
        id={`inq-${name}`}
        name={name}
        className={ui.input}
        aria-invalid={errorFor(name) ? true : undefined}
        aria-describedby={describedBy(`inq-${name}`, { hint: Boolean(hint), error: errorFor(name) })}
        {...props}
      />
    </Field>
  );

  return (
    <form className={ui.form} onSubmit={onSubmit} noValidate aria-label="엔터프라이즈 견적 문의">
      <div className={ui.fieldRow}>
        {field("companyName", "회사명", { autoComplete: "organization", maxLength: 60 })}
        {field("contactName", "담당자", { autoComplete: "name", maxLength: 30 })}
      </div>
      <div className={ui.fieldRow}>
        {field("email", "이메일", { type: "email", inputMode: "email", autoComplete: "email" })}
        {field("monthlyVolume", "월 예상 의뢰 건수", { type: "number", inputMode: "numeric", min: 1, max: 10000 }, "대략이면 충분해요.")}
      </div>
      <Field id="inq-message" label="필요한 것" optional error={errorFor("message")}>
        <textarea id="inq-message" name="message" className={ui.textarea} rows={3} maxLength={1000} aria-describedby={describedBy("inq-message", { error: errorFor("message") })} />
      </Field>
      {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
      <div>
        <button type="submit" className={buttonClass("primary")} disabled={pending} data-pending={pending}>
          <PendingLabel pending={pending} idle="견적 문의 남기기" busy="보내는 중…" />
        </button>
      </div>
    </form>
  );
}
