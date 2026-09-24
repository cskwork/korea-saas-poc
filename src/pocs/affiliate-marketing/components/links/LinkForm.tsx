"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { CATEGORIES, LINK_STATUSES, LINK_STATUS_HINT, LINK_STATUS_LABEL, type CommissionType, type LinkStatus } from "../../domain/catalog";
import { rateInputValue } from "../../domain/commission";
import { createLinkAction, updateLinkAction } from "../../server/actions";
import { ActionNotice, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { useActionForm } from "../ui/useActionForm";

export interface ProgramChoice {
  id: string;
  name: string;
  model: "cps" | "cpa" | "cpc";
  defaultRateBp: number;
  defaultFixedWon: number;
}

export interface LinkFormValues {
  id?: string;
  productName: string;
  programId: string | null;
  category: string;
  destinationUrl: string;
  priceWon: number | null;
  commissionType: CommissionType;
  commissionRateBp: number;
  commissionFixedWon: number;
  memo: string;
  status?: LinkStatus;
}

/** Create or edit a link. Choosing a program fills in its default commission terms. */
export function LinkForm({ programs, initial }: { programs: ProgramChoice[]; initial?: LinkFormValues }) {
  const editing = Boolean(initial?.id);
  const { state, pending, onSubmit, errors } = useActionForm(editing ? updateLinkAction : createLinkAction);
  const first = programs[0];
  const [type, setType] = useState<CommissionType>(initial?.commissionType ?? (first?.model === "cpa" ? "fixed" : "percent"));
  const [rate, setRate] = useState(rateInputValue(initial?.commissionRateBp ?? first?.defaultRateBp ?? 300));
  const [fixed, setFixed] = useState(String(initial?.commissionFixedWon ?? first?.defaultFixedWon ?? 0));

  function onProgram(id: string) {
    const program = programs.find((p) => p.id === id);
    if (!program || editing) return;
    if (program.model === "cpa") {
      setType("fixed");
      setFixed(String(program.defaultFixedWon));
    } else {
      setType("percent");
      setRate(rateInputValue(program.defaultRateBp));
    }
  }

  return (
    <form onSubmit={onSubmit} className={formStyles.form} noValidate>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Field label="상품명" error={errors.productName}>
        <input name="productName" defaultValue={initial?.productName} placeholder="예: 삼성 갤럭시 버즈3 프로" maxLength={80} required autoComplete="off" />
      </Field>
      <Field
        label="이동할 제휴 링크"
        hint="제휴 프로그램에서 받은 링크 전체를 붙여 넣으세요. 방문자는 이 주소로 이동해요."
        error={errors.destinationUrl}
      >
        <input name="destinationUrl" type="url" inputMode="url" defaultValue={initial?.destinationUrl} placeholder="https://link.coupang.com/a/…" required autoComplete="off" />
      </Field>
      <div className={formStyles.grid3}>
        <Field label="제휴 프로그램" error={errors.programId}>
          <select name="programId" defaultValue={initial?.programId ?? first?.id ?? ""} onChange={(event) => onProgram(event.target.value)}>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="">프로그램 미지정</option>
          </select>
        </Field>
        <Field label="카테고리" error={errors.category}>
          <select name="category" defaultValue={initial?.category ?? CATEGORIES[0]}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="상품 가격" optional unit="원" hint="콘텐츠 초안에 쓰여요." error={errors.priceWon}>
          <input name="priceWon" inputMode="numeric" defaultValue={initial?.priceWon ?? ""} placeholder="219,000" autoComplete="off" />
        </Field>
      </div>

      <fieldset className={formStyles.fieldset}>
        <legend className={formStyles.label}>수수료 방식</legend>
        <div className={formStyles.segmented}>
          <label className={formStyles.segment}>
            <input type="radio" name="commissionType" value="percent" checked={type === "percent"} onChange={() => setType("percent")} />
            판매가의 %
          </label>
          <label className={formStyles.segment}>
            <input type="radio" name="commissionType" value="fixed" checked={type === "fixed"} onChange={() => setType("fixed")} />
            건당 고정 금액
          </label>
        </div>
      </fieldset>
      <div className={formStyles.grid2}>
        {type === "percent" ? (
          <Field label="수수료율" unit="%" hint="주문 금액 × 수수료율, 원 단위 절사로 계산해요." error={errors.commissionRate}>
            <input name="commissionRate" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} autoComplete="off" />
          </Field>
        ) : (
          <Field label="건당 수수료" unit="원" hint="판매(신청) 1건마다 받는 금액이에요." error={errors.commissionFixed}>
            <input name="commissionFixed" inputMode="numeric" value={fixed} onChange={(event) => setFixed(event.target.value)} autoComplete="off" />
          </Field>
        )}
        {editing ? (
          <Field label="상태" hint={initial?.status ? LINK_STATUS_HINT[initial.status] : undefined} error={errors.status}>
            <select name="status" defaultValue={initial?.status ?? "active"}>
              {LINK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LINK_STATUS_LABEL[s]} — {LINK_STATUS_HINT[s]}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="짧은 코드" optional hint="비워 두면 6자리 코드를 만들어요. 영문 소문자·숫자·하이픈 3~24자." error={errors.code}>
            <input name="code" placeholder="예: buds3-review" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={24} />
          </Field>
        )}
      </div>
      <Field label="메모" optional error={errors.memo}>
        <input name="memo" defaultValue={initial?.memo} placeholder="어느 글에 붙였는지, 캠페인 조건 등" maxLength={200} autoComplete="off" />
      </Field>
      <div className={formStyles.actions}>
        <SubmitButton pending={pending} pendingLabel={editing ? "저장 중…" : "등록 중…"} icon={editing ? <Check aria-hidden /> : <Plus aria-hidden />}>
          {editing ? "변경 내용 저장" : "링크 등록"}
        </SubmitButton>
      </div>
      <ActionNotice state={state} />
    </form>
  );
}
