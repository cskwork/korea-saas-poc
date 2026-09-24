"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { savePortfolioItem } from "../../server/actions";
import { Field } from "../ui/Field";
import { FormMessage } from "../ui/FormMessage";
import { SubmitButton } from "../ui/SubmitButton";
import { useOnSuccess } from "../ui/useOnSuccess";
import ui from "../ui/ui.module.css";

export interface PortfolioDraft {
  id?: string;
  projectId: string | null;
  title: string;
  summary: string;
  role: string;
  outcome: string;
  stack: string[];
  url: string;
  period: string;
  published: boolean;
}

export const EMPTY_PORTFOLIO: PortfolioDraft = { projectId: null, title: "", summary: "", role: "", outcome: "", stack: [], url: "", period: "", published: true };

/** One portfolio entry: what was built, the stack, the developer's role and the outcome. */
export function PortfolioForm({
  item = EMPTY_PORTFOLIO,
  projects,
  onDone,
}: {
  item?: PortfolioDraft;
  projects: { id: string; title: string }[];
  onDone?: () => void;
}) {
  const [state, formAction] = useActionState(savePortfolioItem, idleState);
  const uid = useId();
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  useOnSuccess(state, onDone);
  return (
    <form action={formAction} className={ui.region} noValidate>
      {item.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className={ui.formGrid}>
        <Field id={`${uid}-title`} label="프로젝트명" errors={errors?.title} className={ui.span2}>
          {(a11y) => <input {...a11y} name="title" className={ui.input} defaultValue={item.title} maxLength={80} required />}
        </Field>
        <Field id={`${uid}-period`} label="기간" hint="예: 3개월, 2026.03 – 05" errors={errors?.period}>
          {(a11y) => <input {...a11y} name="period" className={ui.input} defaultValue={item.period} maxLength={40} />}
        </Field>
        <Field id={`${uid}-role`} label="맡은 역할" errors={errors?.role}>
          {(a11y) => <input {...a11y} name="role" className={ui.input} defaultValue={item.role} maxLength={80} placeholder="풀스택 (1인)" />}
        </Field>
        <Field id={`${uid}-stack`} label="기술 스택" hint="쉼표로 구분" errors={errors?.stack} className={ui.span2}>
          {(a11y) => <input {...a11y} name="stack" className={ui.input} defaultValue={item.stack.join(", ")} placeholder="Next.js, TypeScript, PostgreSQL" />}
        </Field>
        <Field id={`${uid}-summary`} label="무엇을 만들었나" errors={errors?.summary} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="summary" className={ui.textarea} defaultValue={item.summary} maxLength={600} rows={3} />}
        </Field>
        <Field id={`${uid}-outcome`} label="결과" hint="고객에게 무엇이 달라졌는지. 확인한 사실만 적어요." errors={errors?.outcome} className={ui.span2}>
          {(a11y) => <textarea {...a11y} name="outcome" className={ui.textarea} defaultValue={item.outcome} maxLength={300} rows={2} />}
        </Field>
        <Field id={`${uid}-url`} label="링크" errors={errors?.url}>
          {(a11y) => <input {...a11y} name="url" type="url" className={ui.input} defaultValue={item.url} placeholder="https://" maxLength={300} />}
        </Field>
        <Field id={`${uid}-project`} label="연결한 프로젝트" errors={errors?.projectId}>
          {(a11y) => (
            <select {...a11y} name="projectId" className={ui.select} defaultValue={item.projectId ?? ""}>
              <option value="">연결 안 함</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </Field>
        <label className={`${ui.check} ${ui.span2}`}>
          <input type="checkbox" name="published" defaultChecked={item.published} />
          공개 페이지에 보이기
        </label>
      </div>
      <div className={ui.formActions}>
        <SubmitButton>{item.id ? "저장" : "포트폴리오에 추가"}</SubmitButton>
        {onDone && item.id ? (
          <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={onDone}>
            취소
          </button>
        ) : null}
        <FormMessage state={state} />
      </div>
    </form>
  );
}
