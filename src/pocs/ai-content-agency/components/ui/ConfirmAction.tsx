"use client";

import { useState, useTransition } from "react";
import type { ActionState } from "@/core/actions";
import { buttonClass } from "./buttons";
import { Notice } from "./Notice";
import styles from "./ui.module.css";

/**
 * A destructive button that asks once, in place: the first press turns into
 * "정말 …할까요? [확인] [취소]". No modal.
 */
export function ConfirmAction({
  label,
  question,
  confirmLabel,
  run,
  size = "regular",
  quiet = false,
}: {
  label: React.ReactNode;
  question: string;
  confirmLabel: string;
  run: () => Promise<ActionState<unknown>>;
  size?: "regular" | "small";
  /** A low-emphasis trigger for repeated rows; the confirmation itself stays red. */
  quiet?: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      setError(null);
      // A redirecting action navigates away and may resolve without a state.
      const result: ActionState<unknown> | undefined = await run();
      if (result?.status === "error") setError(result.message);
      setAsking(false);
    });

  return (
    <div className={styles.confirm}>
      {asking ? (
        <>
          <span className={styles.confirmText}>{question}</span>
          <button type="button" className={buttonClass("dangerSolid", size)} onClick={confirm} disabled={pending} data-pending={pending}>
            {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
          <button type="button" className={buttonClass("secondary", size)} onClick={() => setAsking(false)} disabled={pending} autoFocus>
            취소
          </button>
        </>
      ) : (
        <button type="button" className={quiet ? `${buttonClass("quiet", size)} ${styles.quietDanger}` : buttonClass("danger", size)} onClick={() => setAsking(true)}>
          {label}
        </button>
      )}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
