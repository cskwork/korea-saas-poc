"use client";

import { useEffect, useState } from "react";
import type { ActionState } from "@/core/actions";
import {
  CONTENT_KINDS,
  INDUSTRIES,
  KIND_LABEL,
  LENGTHS,
  LENGTH_LABEL,
  LENGTH_TARGET,
  TONES,
  TONE_LABEL,
  TOPIC_PLACEHOLDER,
  type ContentKind,
  type Length,
  type Tone,
} from "../../domain/content";
import { buttonClass } from "../ui/buttons";
import { Field, Segmented, describedBy } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import ui from "../ui/ui.module.css";
import { useActionForm } from "../ui/useActionForm";
import styles from "./orders.module.css";

export interface OrderFormValues {
  clientName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  kind: ContentKind;
  topic: string;
  brief: string;
  keywords: string[];
  tone: Tone;
  length: Length;
  dueDate: string;
}

/** The 의뢰서: a new request, or the same form to correct one. */
export function OrderForm({
  action,
  defaults,
  orderId,
  minDate,
  allowedKinds,
  submitLabel,
  onCancel,
  onSaved,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: OrderFormValues;
  orderId?: string;
  minDate?: string;
  allowedKinds: readonly ContentKind[];
  submitLabel: string;
  onCancel?: () => void;
  /** Called once after a successful save (the edit panel closes itself). */
  onSaved?: () => void;
}) {
  const { state, pending, onSubmit, errorFor } = useActionForm(action);
  useEffect(() => {
    if (state.status === "success") onSaved?.();
  }, [state, onSaved]);
  const [kind, setKind] = useState<ContentKind>(defaults.kind);
  const kindBlocked = !allowedKinds.includes(kind);
  const id = (name: string) => `${orderId ?? "new"}-${name}`;

  return (
    <form className={styles.slip} onSubmit={onSubmit} noValidate>
      {orderId ? <input type="hidden" name="orderId" value={orderId} /> : null}

      <div className={styles.slipSection}>
        <h2 className={styles.slipTitle}>고객</h2>
        <div className={ui.fieldRow}>
          <Field id={id("client")} label="상호" error={errorFor("clientName")}>
            <input
              id={id("client")}
              name="clientName"
              className={ui.input}
              defaultValue={defaults.clientName}
              autoComplete="organization"
              aria-invalid={errorFor("clientName") ? true : undefined}
              aria-describedby={describedBy(id("client"), { error: errorFor("clientName") })}
              maxLength={40}
              required
            />
          </Field>
          <Field id={id("industry")} label="업종" error={errorFor("industry")}>
            <select
              id={id("industry")}
              name="industry"
              className={ui.select}
              defaultValue={defaults.industry}
              aria-invalid={errorFor("industry") ? true : undefined}
              aria-describedby={describedBy(id("industry"), { error: errorFor("industry") })}
              required
            >
              <option value="" disabled>
                업종 고르기
              </option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className={ui.fieldRow}>
          <Field id={id("contact")} label="담당자" optional error={errorFor("contactName")}>
            <input
              id={id("contact")}
              name="contactName"
              className={ui.input}
              defaultValue={defaults.contactName}
              autoComplete="name"
              maxLength={30}
              aria-describedby={describedBy(id("contact"), { error: errorFor("contactName") })}
            />
          </Field>
          <Field id={id("email")} label="이메일" optional hint="납품 알림을 받을 주소예요." error={errorFor("contactEmail")}>
            <input
              id={id("email")}
              name="contactEmail"
              type="email"
              inputMode="email"
              className={ui.input}
              defaultValue={defaults.contactEmail}
              autoComplete="email"
              aria-invalid={errorFor("contactEmail") ? true : undefined}
              aria-describedby={describedBy(id("email"), { hint: true, error: errorFor("contactEmail") })}
            />
          </Field>
        </div>
      </div>

      <div className={styles.slipSection}>
        <h2 className={styles.slipTitle}>원고</h2>
        <Segmented
          name="kind"
          legend="콘텐츠 유형"
          options={CONTENT_KINDS}
          value={kind}
          onChange={setKind}
          error={errorFor("kind")}
          renderOption={(k) => (
            <>
              <span className={ui.swatch} data-kind={k} aria-hidden="true" />
              {KIND_LABEL[k]}
            </>
          )}
        />
        {kindBlocked ? <Notice tone="info">지금 요금제에는 {KIND_LABEL[kind]}가 없어요. 요금제를 바꾸면 접수할 수 있어요.</Notice> : null}
        <Field id={id("topic")} label="주제" error={errorFor("topic")} hint="무엇에 대해 쓸지 한 줄로 적어 주세요.">
          <input
            id={id("topic")}
            name="topic"
            className={ui.input}
            defaultValue={defaults.topic}
            placeholder={TOPIC_PLACEHOLDER[kind]}
            maxLength={80}
            aria-invalid={errorFor("topic") ? true : undefined}
            aria-describedby={describedBy(id("topic"), { hint: true, error: errorFor("topic") })}
            required
          />
        </Field>
        <Field id={id("keywords")} label="키워드" optional hint="쉼표로 나눠 주세요. 최대 8개까지 반영해요." error={errorFor("keywords")}>
          <input
            id={id("keywords")}
            name="keywords"
            className={ui.input}
            defaultValue={defaults.keywords.join(", ")}
            placeholder="예: 소금빵, 성수동 빵집"
            aria-describedby={describedBy(id("keywords"), { hint: true, error: errorFor("keywords") })}
          />
        </Field>
        <Field id={id("brief")} label="상세 요청" optional hint="꼭 넣을 내용, 피할 표현, 참고할 링크를 적어 주세요." error={errorFor("brief")}>
          <textarea
            id={id("brief")}
            name="brief"
            className={ui.textarea}
            defaultValue={defaults.brief}
            maxLength={1000}
            rows={4}
            aria-describedby={describedBy(id("brief"), { hint: true, error: errorFor("brief") })}
          />
        </Field>
        <div className={ui.fieldRow}>
          <Segmented
            name="tone"
            legend="말투"
            options={TONES}
            defaultValue={defaults.tone}
            error={errorFor("tone")}
            renderOption={(t) => TONE_LABEL[t]}
          />
          <Segmented
            name="length"
            legend={`분량 (${KIND_LABEL[kind]})`}
            options={LENGTHS}
            defaultValue={defaults.length}
            error={errorFor("length")}
            renderOption={(l) => `${LENGTH_LABEL[l]} · ${LENGTH_TARGET[kind][l].toLocaleString("ko-KR")}자`}
          />
        </div>
      </div>

      <div className={styles.slipSection}>
        <h2 className={styles.slipTitle}>마감</h2>
        <Field id={id("due")} label="마감일" hint="이 날까지 고객에게 납품해요." error={errorFor("dueDate")}>
          <input
            id={id("due")}
            name="dueDate"
            type="date"
            defaultValue={defaults.dueDate}
            min={minDate}
            aria-invalid={errorFor("dueDate") ? true : undefined}
            aria-describedby={describedBy(id("due"), { hint: true, error: errorFor("dueDate") })}
            className={`${ui.input} ${styles.dateInput}`}
            required
          />
        </Field>
      </div>

      <div aria-live="polite">
        {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
        {state.status === "success" && state.message ? <Notice tone="success">{state.message}</Notice> : null}
      </div>
      <div className={styles.submitRow}>
        <button type="submit" className={buttonClass("primary")} disabled={pending || kindBlocked} data-pending={pending}>
          <PendingLabel pending={pending} idle={submitLabel} busy="저장하는 중…" />
        </button>
        {onCancel ? (
          <button type="button" className={buttonClass("secondary")} onClick={onCancel} disabled={pending}>
            닫기
          </button>
        ) : null}
      </div>
    </form>
  );
}
