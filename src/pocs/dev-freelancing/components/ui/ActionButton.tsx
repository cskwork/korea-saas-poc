"use client";

import clsx from "clsx";
import { useState, useTransition } from "react";
import type { ActionState } from "@/core/actions";
import { buttonClass, type ButtonVariant } from "./button";
import styles from "./ActionButton.module.css";
import ui from "./ui.module.css";

interface ActionButtonProps<P> {
  /** A server action taking `payload`. */
  action: (payload: P) => Promise<ActionState<unknown>>;
  payload: P;
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  small?: boolean;
  iconOnly?: boolean;
  /** Accessible name when the visible content is an icon. */
  label?: string;
  /** Ask before running (destructive or hard-to-undo actions). */
  confirm?: string;
  confirmLabel?: string;
  disabled?: boolean;
  onDone?: (result: ActionState<unknown>) => void;
}

/** Runs a server action from a button, with pending state, inline confirmation and inline errors. */
export function ActionButton<P>({
  action,
  payload,
  children,
  pendingLabel,
  variant = "secondary",
  small,
  iconOnly,
  label,
  confirm,
  confirmLabel = "확인",
  disabled,
  onDone,
}: ActionButtonProps<P>) {
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = () =>
    startTransition(async () => {
      const result = await action(payload);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setError(null);
      setAsking(false);
      setNotice(result.status === "success" && result.message ? result.message : null);
      onDone?.(result);
    });

  if (confirm && asking) {
    return (
      <span className={styles.confirm} role="group" aria-label={confirm}>
        <span className={styles.question}>{confirm}</span>
        <button type="button" className={buttonClass(variant === "danger" ? "danger" : "primary", { small: true })} onClick={run} disabled={pending} autoFocus>
          {pending ? (pendingLabel ?? "처리 중…") : confirmLabel}
        </button>
        <button type="button" className={buttonClass("ghost", { small: true })} onClick={() => setAsking(false)} disabled={pending}>
          취소
        </button>
        {error ? (
          <span className={styles.error} role="alert">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={styles.wrap}>
      <button
        type="button"
        className={clsx(buttonClass(variant, { small, iconOnly }), pending && ui.pending)}
        onClick={() => (confirm ? setAsking(true) : run())}
        disabled={pending || disabled}
        aria-label={label}
        title={iconOnly ? label : undefined}
      >
        {pending && pendingLabel ? pendingLabel : children}
      </button>
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
      {notice && !iconOnly ? (
        <span className={styles.notice} role="status">
          {notice}
        </span>
      ) : null}
    </span>
  );
}
