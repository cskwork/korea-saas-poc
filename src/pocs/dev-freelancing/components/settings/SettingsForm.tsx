"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { TAX_MODE_HINT, TAX_MODE_LABEL } from "../../domain/labels";
import type { TaxMode } from "../../domain/money";
import { saveProfile } from "../../server/actions";
import type { Profile } from "../../server/data/profile";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import ui from "../ui/ui.module.css";
import styles from "./Settings.module.css";

/** Who issues the documents, how they are taxed, and the defaults new documents start from. */
export function SettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(saveProfile, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const text = (name: keyof Profile, label: string, options: { hint?: string; placeholder?: string; wide?: boolean; type?: string; max?: number } = {}) => (
    <Field id={`${uid}-${name}`} label={label} hint={options.hint} errors={errors?.[name]} className={options.wide ? ui.span2 : undefined}>
      {(a11y) => (
        <input
          {...a11y}
          name={name}
          type={options.type ?? "text"}
          className={ui.input}
          defaultValue={String(profile[name] ?? "")}
          placeholder={options.placeholder}
          maxLength={options.max}
        />
      )}
    </Field>
  );

  return (
    <form action={formAction} className={styles.form} noValidate>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>문서에 찍히는 공급자</legend>
        <div className={ui.formGrid}>
          {text("displayName", "이름", { max: 40 })}
          {text("businessName", "상호 (없으면 이름)", { max: 60 })}
          {text("email", "이메일", { type: "email", max: 120 })}
          {text("phone", "연락처", { type: "tel", max: 30 })}
          {text("bankAccount", "입금 계좌", { placeholder: "은행 계좌번호 예금주", wide: true, max: 80 })}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>세금</legend>
        <div className={styles.taxModes} role="radiogroup" aria-label="기본 세금 처리">
          {(["withholding", "vat", "none"] as TaxMode[]).map((mode) => (
            <label key={mode} className={styles.taxMode}>
              <input type="radio" name="taxMode" value={mode} defaultChecked={profile.taxMode === mode} />
              <span>
                <strong>{TAX_MODE_LABEL[mode]}</strong>
                <span className={ui.hint}>{TAX_MODE_HINT[mode]}</span>
              </span>
            </label>
          ))}
        </div>
        <div className={ui.formGrid}>
          {text("businessNumber", "사업자등록번호", { hint: "등록했다면 000-00-00000. 비워 두면 문서에 ‘미등록’으로 나와요.", placeholder: "000-00-00000" })}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>기본값과 목표</legend>
        <div className={ui.formGrid}>
          <Field id={`${uid}-rate`} label="기본 시급 (원)" hint="새 견적 항목과 초안에 쓰여요" errors={errors?.hourlyRate}>
            {(a11y) => <input {...a11y} name="hourlyRate" className={`${ui.input} ${ui.numberInput}`} inputMode="numeric" defaultValue={profile.hourlyRate} />}
          </Field>
          <Field id={`${uid}-goal`} label="월 입금 목표 (원)" hint="개요의 목표 칸 10개가 이 금액이에요" errors={errors?.monthlyGoal}>
            {(a11y) => <input {...a11y} name="monthlyGoal" className={`${ui.input} ${ui.numberInput}`} inputMode="numeric" defaultValue={profile.monthlyGoal} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>공개 페이지 소개</legend>
        <div className={ui.formGrid}>
          {text("headline", "한 줄 소개", { wide: true, max: 120, placeholder: "스타트업 MVP를 기획부터 배포까지 혼자 책임지는 풀스택 개발자" })}
          <Field id={`${uid}-bio`} label="소개" errors={errors?.bio} className={ui.span2}>
            {(a11y) => <textarea {...a11y} name="bio" className={ui.textarea} rows={4} defaultValue={profile.bio} maxLength={600} />}
          </Field>
        </div>
      </fieldset>

      <div className={ui.formActions}>
        <SubmitButton>설정 저장</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
