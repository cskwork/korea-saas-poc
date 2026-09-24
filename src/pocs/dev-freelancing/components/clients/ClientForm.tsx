"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { CLIENT_GRADE_LABEL, CLIENT_GRADES, type ClientGrade } from "../../domain/labels";
import { saveClient } from "../../server/actions";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";

export interface ClientDraft {
  id?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  grade: ClientGrade;
  notes: string;
}

const EMPTY: ClientDraft = { name: "", company: "", email: "", phone: "", grade: "new", notes: "" };

/** Create (then open the new client) or edit a client. */
export function ClientForm({ client = EMPTY, onSaved }: { client?: ClientDraft; onSaved?: () => void }) {
  const [state, formAction] = useActionState(saveClient, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onSaved);
  return (
    <form action={formAction} className={ui.region} noValidate>
      {client.id ? <input type="hidden" name="id" value={client.id} /> : null}
      <div className={ui.formGrid}>
        <Field id={`${uid}-name`} label="이름 · 담당자" errors={errors?.name}>
          {(a11y) => <input {...a11y} name="name" className={ui.input} defaultValue={client.name} maxLength={40} required placeholder="홍길동" />}
        </Field>
        <Field id={`${uid}-company`} label="회사" errors={errors?.company}>
          {(a11y) => <input {...a11y} name="company" className={ui.input} defaultValue={client.company} maxLength={60} placeholder="(주)테크스타트" />}
        </Field>
        <Field id={`${uid}-email`} label="이메일" errors={errors?.email}>
          {(a11y) => <input {...a11y} name="email" type="email" className={ui.input} defaultValue={client.email} maxLength={120} placeholder="name@company.com" />}
        </Field>
        <Field id={`${uid}-phone`} label="연락처" errors={errors?.phone}>
          {(a11y) => <input {...a11y} name="phone" type="tel" className={ui.input} defaultValue={client.phone} maxLength={30} placeholder="010-0000-0000" />}
        </Field>
        <Field id={`${uid}-grade`} label="등급" errors={errors?.grade}>
          {(a11y) => (
            <select {...a11y} name="grade" className={ui.select} defaultValue={client.grade}>
              {CLIENT_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {CLIENT_GRADE_LABEL[grade]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-notes`} label="메모" hint="결제 습관, 선호 연락 시간 같은 것" errors={errors?.notes} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="notes" className={ui.textarea} defaultValue={client.notes} maxLength={1000} rows={3} />}
        </Field>
      </div>
      <div className={ui.formActions}>
        <SubmitButton>{client.id ? "저장" : "고객 등록"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
