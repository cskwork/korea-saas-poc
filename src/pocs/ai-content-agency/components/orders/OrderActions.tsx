"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteOrderAction, draftFromOrderAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { ConfirmAction } from "../ui/ConfirmAction";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import styles from "./orders.module.css";

/** One click: AI writes a 시안 from the request as it stands, then opens it. */
export function DraftFromOrder({ orderId, hasDrafts }: { orderId: string; hasDrafts: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const write = () =>
    startTransition(async () => {
      setError(null);
      // On success the action redirects to the new draft; only failures come back.
      const result = await draftFromOrderAction({ orderId });
      if (result?.status === "error") setError(result.message);
    });
  return (
    <div className={styles.actionsRow}>
      <button type="button" className={buttonClass(hasDrafts ? "secondary" : "primary")} onClick={write} disabled={pending} data-pending={pending}>
        <PendingLabel
          pending={pending}
          idle={hasDrafts ? "AI로 시안 하나 더" : "AI로 시안 쓰기"}
          busy="시안 쓰는 중…"
          icon={<Sparkles size={16} aria-hidden="true" />}
        />
      </button>
      <Link href={`/ai-content-agency/write?order=${orderId}`} className={buttonClass("quiet")}>
        조건 바꿔 쓰기
      </Link>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

export function DeleteOrder({ orderId }: { orderId: string }) {
  return (
    <ConfirmAction
      label="의뢰 삭제"
      question="의뢰와 진행 기록을 지울까요? 연결된 원고는 원고함에 남아요."
      confirmLabel="삭제"
      size="small"
      run={() => deleteOrderAction({ orderId })}
    />
  );
}
