"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { PLAN_CATEGORIES, PLAN_CATEGORY_LABEL } from "../../domain/labels";
import { submitInquiry } from "../../server/actions";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";
import styles from "./PublicProfile.module.css";

/** A prospective client's quote request; it lands on the developer's board as a 문의 card. */
export function InquiryForm() {
  const [state, formAction] = useActionState(submitInquiry, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className={styles.thanks} role="status">
        <p className={styles.thanksTitle}>{state.message}</p>
        <p>이 데모에서는 문의가 DevFlow 작업공간의 프로젝트 보드 ‘문의’ 열과 고객 목록에 바로 들어가요.</p>
        <a href="/dev-freelancing/projects">작업공간에서 확인하기</a>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <div className={ui.formGrid}>
        <Field id={`${uid}-name`} label="이름" errors={errors?.name}>
          {(a11y) => <input {...a11y} name="name" className={ui.input} autoComplete="name" maxLength={40} required />}
        </Field>
        <Field id={`${uid}-company`} label="회사 (선택)" errors={errors?.company}>
          {(a11y) => <input {...a11y} name="company" className={ui.input} autoComplete="organization" maxLength={60} />}
        </Field>
        <Field id={`${uid}-email`} label="회신받을 이메일" errors={errors?.email}>
          {(a11y) => <input {...a11y} name="email" type="email" className={ui.input} autoComplete="email" maxLength={120} required />}
        </Field>
        <Field id={`${uid}-phone`} label="연락처 (선택)" errors={errors?.phone}>
          {(a11y) => <input {...a11y} name="phone" type="tel" className={ui.input} autoComplete="tel" maxLength={30} />}
        </Field>
        <Field id={`${uid}-category`} label="만들고 싶은 것" errors={errors?.category}>
          {(a11y) => (
            <select {...a11y} name="category" className={ui.select} defaultValue="">
              <option value="">아직 모르겠어요</option>
              {PLAN_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {PLAN_CATEGORY_LABEL[category]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id={`${uid}-budget`} label="생각한 예산 (원, 선택)" errors={errors?.budget}>
          {(a11y) => <input {...a11y} name="budget" className={`${ui.input} ${ui.numberInput}`} inputMode="numeric" placeholder="예: 3000000" />}
        </Field>
        <Field id={`${uid}-message`} label="요청 내용" hint="필요한 기능, 원하는 일정, 참고 서비스가 있으면 함께 적어 주세요." errors={errors?.message} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="message" className={ui.textarea} rows={5} maxLength={2000} required />}
        </Field>
      </div>
      <div className={ui.formActions}>
        <SubmitButton pendingLabel="보내는 중…">견적 문의 보내기</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
