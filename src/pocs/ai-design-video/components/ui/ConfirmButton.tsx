"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/core/actions";
import styles from "../ui.module.css";
import dialogStyles from "./dialog.module.css";

interface ConfirmButtonProps {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  /** Returns the action's result; the dialog stays open to show an error. */
  onConfirm: () => Promise<ActionState<unknown>>;
  buttonClassName?: string;
  onDone?: (state: ActionState<unknown>) => void;
}

/** A destructive action behind a native modal dialog (focus trap, Esc, backdrop). */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  buttonClassName,
  onDone,
}: ConfirmButtonProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const confirm = () =>
    startTransition(async () => {
      const result = await onConfirm();
      // An action that redirects resolves without a state; the navigation takes over.
      if (!result) return;
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      dialog.current?.close();
      onDone?.(result);
    });

  return (
    <>
      <button
        type="button"
        className={buttonClassName ?? [styles.button, styles.danger, styles.small].join(" ")}
        onClick={() => {
          setError(undefined);
          dialog.current?.showModal();
        }}
      >
        {children}
      </button>
      <dialog ref={dialog} className={dialogStyles.dialog} aria-labelledby={titleId}>
        <h2 id={titleId} className={dialogStyles.title}>
          {title}
        </h2>
        <p className={dialogStyles.text}>{description}</p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={dialogStyles.actions}>
          <button
            type="button"
            className={[styles.button, styles.secondary].join(" ")}
            onClick={() => dialog.current?.close()}
          >
            취소
          </button>
          <button
            type="button"
            className={[styles.button, styles.dangerSolid].join(" ")}
            onClick={confirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending && <span className={styles.spinner} aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
