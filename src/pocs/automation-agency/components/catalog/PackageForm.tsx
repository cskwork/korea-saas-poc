"use client";

import { Save } from "lucide-react";
import { createPackageAction, updatePackageAction } from "../../server/actions";
import { INDUSTRIES, INDUSTRY_LABEL, PACKAGE_KINDS, PACKAGE_KIND_LABEL } from "../../domain/labels";
import type { Industry, PackageKind } from "../../db/schema";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";

export interface PackageValues {
  id?: string;
  name: string;
  industry: Industry;
  kind: PackageKind;
  summary: string;
  details: string;
  tools: string[];
  buildHours: number;
  monthlyHoursSaved: number;
  setupFee: number;
  monthlyFee: number;
}

export const EMPTY_PACKAGE: PackageValues = {
  name: "",
  industry: "service",
  kind: "data",
  summary: "",
  details: "",
  tools: [],
  buildHours: 10,
  monthlyHoursSaved: 10,
  setupFee: 1_000_000,
  monthlyFee: 200_000,
};

/** Create or edit a catalogue package. */
export function PackageForm({ values }: { values: PackageValues }) {
  const editing = Boolean(values.id);
  const { state, pending, errors, formProps } = useActionForm(editing ? updatePackageAction : createPackageAction);

  return (
    <form className={ui.form} {...formProps} noValidate>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className={ui.fieldGrid}>
        <Field id="pkg-name" label="패키지 이름" errors={errors("name")}>
          {(p) => <input {...p} name="name" className={ui.input} defaultValue={values.name} required maxLength={60} />}
        </Field>
        <Field id="pkg-industry" label="업종" errors={errors("industry")}>
          {(p) => (
            <select {...p} name="industry" className={ui.select} defaultValue={values.industry}>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {INDUSTRY_LABEL[i]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="pkg-kind" label="유형" errors={errors("kind")}>
          {(p) => (
            <select {...p} name="kind" className={ui.select} defaultValue={values.kind}>
              {PACKAGE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {PACKAGE_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field id="pkg-summary" label="한 줄 설명" errors={errors("summary")} hint="카탈로그 목록에 보이는 문장이에요.">
        {(p) => (
          <input {...p} name="summary" className={ui.input} defaultValue={values.summary} required maxLength={160} />
        )}
      </Field>
      <Field id="pkg-details" label="상세 설명" optional errors={errors("details")}>
        {(p) => (
          <textarea {...p} name="details" className={ui.textarea} defaultValue={values.details} maxLength={1000} />
        )}
      </Field>
      <Field
        id="pkg-tools"
        label="사용 도구"
        errors={errors("tools")}
        hint="쉼표로 구분해요. Make · Zapier · n8n · Google Apps Script는 노선 색으로 표시돼요."
      >
        {(p) => (
          <input
            {...p}
            name="tools"
            className={ui.input}
            defaultValue={values.tools.join(", ")}
            placeholder="Make, Google Sheets"
          />
        )}
      </Field>
      <div className={ui.fieldGrid}>
        <Field id="pkg-build" label="구축 시간 (시간)" errors={errors("buildHours")}>
          {(p) => (
            <input
              {...p}
              name="buildHours"
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              className={ui.input}
              defaultValue={values.buildHours}
            />
          )}
        </Field>
        <Field id="pkg-saved" label="월 절감 시간 (시간)" errors={errors("monthlyHoursSaved")}>
          {(p) => (
            <input
              {...p}
              name="monthlyHoursSaved"
              type="number"
              inputMode="numeric"
              min={0}
              max={2000}
              className={ui.input}
              defaultValue={values.monthlyHoursSaved}
            />
          )}
        </Field>
        <Field id="pkg-setup" label="구축비 (원)" errors={errors("setupFee")}>
          {(p) => (
            <input
              {...p}
              name="setupFee"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              className={ui.input}
              defaultValue={values.setupFee}
            />
          )}
        </Field>
        <Field id="pkg-monthly" label="월 유지보수비 (원)" errors={errors("monthlyFee")}>
          {(p) => (
            <input
              {...p}
              name="monthlyFee"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              className={ui.input}
              defaultValue={values.monthlyFee}
            />
          )}
        </Field>
      </div>
      <div className={ui.formFoot}>
        <SubmitButton pending={pending} pendingLabel="저장 중…" icon={<Save size={16} aria-hidden="true" />}>
          {editing ? "변경 내용 저장" : "패키지 등록"}
        </SubmitButton>
        <ActionNotice state={state} />
      </div>
    </form>
  );
}
