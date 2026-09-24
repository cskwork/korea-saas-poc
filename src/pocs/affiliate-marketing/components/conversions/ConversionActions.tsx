"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import type { ConversionStatus } from "../../domain/catalog";
import { deleteConversionAction, setConversionStatusAction } from "../../server/actions";
import { ConfirmAction } from "../ui/actions";
import { ui } from "../ui/primitives";
import styles from "./conversions.module.css";

const NEXT: Record<ConversionStatus, { status: ConversionStatus; label: string }[]> = {
  pending: [
    { status: "confirmed", label: "확정" },
    { status: "cancelled", label: "취소" },
  ],
  confirmed: [{ status: "cancelled", label: "취소 처리" }],
  cancelled: [{ status: "pending", label: "되돌리기" }],
};

/** Status workflow for one order (대기 → 확정/취소, 취소 → 대기) plus delete with confirmation. */
export function ConversionActions({ id, status, label }: { id: string; status: ConversionStatus; label: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={styles.rowActions} role="group" aria-label={`${label} 판매 기록 작업`}>
      {NEXT[status].map((next) => (
        <button
          key={next.status}
          type="button"
          className={clsx(ui.base, ui.small)}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await setConversionStatusAction({ id, status: next.status });
              setError(result.status === "error" ? result.message : null);
            })
          }
        >
          {next.label}
        </button>
      ))}
      <ConfirmAction
        label={
          <>
            <Trash2 aria-hidden />
            <span className={ui.srOnly}>삭제</span>
          </>
        }
        question="이 기록을 삭제할까요?"
        confirmLabel="삭제"
        onConfirm={() => deleteConversionAction({ id })}
      />
      {error ? (
        <span role="alert" className={styles.sub}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
