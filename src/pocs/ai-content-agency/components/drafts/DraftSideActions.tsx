"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { orderCode } from "../../domain/pipeline";
import { deleteDraftAction, linkDraftAction, restoreVersionAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { ConfirmAction } from "../ui/ConfirmAction";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import ui from "../ui/ui.module.css";
import { useActionForm } from "../ui/useActionForm";
import styles from "./drafts.module.css";

/** Brings an older version back as the newest one. */
export function RestoreVersion({ draftId, version }: { draftId: string; version: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const restore = () =>
    startTransition(async () => {
      setError(null);
      const result = await restoreVersionAction({ draftId, version });
      if (result.status === "error") setError(result.message);
    });
  return (
    <>
      <button type="button" className={buttonClass("primary", "small")} onClick={restore} disabled={pending} data-pending={pending}>
        <PendingLabel pending={pending} idle={`v${version}로 되돌리기`} busy="되돌리는 중…" icon={<History size={14} aria-hidden="true" />} />
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </>
  );
}

interface OrderOption {
  id: string;
  number: number;
  clientName: string;
  topic: string;
}

/** Which request this draft belongs to. */
export function LinkOrder({ draftId, orderId, orders, linked }: { draftId: string; orderId: string | null; orders: OrderOption[]; linked: OrderOption | null }) {
  const { state, pending, onSubmit } = useActionForm(linkDraftAction);
  const options = linked && !orders.some((o) => o.id === linked.id) ? [linked, ...orders] : orders;
  return (
    <form className={ui.form} onSubmit={onSubmit}>
      <input type="hidden" name="draftId" value={draftId} />
      <div className={ui.field}>
        <label htmlFor="link-order" className={ui.label}>
          연결된 의뢰
        </label>
        <select id="link-order" name="orderId" className={ui.select} defaultValue={orderId ?? ""}>
          <option value="">연결 안 함</option>
          {options.map((order) => (
            <option key={order.id} value={order.id}>
              {orderCode(order.number)} {order.clientName} · {order.topic}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={buttonClass("secondary", "small")} disabled={pending} data-pending={pending}>
          <PendingLabel pending={pending} idle="연결 저장" busy="저장하는 중…" />
        </button>
        {linked ? <Link href={`/ai-content-agency/orders/${linked.id}`}>의뢰 보기</Link> : null}
      </div>
      <div aria-live="polite">
        {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
        {state.status === "success" && state.message ? <Notice tone="success">{state.message}</Notice> : null}
      </div>
    </form>
  );
}

export function DeleteDraft({ draftId }: { draftId: string }) {
  return (
    <ConfirmAction
      size="small"
      label="원고 삭제"
      question="모든 버전이 함께 지워져요."
      confirmLabel="삭제"
      run={() => deleteDraftAction({ draftId })}
    />
  );
}
