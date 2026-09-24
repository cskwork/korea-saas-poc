"use client";

import { useState, useTransition } from "react";
import { countOpenChecks } from "../../domain/templates";
import { moveOrderAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { Notice } from "../ui/Notice";
import { PendingLabel } from "../ui/PendingLabel";
import { DraftLine, type DraftSummary } from "./DraftLines";
import styles from "./orders.module.css";

/** In 검수: choose which draft goes to the client, then deliver. */
export function DeliverPanel({ orderId, drafts }: { orderId: string; drafts: DraftSummary[] }) {
  const [selected, setSelected] = useState(drafts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const chosen = drafts.find((d) => d.id === selected);
  const openChecks = chosen ? countOpenChecks(chosen.body) : 0;

  const deliver = () =>
    startTransition(async () => {
      setError(null);
      const result = await moveOrderAction({ orderId, to: "delivered", draftId: selected });
      if (result.status === "error") setError(result.message);
    });

  if (drafts.length === 0) {
    return <Notice tone="info">납품할 시안이 아직 없어요. 먼저 시안을 써 주세요.</Notice>;
  }

  return (
    <div className={styles.slipSection}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.panelTitle}>납품할 원고</legend>
        <ul className={styles.draftList} role="list">
          {drafts.map((draft) => (
            <li key={draft.id} className={styles.draftItem}>
              <input
                type="radio"
                name={`deliver-${orderId}`}
                value={draft.id}
                checked={selected === draft.id}
                onChange={() => setSelected(draft.id)}
                aria-label={`${draft.title} 고르기`}
              />
              <DraftLine draft={draft} />
            </li>
          ))}
        </ul>
      </fieldset>
      {openChecks > 0 ? (
        <Notice tone="info">고른 원고에 채우지 않은 [확인 필요] 표시가 {openChecks}곳 있어요. 원고에서 채운 뒤 납품하는 걸 권해요.</Notice>
      ) : null}
      <div className={styles.actionsRow}>
        <button type="button" className={buttonClass("primary")} onClick={deliver} disabled={pending || !selected} data-pending={pending}>
          <PendingLabel pending={pending} idle="이 원고로 납품 완료" busy="납품하는 중…" />
        </button>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
