"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { NOTE_KIND_LABEL, NOTE_KINDS } from "../../domain/labels";
import { addClientNote } from "../../server/actions";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";

/** Adds a call, meeting, email or memo to the client's history. */
export function NoteForm({ clientId, today }: { clientId: string; today: string }) {
  const [state, formAction] = useActionState(addClientNote, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className={ui.region} noValidate>
      <input type="hidden" name="clientId" value={clientId} />
      <div className={ui.formGrid}>
        <Field id={`${uid}-kind`} label="종류" errors={errors?.kind}>
          {(a11y) => (
            <select {...a11y} name="kind" className={ui.select} defaultValue="call">
              {NOTE_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {NOTE_KIND_LABEL[kind]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-day`} label="날짜" errors={errors?.occurredOn}>
          {(a11y) => <input {...a11y} type="date" name="occurredOn" className={ui.input} defaultValue={today} max={today} required />}
        </Field>
        <Field id={`${uid}-body`} label="내용" errors={errors?.body} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="body" className={ui.textarea} rows={3} maxLength={1000} required placeholder="예: 2차 개발 범위 통화. 예산 확인 후 다음 주 회신 예정." />}
        </Field>
      </div>
      <div className={ui.formActions}>
        <SubmitButton small>기록 남기기</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
