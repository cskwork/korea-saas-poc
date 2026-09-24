"use client";

import { Save } from "lucide-react";
import { saveProfileAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";

export interface ProfileValues {
  agencyName: string;
  representative: string;
  businessNumber: string;
  email: string;
  phone: string;
}

/** Supplier details printed on every quote (공급자). */
export function ProfileForm({ values }: { values: ProfileValues }) {
  const { state, pending, errors, formProps } = useActionForm(saveProfileAction);
  return (
    <form className={ui.form} {...formProps} noValidate>
      <div className={ui.fieldGrid}>
        <Field id="pf-name" label="상호" errors={errors("agencyName")}>
          {(p) => (
            <input {...p} name="agencyName" className={ui.input} defaultValue={values.agencyName} maxLength={40} />
          )}
        </Field>
        <Field id="pf-rep" label="대표자" errors={errors("representative")}>
          {(p) => (
            <input
              {...p}
              name="representative"
              className={ui.input}
              defaultValue={values.representative}
              maxLength={20}
            />
          )}
        </Field>
        <Field id="pf-biz" label="사업자등록번호" optional errors={errors("businessNumber")}>
          {(p) => (
            <input
              {...p}
              name="businessNumber"
              className={ui.input}
              defaultValue={values.businessNumber}
              maxLength={20}
              placeholder="000-00-00000"
            />
          )}
        </Field>
        <Field id="pf-phone" label="연락처" optional errors={errors("phone")}>
          {(p) => (
            <input {...p} name="phone" type="tel" className={ui.input} defaultValue={values.phone} maxLength={20} />
          )}
        </Field>
        <Field id="pf-email" label="이메일" optional errors={errors("email")}>
          {(p) => (
            <input {...p} name="email" type="email" className={ui.input} defaultValue={values.email} maxLength={80} />
          )}
        </Field>
      </div>
      <div className={ui.formFoot}>
        <SubmitButton
          pending={pending}
          variant="secondary"
          pendingLabel="저장 중…"
          icon={<Save size={16} aria-hidden="true" />}
        >
          공급자 정보 저장
        </SubmitButton>
        <ActionNotice state={state} />
      </div>
    </form>
  );
}
