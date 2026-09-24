"use client";

import { useRef, useState } from "react";
import { Calculator, Save } from "lucide-react";
import { formatKrw } from "@/core/format";
import type { Industry, MaintenanceStatus, Stage } from "../../db/schema";
import { INDUSTRIES, INDUSTRY_LABEL, MAINTENANCE_LABEL, MAINTENANCE_STATUSES } from "../../domain/labels";
import { STAGE_ARRIVAL_PROGRESS, STAGE_LABEL, STAGES } from "../../domain/stages";
import { createProjectAction, updateProjectAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";
import styles from "./projects.module.css";

export interface ProjectValues {
  id?: string;
  clientName: string;
  industry: Industry;
  stage: Stage;
  progress: number;
  assignee: string;
  startDate: string | null;
  dueDate: string | null;
  notes: string;
  packageIds: string[];
  setupFee: number;
  monthlyFee: number;
  maintenanceStatus: MaintenanceStatus;
  maintenanceStartedOn: string | null;
}

export const EMPTY_PROJECT: ProjectValues = {
  clientName: "",
  industry: "service",
  stage: "waiting",
  progress: 0,
  assignee: "",
  startDate: null,
  dueDate: null,
  notes: "",
  packageIds: [],
  setupFee: 0,
  monthlyFee: 0,
  maintenanceStatus: "none",
  maintenanceStartedOn: null,
};

export interface PackageChoice {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
  archived: boolean;
}

/** Create or edit a client project. Fees can be filled from the selected packages. */
export function ProjectForm({ values, packages }: { values: ProjectValues; packages: PackageChoice[] }) {
  const editing = Boolean(values.id);
  const { state, pending, errors, formProps } = useActionForm(editing ? updateProjectAction : createProjectAction);
  const [selected, setSelected] = useState<string[]>(values.packageIds);
  const [progress, setProgress] = useState(values.progress);
  const setupRef = useRef<HTMLInputElement>(null);
  const monthlyRef = useRef<HTMLInputElement>(null);
  const choices = packages.filter((p) => !p.archived || values.packageIds.includes(p.id));
  const picked = choices.filter((p) => selected.includes(p.id));
  const sums = picked.reduce((acc, p) => ({ setup: acc.setup + p.setupFee, monthly: acc.monthly + p.monthlyFee }), {
    setup: 0,
    monthly: 0,
  });

  return (
    <form className={ui.form} {...formProps} noValidate>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className={ui.fieldGrid}>
        <Field id="pj-client" label="고객명" errors={errors("clientName")}>
          {(p) => (
            <input
              {...p}
              name="clientName"
              className={ui.input}
              defaultValue={values.clientName}
              maxLength={60}
              placeholder="예: (주)한국기업"
            />
          )}
        </Field>
        <Field id="pj-industry" label="업종" errors={errors("industry")}>
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
        <Field id="pj-assignee" label="담당자" optional errors={errors("assignee")}>
          {(p) => (
            <input
              {...p}
              name="assignee"
              className={ui.input}
              defaultValue={values.assignee}
              maxLength={30}
              placeholder="미배정"
            />
          )}
        </Field>
      </div>

      <div className={ui.fieldGrid}>
        <Field id="pj-stage" label="현재 역 (단계)" errors={errors("stage")}>
          {(p) => (
            <select
              {...p}
              name="stage"
              className={ui.select}
              defaultValue={values.stage}
              onChange={(e) => {
                if (!editing) setProgress(STAGE_ARRIVAL_PROGRESS[e.target.value as Stage]);
              }}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABEL[s]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="pj-progress" label={`진행률 ${progress}%`} errors={errors("progress")}>
          {(p) => (
            <input
              {...p}
              name="progress"
              type="range"
              min={0}
              max={100}
              step={5}
              className={styles.range}
              value={progress}
              aria-valuetext={`${progress}%`}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          )}
        </Field>
        <Field id="pj-start" label="시작일" optional errors={errors("startDate")}>
          {(p) => (
            <input {...p} name="startDate" type="date" className={ui.input} defaultValue={values.startDate ?? ""} />
          )}
        </Field>
        <Field id="pj-due" label="마감일" optional errors={errors("dueDate")}>
          {(p) => <input {...p} name="dueDate" type="date" className={ui.input} defaultValue={values.dueDate ?? ""} />}
        </Field>
      </div>

      <fieldset className={styles.packages}>
        <legend className={ui.label}>자동화 패키지</legend>
        <div className={styles.packageGrid}>
          {choices.map((pkg) => (
            <label key={pkg.id} className={ui.checkRow}>
              <input
                type="checkbox"
                name="packageIds"
                value={pkg.id}
                checked={selected.includes(pkg.id)}
                onChange={(e) =>
                  setSelected((s) => (e.target.checked ? [...s, pkg.id] : s.filter((id) => id !== pkg.id)))
                }
              />
              <span>
                {pkg.name}
                <span className={ui.sub}>
                  구축 {formatKrw(pkg.setupFee)} · 월 {formatKrw(pkg.monthlyFee)}
                </span>
              </span>
            </label>
          ))}
        </div>
        {errors("packageIds") ? <p className={ui.error}>{errors("packageIds")?.[0]}</p> : null}
      </fieldset>

      <div className={ui.fieldGrid}>
        <Field id="pj-setup" label="구축비 (원)" errors={errors("setupFee")}>
          {(p) => (
            <input
              {...p}
              ref={setupRef}
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
        <Field
          id="pj-monthly"
          label="월 유지보수비 (원)"
          errors={errors("monthlyFee")}
          hint="유지보수가 운행 중일 때 월 정기 수익에 들어가요."
        >
          {(p) => (
            <input
              {...p}
              ref={monthlyRef}
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
        <div className={styles.sumBox}>
          <button
            type="button"
            className={`${ui.btn} ${ui.secondary} ${ui.small}`}
            disabled={picked.length === 0}
            onClick={() => {
              if (setupRef.current) setupRef.current.value = String(sums.setup);
              if (monthlyRef.current) monthlyRef.current.value = String(sums.monthly);
            }}
          >
            <Calculator size={15} aria-hidden="true" />
            패키지 합계로 채우기
          </button>
          <span className={ui.hint}>
            선택 {picked.length}개 · 구축 {formatKrw(sums.setup)} · 월 {formatKrw(sums.monthly)}
          </span>
        </div>
      </div>

      <div className={ui.fieldGrid}>
        <Field id="pj-maint" label="유지보수 상태" errors={errors("maintenanceStatus")}>
          {(p) => (
            <select {...p} name="maintenanceStatus" className={ui.select} defaultValue={values.maintenanceStatus}>
              {MAINTENANCE_STATUSES.map((m) => (
                <option key={m} value={m}>
                  {MAINTENANCE_LABEL[m]}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field
          id="pj-maint-start"
          label="유지보수 시작일"
          optional
          errors={errors("maintenanceStartedOn")}
          hint="비워 두면 운행을 시작한 날로 기록해요."
        >
          {(p) => (
            <input
              {...p}
              name="maintenanceStartedOn"
              type="date"
              className={ui.input}
              defaultValue={values.maintenanceStartedOn ?? ""}
            />
          )}
        </Field>
      </div>

      <Field id="pj-notes" label="메모" optional errors={errors("notes")}>
        {(p) => <textarea {...p} name="notes" className={ui.textarea} defaultValue={values.notes} maxLength={1000} />}
      </Field>

      <div className={ui.formFoot}>
        <SubmitButton pending={pending} pendingLabel="저장 중…" icon={<Save size={16} aria-hidden="true" />}>
          {editing ? "변경 내용 저장" : "프로젝트 만들기"}
        </SubmitButton>
        <ActionNotice state={state} />
      </div>
    </form>
  );
}
