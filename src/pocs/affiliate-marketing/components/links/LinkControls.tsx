"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { LINK_STATUSES, LINK_STATUS_HINT, LINK_STATUS_LABEL, type LinkStatus } from "../../domain/catalog";
import { deleteLinkAction, setLinkStatusAction } from "../../server/actions";
import { ConfirmAction } from "../ui/actions";
import { formStyles } from "../ui/Field";
import { ui } from "../ui/primitives";
import styles from "./links.module.css";

/** 판매 중 / 일시중지 / 판매 종료 switch with optimistic selection. */
export function StatusSwitch({ id, status }: { id: string; status: LinkStatus }) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState(status);
  if (status !== lastStatus) {
    setLastStatus(status);
    setShown(status);
  }

  return (
    <div className={styles.statusSwitch}>
      <div className={formStyles.segmented} role="group" aria-label="링크 상태">
        {LINK_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={formStyles.segment}
            aria-pressed={shown === s}
            disabled={pending}
            onClick={() => {
              if (s === shown) return;
              setShown(s);
              startTransition(async () => {
                const result = await setLinkStatusAction({ id, status: s });
                if (result.status === "error") {
                  setShown(status);
                  setError(result.message);
                } else setError(null);
              });
            }}
          >
            {LINK_STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      {pending ? <LoaderCircle aria-hidden className={ui.spin} width={18} height={18} /> : null}
      <p className={styles.statusHint} aria-live="polite">
        {error ?? LINK_STATUS_HINT[shown]}
      </p>
    </div>
  );
}

export function DeleteLink({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmAction
      small={false}
      label={
        <>
          <Trash2 aria-hidden />
          링크 삭제
        </>
      }
      question={`'${name}' 링크와 클릭·판매 기록을 모두 삭제할까요?`}
      confirmLabel="영구 삭제"
      onConfirm={() => deleteLinkAction({ id })}
    />
  );
}
