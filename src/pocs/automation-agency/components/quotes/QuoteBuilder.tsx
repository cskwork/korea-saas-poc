"use client";

import { useState } from "react";
import { PenLine, Plus, Save, Trash2 } from "lucide-react";
import clsx from "clsx";
import { formatKrw } from "@/core/format";
import type { Complexity } from "../../db/schema";
import { COMPLEXITIES, COMPLEXITY_LABEL } from "../../domain/labels";
import { adjustedUnit, quoteTotals } from "../../domain/quote";
import { createQuoteAction, updateQuoteAction } from "../../server/actions";
import { Field } from "../ui/Field";
import { ActionNotice } from "../ui/Notice";
import { SubmitButton } from "../ui/SubmitButton";
import { useActionForm } from "../ui/useActionForm";
import ui from "../ui/ui.module.css";
import styles from "./quotes.module.css";

export interface DraftLine {
  key: string;
  packageId: string | null;
  name: string;
  complexity: Complexity;
  quantity: number;
  unitSetupFee: number;
  unitMonthlyFee: number;
}

export interface QuoteDraft {
  id?: string;
  clientName: string;
  contactName: string;
  issuedOn: string;
  validDays: number;
  notes: string;
  diagnosisId?: string;
  lines: DraftLine[];
}

export interface CatalogueItem {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
}

