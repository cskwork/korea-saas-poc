"use client";

import { useState } from "react";
import clsx from "clsx";
import { Check, RotateCcw } from "lucide-react";
import { formatWon } from "@/core/format";
import type { ActionState } from "@/core/actions";
import { purchaseAction, type PurchaseResult } from "../../server/actions";
import { FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./school.module.css";

export function PurchasePanel({ productId, price, format }: { productId: string; price: number; format: string }) {
  const { state, pending, formProps } = useFormAction<PurchaseResult>(purchaseAction);
  const [dismissed, setDismissed] = useState<ActionState<PurchaseResult> | null>(null);
  const done = state.status === "success" && state !== dismissed ? state : null;

  return (
    <div className={styles.enroll} id="buy">
      <p className={styles.price}>
        <strong className={ui.num}>{formatWon(price)}</strong>
      </p>
      <p className={styles.fine}>구매하면 {format}로 받아요.</p>
      {done?.data ? (
        <div className={styles.receipt} role="status">
          <p className={styles.receiptTitle}>
            <Check size={18} aria-hidden />
            {done.message}
          </p>
          <dl className={styles.receiptFacts}>
            <div>
              <dt>자료</dt>
              <dd>{done.data.title}</dd>
            </div>
            <div>
              <dt>결제</dt>
              <dd>{formatWon(done.data.amount)} (데모 기록)</dd>
            </div>
          </dl>
          <button type="button" className={clsx(ui.button, ui.small)} onClick={() => setDismissed(state)}>
            <RotateCcw size={14} aria-hidden />
            다시 구매하기
          </button>
        </div>
      ) : (
        <form {...formProps} className={styles.enrollForm} noValidate>
          <input type="hidden" name="productId" value={productId} />
          <div className={ui.field}>
            <label className={ui.label} htmlFor="buy-name">
              이름
            </label>
            <input className={ui.input} {...fieldAttrs(state, "name", "buy-name")} autoComplete="name" maxLength={30} />
            <FieldMessage state={state} name="name" id="buy-name" />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="buy-email">
              이메일
            </label>
            <input className={ui.input} {...fieldAttrs(state, "email", "buy-email")} type="email" autoComplete="email" maxLength={120} />
            <FieldMessage state={state} name="email" id="buy-email" />
          </div>
          <FormNotice state={state.status === "error" ? state : { status: "idle" }} />
          <SubmitButton pending={pending} pendingLabel="구매하는 중" className={clsx(ui.large, ui.block)}>
            {formatWon(price)}에 구매
          </SubmitButton>
          <p className={styles.fine}>데모 스쿨이라 결제는 기록만 되고 실제로 청구되지 않아요.</p>
        </form>
      )}
    </div>
  );
}
