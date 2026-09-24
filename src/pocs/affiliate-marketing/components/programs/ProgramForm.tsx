"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { COMMISSION_MODELS, COMMISSION_MODEL_LABEL, type CommissionModel } from "../../domain/catalog";
import { rateInputValue } from "../../domain/commission";
import { createProgramAction, deleteProgramAction, updateProgramAction } from "../../server/actions";
import type { ProgramRow } from "../../server/programs";
import { ActionNotice, ConfirmAction, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { useActionForm } from "../ui/useActionForm";

/** Program terms (reference notes) — create or edit. */
export function ProgramForm({ program }: { program?: ProgramRow }) {
  const { state, pending, onSubmit, errors } = useActionForm(program ? updateProgramAction : createProgramAction);
  const [model, setModel] = useState<CommissionModel>(program?.model ?? "cps");

  return (
    <form onSubmit={onSubmit} className={formStyles.form} noValidate>
      {program ? <input type="hidden" name="id" value={program.id} /> : null}
      <div className={formStyles.grid2}>
        <Field label="프로그램 이름" error={errors.name}>
          <input name="name" defaultValue={program?.name} placeholder="예: 알리익스프레스 어필리에이트" maxLength={40} autoComplete="off" required />
        </Field>
        <Field label="수수료 구조" error={errors.model}>
          <select name="model" value={model} onChange={(event) => setModel(event.target.value as CommissionModel)}>
            {COMMISSION_MODELS.map((m) => (
              <option key={m} value={m}>
                {COMMISSION_MODEL_LABEL[m]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className={formStyles.grid2}>
        {model === "cps" ? (
          <Field label="기본 수수료율" unit="%" hint="새 링크를 만들 때 기본값으로 채워져요." error={errors.defaultRate}>
            <input name="defaultRate" inputMode="decimal" defaultValue={program ? rateInputValue(program.defaultRateBp) : "3"} autoComplete="off" />
          </Field>
        ) : model === "cpa" ? (
          <Field label="기본 건당 수수료" unit="원" hint="새 링크를 만들 때 기본값으로 채워져요." error={errors.defaultFixed}>
            <input name="defaultFixed" inputMode="numeric" defaultValue={program?.defaultFixedWon ?? 3000} autoComplete="off" />
          </Field>
        ) : (
          <p className={formStyles.hint}>CPC 프로그램은 링크 수수료가 없어요. 수익은 판매 기록에서 &lsquo;수수료 직접 입력&rsquo;으로 남기세요.</p>
        )}
        <Field label="최소 지급액" optional unit="원" error={errors.minPayout}>
          <input name="minPayout" inputMode="numeric" defaultValue={program?.minPayoutWon ?? ""} placeholder="10,000" autoComplete="off" />
        </Field>
      </div>
      <div className={formStyles.grid2}>
        <Field label="정산 주기" optional error={errors.settlementCycle}>
          <input name="settlementCycle" defaultValue={program?.settlementCycle} placeholder="예: 월 1회" maxLength={60} autoComplete="off" />
        </Field>
        <Field label="쿠키 기간" optional error={errors.cookieWindow}>
          <input name="cookieWindow" defaultValue={program?.cookieWindow} placeholder="예: 24시간" maxLength={40} autoComplete="off" />
        </Field>
      </div>
      <div className={formStyles.grid2}>
        <Field label="잘 맞는 채널" optional error={errors.bestChannels}>
          <input name="bestChannels" defaultValue={program?.bestChannels} placeholder="예: 블로그, 유튜브" maxLength={80} autoComplete="off" />
        </Field>
        <Field label="잘 맞는 카테고리" optional error={errors.bestCategories}>
          <input name="bestCategories" defaultValue={program?.bestCategories} placeholder="예: 전자기기, 생활용품" maxLength={80} autoComplete="off" />
        </Field>
      </div>
      <Field label="메모" optional error={errors.notes}>
        <textarea name="notes" defaultValue={program?.notes} rows={3} maxLength={300} placeholder="장단점, 승인 조건 등" />
      </Field>
      <div className={formStyles.actions}>
        <SubmitButton pending={pending} pendingLabel="저장 중…" icon={program ? <Check aria-hidden /> : <Plus aria-hidden />}>
          {program ? "변경 내용 저장" : "프로그램 추가"}
        </SubmitButton>
      </div>
      <ActionNotice state={state} />
    </form>
  );
}

export function DeleteProgram({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmAction
      small={false}
      label={
        <>
          <Trash2 aria-hidden />
          프로그램 삭제
        </>
      }
      question={`'${name}'을(를) 삭제할까요?`}
      confirmLabel="삭제"
      onConfirm={() => deleteProgramAction({ id })}
    />
  );
}