const toInt = (value: string) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Quote editor: client details, line items with complexity, live VAT totals. */
export function QuoteBuilder({ draft, catalogue }: { draft: QuoteDraft; catalogue: CatalogueItem[] }) {
  const editing = Boolean(draft.id);
  const { state, pending, errors, formProps } = useActionForm(editing ? updateQuoteAction : createQuoteAction);
  const [lines, setLines] = useState<DraftLine[]>(draft.lines);
  const [pick, setPick] = useState("");
  const totals = quoteTotals(lines);

  const update = (key: string, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const addPackage = () => {
    const pkg = catalogue.find((p) => p.id === pick);
    if (!pkg) return;
    setLines((ls) => [
      ...ls,
      {
        key: crypto.randomUUID(),
        packageId: pkg.id,
        name: pkg.name,
        complexity: "normal",
        quantity: 1,
        unitSetupFee: pkg.setupFee,
        unitMonthlyFee: pkg.monthlyFee,
      },
    ]);
    setPick("");
  };

  const addCustom = () =>
    setLines((ls) => [
      ...ls,
      {
        key: crypto.randomUUID(),
        packageId: null,
        name: "",
        complexity: "normal",
        quantity: 1,
        unitSetupFee: 0,
        unitMonthlyFee: 0,
      },
    ]);

  const payload = JSON.stringify(lines.map(({ key: _key, ...line }) => line));
  const lineErrors = errors("lines");

  return (
    <form className={styles.builder} {...formProps} noValidate>
      {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
      {draft.diagnosisId ? <input type="hidden" name="diagnosisId" value={draft.diagnosisId} /> : null}
      <input type="hidden" name="lines" value={payload} />

      <div className={styles.builderMain}>
        <section aria-labelledby="qb-client" className={styles.block}>
          <h2 id="qb-client" className={styles.blockTitle}>
            수신
          </h2>
          <div className={ui.fieldGrid}>
            <Field id="qb-clientName" label="고객명 / 회사명" errors={errors("clientName")}>
              {(p) => (
                <input
                  {...p}
                  name="clientName"
                  className={ui.input}
                  defaultValue={draft.clientName}
                  maxLength={60}
                  placeholder="예: (주)한국기업"
                />
              )}
            </Field>
            <Field id="qb-contact" label="담당자" optional errors={errors("contactName")}>
              {(p) => (
                <input {...p} name="contactName" className={ui.input} defaultValue={draft.contactName} maxLength={30} />
              )}
            </Field>
            <Field id="qb-issued" label="발행일" errors={errors("issuedOn")}>
              {(p) => <input {...p} name="issuedOn" type="date" className={ui.input} defaultValue={draft.issuedOn} />}
            </Field>
            <Field id="qb-valid" label="유효기간 (일)" errors={errors("validDays")}>
              {(p) => (
                <input
                  {...p}
                  name="validDays"
                  type="number"
                  min={7}
                  max={90}
                  inputMode="numeric"
                  className={ui.input}
                  defaultValue={draft.validDays}
                />
              )}
            </Field>
          </div>
        </section>

        <section aria-labelledby="qb-lines" className={styles.block}>
          <h2 id="qb-lines" className={styles.blockTitle}>
            견적 항목
          </h2>
          <div className={styles.adders}>
            <label htmlFor="qb-pick" className={ui.srOnly}>
              카탈로그 패키지
            </label>
            <select id="qb-pick" className={ui.select} value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">카탈로그에서 패키지 고르기</option>
              {catalogue.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · 구축 {formatKrw(p.setupFee)} · 월 {formatKrw(p.monthlyFee)}
                </option>
              ))}
            </select>
            <button type="button" className={clsx(ui.btn, ui.secondary)} onClick={addPackage} disabled={!pick}>
              <Plus size={16} aria-hidden="true" />
              담기
            </button>
            <button type="button" className={clsx(ui.btn, ui.ghost)} onClick={addCustom}>
              <PenLine size={16} aria-hidden="true" />
              직접 입력 항목
            </button>
          </div>

          {lines.length === 0 ? (
            <p className={styles.noLines}>
              아직 담은 항목이 없어요. 카탈로그 패키지를 고르거나 직접 입력 항목을 추가하세요.
            </p>
          ) : (
            <ol className={styles.lines}>
              {lines.map((line, index) => {
                const setup = adjustedUnit(line.unitSetupFee, line.complexity) * line.quantity;
                const monthly = adjustedUnit(line.unitMonthlyFee, line.complexity) * line.quantity;
                const n = index + 1;
                return (
                  <li key={line.key} className={styles.line}>
                    <span className={styles.lineNo} aria-hidden="true">
                      {n}
                    </span>
                    <div className={clsx(ui.field, styles.lineName)}>
                      <label htmlFor={`ql-name-${line.key}`} className={ui.label}>
                        항목명
                      </label>
                      <input
                        id={`ql-name-${line.key}`}
                        className={ui.input}
                        value={line.name}
                        maxLength={80}
                        placeholder="예: 카카오 알림톡 연동"
                        aria-invalid={line.name.trim() === "" || undefined}
                        onChange={(e) => update(line.key, { name: e.target.value })}
                      />
                    </div>
                    <div className={ui.field}>
                      <label htmlFor={`ql-cx-${line.key}`} className={ui.label}>
                        복잡도
                      </label>
                      <select
                        id={`ql-cx-${line.key}`}
                        className={ui.select}
                        value={line.complexity}
                        onChange={(e) => update(line.key, { complexity: e.target.value as Complexity })}
                      >
                        {COMPLEXITIES.map((c) => (
                          <option key={c} value={c}>
                            {COMPLEXITY_LABEL[c]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={ui.field}>
                      <label htmlFor={`ql-qty-${line.key}`} className={ui.label}>
                        수량
                      </label>
                      <input
                        id={`ql-qty-${line.key}`}
                        type="number"
                        min={1}
                        max={99}
                        inputMode="numeric"
                        className={ui.input}
                        value={line.quantity}
                        onChange={(e) =>
                          update(line.key, { quantity: Math.min(99, Math.max(1, toInt(e.target.value))) })
                        }
                      />
                    </div>
                    <div className={ui.field}>
                      <label htmlFor={`ql-setup-${line.key}`} className={ui.label}>
                        구축 단가
                      </label>
                      <input
                        id={`ql-setup-${line.key}`}
                        type="number"
                        min={0}
                        step={10000}
                        inputMode="numeric"
                        className={ui.input}
                        value={line.unitSetupFee}
                        onChange={(e) => update(line.key, { unitSetupFee: toInt(e.target.value) })}
                      />
                    </div>
                    <div className={ui.field}>
                      <label htmlFor={`ql-monthly-${line.key}`} className={ui.label}>
                        월 단가
                      </label>
                      <input
                        id={`ql-monthly-${line.key}`}
                        type="number"
                        min={0}
                        step={10000}
                        inputMode="numeric"
                        className={ui.input}
                        value={line.unitMonthlyFee}
                        onChange={(e) => update(line.key, { unitMonthlyFee: toInt(e.target.value) })}
                      />
                    </div>
                    <p className={styles.lineTotal}>
                      <span>구축 {formatKrw(setup)}</span>
                      <span>월 {formatKrw(monthly)}</span>
                    </p>
                    <button
                      type="button"
                      className={clsx(ui.btn, ui.ghost, ui.iconOnly, styles.lineRemove)}
                      onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                      aria-label={`${n}번 항목 ${line.name || ""} 빼기`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {lineErrors ? (
            <p className={ui.error} role="alert">
              {lineErrors[0]}
            </p>
          ) : null}
          <p className={ui.hint}>
            복잡도에 따라 단가가 달라져요: 단순 0.7배, 보통 1배, 복잡 1.5배 (천 원 단위 반올림).
          </p>
        </section>

        <section aria-labelledby="qb-notes" className={styles.block}>
          <Field id="qb-notes" label="비고" optional errors={errors("notes")}>
            {(p) => (
              <textarea
                {...p}
                name="notes"
                className={ui.textarea}
                defaultValue={draft.notes}
                maxLength={1000}
                placeholder="범위, 전제 조건, 지급 조건 등"
              />
            )}
          </Field>
        </section>
      </div>

      <aside className={styles.summary} aria-labelledby="qb-total">
        <h2 id="qb-total" className={styles.blockTitle}>
          합계
        </h2>
        <dl className={styles.totals}>
          <div className={styles.totalHead}>
            <dt>구축비 (1회)</dt>
          </div>
          <div>
            <dt>공급가액</dt>
            <dd>{formatKrw(totals.setup.supply)}</dd>
          </div>
          <div>
            <dt>부가세 10%</dt>
            <dd>{formatKrw(totals.setup.vat)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>합계</dt>
            <dd>{formatKrw(totals.setup.total)}</dd>
          </div>
          <div className={styles.totalHead}>
            <dt>월 유지보수</dt>
          </div>
          <div>
            <dt>공급가액</dt>
            <dd>{formatKrw(totals.monthly.supply)}</dd>
          </div>
          <div>
            <dt>부가세 10%</dt>
            <dd>{formatKrw(totals.monthly.vat)}</dd>
          </div>
          <div className={styles.totalRow}>
            <dt>월 합계</dt>
            <dd>{formatKrw(totals.monthly.total)}</dd>
          </div>
          <div className={styles.grandRow}>
            <dt>첫해 총액 (구축 + 12개월)</dt>
            <dd>{formatKrw(totals.firstYearTotal)}</dd>
          </div>
        </dl>
        <div className={styles.summaryActions}>
          <SubmitButton pending={pending} pendingLabel="저장 중…" icon={<Save size={16} aria-hidden="true" />}>
            {editing ? "견적서 저장" : "견적서 만들기"}
          </SubmitButton>
          <ActionNotice state={state} />
        </div>
      </aside>
    </form>
  );
}
