"use client";

import { RotateCcw } from "lucide-react";
import { TIER_LABEL, type Tier } from "../../domain/tiers";
import { resetDemo, savePlan, savePublication } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { ConfirmAction } from "../ui/ConfirmAction";
import { SelectField, TextAreaField, TextField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useFormSubmit } from "../ui/useFormSubmit";
import styles from "./settings.module.css";

export interface PublicationValues {
  name: string;
  description: string;
  editorName: string;
  sendHour: number;
  revenueGoal: number;
  paidGoal: number;
}

export function PublicationForm({ values }: { values: PublicationValues }) {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(savePublication, { toast: true });
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.form} aria-label="레터 정보">
      <TextField label="레터 이름" name="name" defaultValue={values.name} required maxLength={40} error={fieldError("name")} />
      <TextField
        label="에디터 이름"
        name="editorName"
        defaultValue={values.editorName}
        required
        maxLength={20}
        error={fieldError("editorName")}
        hint="독자 마당에서 에디터로 표시되는 이름이에요."
      />
      <TextAreaField
        label="소개"
        name="description"
        defaultValue={values.description}
        required
        maxLength={200}
        rows={3}
        error={fieldError("description")}
        className={styles.full}
        hint="레터 첫 화면과 구독 안내에 쓰여요."
      />
      <SelectField label="기본 발송 시각" name="sendHour" defaultValue={String(values.sendHour)} error={fieldError("sendHour")}>
        {Array.from({ length: 24 }, (_, hour) => (
          <option key={hour} value={hour}>
            {hour < 12 ? `오전 ${hour === 0 ? 12 : hour}시` : `오후 ${hour === 12 ? 12 : hour - 12}시`}
          </option>
        ))}
      </SelectField>
      <div className={styles.full} id="goals">
        <p className={styles.groupLabel}>목표</p>
        <div className={styles.pair}>
          <TextField
            label="월 수입 목표(원)"
            name="revenueGoal"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            defaultValue={values.revenueGoal}
            required
            error={fieldError("revenueGoal")}
          />
          <TextField
            label="유료 구독자 목표(명)"
            name="paidGoal"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={values.paidGoal}
            required
            error={fieldError("paidGoal")}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={buttonClass("primary")} disabled={pending}>
          {pending ? "저장 중…" : "레터 정보 저장"}
        </button>
        <FormMessage state={state} showSuccess={false} />
      </div>
    </form>
  );
}

export interface PlanValues {
  tier: Tier;
  name: string;
  price: number;
  summary: string;
  perks: string[];
}

export function PlanForm({ plan }: { plan: PlanValues }) {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(savePlan, { toast: true });
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.plan} aria-label={`${TIER_LABEL[plan.tier]} 플랜`}>
      <input type="hidden" name="tier" value={plan.tier} />
      <p className={styles.planTier}>{TIER_LABEL[plan.tier]}</p>
      <TextField label="플랜 이름" name="name" defaultValue={plan.name} required maxLength={20} error={fieldError("name")} />
      <TextField
        label="월 가격(원)"
        name="price"
        type="number"
        inputMode="numeric"
        min={0}
        step={100}
        defaultValue={plan.price}
        readOnly={plan.tier === "free"}
        required
        error={fieldError("price")}
        hint={plan.tier === "free" ? "무료 플랜은 0원으로 고정돼요." : "바꾸면 월 반복 수입과 지난달 추정치가 새 가격으로 다시 계산돼요."}
      />
      <TextField label="한 줄 설명" name="summary" defaultValue={plan.summary} required maxLength={80} error={fieldError("summary")} />
      <TextAreaField
        label="혜택 (한 줄에 하나)"
        name="perks"
        defaultValue={plan.perks.join("\n")}
        rows={5}
        required
        error={fieldError("perks")}
      />
      <div className={styles.actions}>
        <button type="submit" className={buttonClass("secondary")} disabled={pending}>
          {pending ? "저장 중…" : "플랜 저장"}
        </button>
        <FormMessage state={state} showSuccess={false} />
      </div>
    </form>
  );
}

export function ResetDemoButton() {
  return (
    <ConfirmAction
      variant="danger"
      size="md"
      title="샘플 데이터로 되돌릴까요?"
      description="이 편집실에서 쓴 호, 명부, 독자 마당 글, 장부 기록이 모두 지워지고 처음의 샘플 데이터가 다시 채워져요. 다른 방문자의 데이터에는 영향이 없어요."
      confirmLabel="처음 상태로 되돌리기"
      run={() => resetDemo({})}
    >
      <RotateCcw size={16} aria-hidden />
      데모 데이터 초기화
    </ConfirmAction>
  );
}
