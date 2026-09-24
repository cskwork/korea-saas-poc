"use client";

import { FolderPlus, Pencil, Printer, ReceiptText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { formatWon } from "@/core/format";
import { estimateTransitions, invoiceTransitions, type ConversionShare, type EstimateStatus, type InvoiceStatus } from "../../domain/documents";
import { ESTIMATE_ACTION_LABEL, INVOICE_ACTION_LABEL } from "../../domain/labels";
import {
  convertEstimate,
  createProjectFromEstimate,
  deleteEstimate,
  deleteInvoice,
  setEstimateStatus,
  setInvoiceStatus,
} from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import styles from "./DocumentView.module.css";

export function PrintButton() {
  return (
    <button type="button" className={buttonClass("secondary", { small: true })} onClick={() => window.print()}>
      <Printer size={14} aria-hidden="true" />
      인쇄 · PDF 저장
    </button>
  );
}

const SHARE_LABEL: Record<ConversionShare, string> = {
  full: "전액 청구",
  advance30: "착수금 30%",
  advance50: "착수금 50%",
  balance: "잔금 청구",
};

/** Status buttons, conversion to an invoice and project creation for one estimate. */
export function EstimateActions({
  id,
  status,
  hasProject,
  shares,
  supply,
  invoicedSupply,
}: {
  id: string;
  status: EstimateStatus;
  hasProject: boolean;
  shares: ConversionShare[];
  supply: number;
  invoicedSupply: number;
}) {
  const uid = useId();
  const [share, setShare] = useState<ConversionShare | null>(shares[0] ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const transitions = estimateTransitions(status);
  const canConvert = (status === "accepted" || status === "invoiced") && shares.length > 0;

  const convert = () =>
    startTransition(async () => {
      if (!share) return;
      const result = await convertEstimate({ id, share });
      if (result.status === "error") setError(result.message);
    });

  return (
    <div className={styles.actions}>
      {status === "draft" ? (
        <Link href={`/dev-freelancing/estimates/${id}/edit`} className={buttonClass("secondary")}>
          <Pencil size={14} aria-hidden="true" />
          고치기
        </Link>
      ) : null}
      {transitions.map((to) => (
        <ActionButton key={to} action={setEstimateStatus} payload={{ id, status: to }} variant={to === "sent" || to === "accepted" ? "primary" : "secondary"} pendingLabel="처리 중…">
          {ESTIMATE_ACTION_LABEL[to]}
        </ActionButton>
      ))}

      {canConvert ? (
        <fieldset className={styles.convert}>
          <legend className={styles.convertTitle}>
            <ReceiptText size={14} aria-hidden="true" /> 인보이스로 전환
          </legend>
          {invoicedSupply > 0 ? (
            <p className={ui.hint}>
              청구함 {formatWon(invoicedSupply)} / 공급가액 {formatWon(supply)}
            </p>
          ) : null}
          <div className={styles.shares} role="radiogroup" aria-label="청구 방식">
            {shares.map((option) => (
              <label key={option} className={styles.share} data-checked={share === option ? "" : undefined}>
                <input type="radio" name={`${uid}-share`} value={option} checked={share === option} onChange={() => setShare(option)} />
                {SHARE_LABEL[option]}
              </label>
            ))}
          </div>
          <button type="button" className={buttonClass("primary")} onClick={convert} disabled={pending || !share}>
            {pending ? "만드는 중…" : "인보이스 만들기"}
          </button>
          {error ? (
            <p className={ui.fieldError} role="alert">
              {error}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {!hasProject ? (
        <ActionButton action={createProjectFromEstimate} payload={{ id }} pendingLabel="만드는 중…">
          <FolderPlus size={14} aria-hidden="true" />
          프로젝트로 만들기
        </ActionButton>
      ) : null}
      <PrintButton />
      <ActionButton action={deleteEstimate} payload={{ id }} variant="danger" small confirm="견적서를 지울까요?" confirmLabel="삭제">
        <Trash2 size={14} aria-hidden="true" />
        삭제
      </ActionButton>
    </div>
  );
}

/** Status buttons for one invoice; confirming a deposit asks for the day it landed. */
export function InvoiceActions({ id, status, today }: { id: string; status: InvoiceStatus; today: string }) {
  const uid = useId();
  const [paidOn, setPaidOn] = useState(today);
  const transitions = invoiceTransitions(status);
  return (
    <div className={styles.actions}>
      {status === "issued" ? (
        <Link href={`/dev-freelancing/invoices/${id}/edit`} className={buttonClass("secondary")}>
          <Pencil size={14} aria-hidden="true" />
          고치기
        </Link>
      ) : null}
      {transitions.includes("paid") ? (
        <div className={styles.paid}>
          <label htmlFor={`${uid}-paid`} className={ui.label}>
            입금된 날
          </label>
          <div className={styles.paidRow}>
            <input id={`${uid}-paid`} type="date" className={ui.input} value={paidOn} max={today} onChange={(event) => setPaidOn(event.target.value)} />
            <ActionButton action={setInvoiceStatus} payload={{ id, status: "paid" as const, paidOn }} variant="primary" pendingLabel="기록 중…">
              {INVOICE_ACTION_LABEL.paid}
            </ActionButton>
          </div>
        </div>
      ) : null}
      {transitions
        .filter((to) => to !== "paid")
        .map((to) => (
          <ActionButton
            key={to}
            action={setInvoiceStatus}
            payload={{ id, status: to }}
            variant={to === "awaiting" && status === "issued" ? "primary" : "secondary"}
            confirm={status === "paid" ? "입금 기록을 취소할까요?" : undefined}
            confirmLabel="취소하기"
            pendingLabel="처리 중…"
          >
            {status === "paid" ? "입금 취소" : INVOICE_ACTION_LABEL[to]}
          </ActionButton>
        ))}
      <PrintButton />
      <ActionButton action={deleteInvoice} payload={{ id }} variant="danger" small confirm="인보이스를 지울까요?" confirmLabel="삭제">
        <Trash2 size={14} aria-hidden="true" />
        삭제
      </ActionButton>
    </div>
  );
}
