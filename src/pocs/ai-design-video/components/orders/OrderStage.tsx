"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { ArrowRight, Check, PenLine, RotateCcw } from "lucide-react";
import type { ActionState } from "@/core/actions";
import { formatKrw } from "@/core/format";
import { ORDER_STATUSES, ORDER_TYPE_INFO, STATUS_INFO, type OrderStatus, type OrderType } from "../../domain/catalog";
import { availableTransitions, revisionAllowance } from "../../domain/workflow";
import { requestRevisionAction, transitionOrderAction } from "../../server/actions";
import { InkFrame } from "../frame/InkFrame";
import { Field } from "../ui/Field";
import { FormStatus } from "../ui/FormStatus";
import { controlProps, useFormAction } from "../ui/useFormAction";
import ui from "../ui.module.css";
import styles from "./order-detail.module.css";

interface OrderStageProps {
  orderId: string;
  type: OrderType;
  status: OrderStatus;
  headline: string;
  price: number;
  revisionLimit: number | null;
  revisionsUsed: number;
  /** Server-rendered history shown under the moves. */
  children?: ReactNode;
}

/**
 * The order's frame and its scene strip, with the moves available from here.
 * A move inks the frame immediately (optimistic) while the server records it.
 */
export function OrderStage({
  orderId,
  type,
  status,
  headline,
  price,
  revisionLimit,
  revisionsUsed,
  children,
}: OrderStageProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState<unknown>>({ status: "idle" });
  const [revisionOpen, setRevisionOpen] = useState(false);
  const info = ORDER_TYPE_INFO[type];
  const current = STATUS_INFO[optimisticStatus];
  const transitions = availableTransitions(optimisticStatus);

  const move = (to: OrderStatus) =>
    startTransition(async () => {
      setOptimisticStatus(to);
      setResult(await transitionOrderAction({ orderId, to }));
    });

  const tall = info.frame.ratio[1] > info.frame.ratio[0];

  return (
    <div className={styles.stage}>
      <div className={styles.stageFrame}>
        <InkFrame
          type={type}
          medium={current.medium}
          height={tall ? 300 : 230}
          maxWidth={440}
          headline={headline}
          label={`${info.label} ${info.frame.aspect} 프레임, ${current.label} 단계`}
        />
        <p className={styles.frameCaption}>
          {info.frame.aspect} · {info.frame.size}
        </p>
      </div>

      <div className={styles.stageSide}>
        <ol className={styles.scenes} role="list" aria-label="작업 단계">
          {ORDER_STATUSES.map((s) => {
            const scene = STATUS_INFO[s];
            const state = s === optimisticStatus ? "current" : scene.scene < current.scene ? "done" : "todo";
            return (
              <li
                key={s}
                className={styles.sceneStep}
                data-state={state}
                data-medium={scene.medium}
                aria-current={state === "current" ? "step" : undefined}
              >
                <span className={styles.sceneNo}>
                  S#{scene.scene}
                  {state === "done" && <Check size={14} strokeWidth={2.5} aria-label="완료" />}
                </span>
                <span className={styles.sceneLabel}>{scene.label}</span>
              </li>
            );
          })}
        </ol>
        <p className={styles.stageHint}>{current.hint}</p>

        <div className={styles.moves}>
          {transitions.map((t) =>
            t.kind === "request-revision" ? (
              <button
                key={t.kind}
                type="button"
                className={[ui.button, ui.secondary].join(" ")}
                aria-expanded={revisionOpen}
                aria-controls="revision-form"
                onClick={() => setRevisionOpen((open) => !open)}
                disabled={pending}
              >
                <PenLine size={16} aria-hidden="true" />
                {t.label}
              </button>
            ) : (
              <button
                key={t.kind}
                type="button"
                className={[ui.button, t.kind === "reopen" ? ui.secondary : ""].join(" ")}
                onClick={() => move(t.to)}
                disabled={pending}
                aria-busy={pending}
              >
                {t.kind === "reopen" ? <RotateCcw size={16} aria-hidden="true" /> : null}
                {t.label}
                {t.kind !== "reopen" && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            ),
          )}
        </div>
        <FormStatus state={result} />

        {revisionOpen && optimisticStatus === "drafting" && (
          <RevisionForm
            orderId={orderId}
            price={price}
            revisionLimit={revisionLimit}
            revisionsUsed={revisionsUsed}
            onClose={() => setRevisionOpen(false)}
            onRecorded={(recorded) => {
              setRevisionOpen(false);
              setResult(recorded);
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
}

interface RevisionFormProps {
  orderId: string;
  price: number;
  revisionLimit: number | null;
  revisionsUsed: number;
  onClose: () => void;
  onRecorded: (state: ActionState) => void;
}

function RevisionForm({ orderId, price, revisionLimit, revisionsUsed, onClose, onRecorded }: RevisionFormProps) {
  const { state, pending, onSubmit, fieldError } = useFormAction(async (prev: ActionState, formData: FormData) => {
    const next = await requestRevisionAction(prev, formData);
    if (next.status === "success") onRecorded(next);
    return next;
  });
  const { remaining, nextIsExtra } = revisionAllowance(revisionLimit, revisionsUsed);
  const round = revisionsUsed + 1;
  const suggestedFee = Math.round((price * 0.2) / 1000) * 1000;

  return (
    <form id="revision-form" className={styles.revisionForm} onSubmit={onSubmit}>
      <input type="hidden" name="orderId" value={orderId} />
      <p className={styles.revisionTitle}>
        수정 {round}차 기록
        <span className={nextIsExtra ? styles.revisionExtra : styles.revisionLeft}>
          {remaining === null ? "수정 무제한 플랜" : nextIsExtra ? "포함 횟수 초과" : `포함 수정 ${remaining}회 남음`}
        </span>
      </p>
      <Field id="revision-note" label="고객이 요청한 수정 내용" error={fieldError("note")}>
        <textarea
          {...controlProps("revision-note", fieldError("note"))}
          className={ui.input}
          name="note"
          rows={3}
          required
          minLength={2}
          maxLength={500}
          placeholder="예: 제목 글자를 더 크게, 배경을 브랜드 컬러로"
        />
      </Field>
      {nextIsExtra && (
        <div className={styles.extra}>
          <label className={ui.check}>
            <input type="checkbox" name="extraConfirmed" required />
            <span>포함된 수정 {revisionLimit}회를 넘겨 추가 수정으로 기록해요. 추가 비용을 고객과 합의했어요.</span>
          </label>
          <Field
            id="revision-fee"
            label="추가 비용 (원)"
            error={fieldError("extraFee")}
            hint={`작업 금액 ${formatKrw(price)}의 20%를 기본으로 넣었어요.`}
          >
            <input
              {...controlProps("revision-fee", fieldError("extraFee"), true)}
              className={ui.input}
              type="number"
              name="extraFee"
              min={0}
              step={1000}
              defaultValue={suggestedFee}
              inputMode="numeric"
            />
          </Field>
        </div>
      )}
      <FormStatus state={state} />
      <div className={styles.revisionActions}>
        <button
          type="submit"
          className={[ui.button, nextIsExtra ? ui.dangerSolid : ""].join(" ")}
          disabled={pending}
          aria-busy={pending}
        >
          {pending && <span className={ui.spinner} aria-hidden="true" />}
          수정 {round}차 기록하기
        </button>
        <button type="button" className={ui.quiet} onClick={onClose}>
          취소
        </button>
      </div>
    </form>
  );
}
