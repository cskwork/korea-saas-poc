"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { AlertTriangle, Check, Copy, LoaderCircle } from "lucide-react";
import type { ActionState } from "@/core/actions";
import { ui } from "./primitives";
import styles from "./forms.module.css";

/** Submit button that shows its own pending state from the parent form. */
export function SubmitButton({
  children,
  pendingLabel,
  tone = "primary",
  small,
  icon,
  pending: pendingProp,
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  tone?: "primary" | "base" | "danger";
  small?: boolean;
  icon?: React.ReactNode;
  /** Pending state from `useActionForm`; falls back to the parent form's status. */
  pending?: boolean;
  disabled?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={clsx(ui[tone], small && ui.small)} disabled={pending || disabled}>
      {pending ? <LoaderCircle aria-hidden className={ui.spin} /> : icon}
      {pending ? pendingLabel : children}
    </button>
  );
}

/** The action's result message: a stamped success note or an error alert. */
export function ActionNotice<T>({ state }: { state: ActionState<T> }) {
  if (state.status === "idle" || (state.status === "success" && !state.message)) return null;
  if (state.status === "error") {
    return (
      <p role="alert" className={ui.noticeError}>
        <AlertTriangle aria-hidden />
        {state.message}
      </p>
    );
  }
  return (
    <p role="status" className={clsx(ui.noticeOk, ui.stamp)}>
      <Check aria-hidden />
      {state.message}
    </p>
  );
}

/**
 * Destructive action behind an inline second step ("정말 삭제할까요?"), so a single
 * stray click never deletes anything. Focus moves to the confirm button.
 */
export function ConfirmAction({
  label,
  question,
  confirmLabel,
  onConfirm,
  small = true,
  tone = "danger",
}: {
  label: React.ReactNode;
  question: string;
  confirmLabel: string;
  onConfirm: () => Promise<ActionState<unknown> | void>;
  small?: boolean;
  tone?: "danger" | "base";
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (asking) confirmRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <span className={styles.confirm}>
        <button ref={triggerRef} type="button" className={clsx(ui[tone], small && ui.small)} onClick={() => setAsking(true)}>
          {label}
        </button>
        {error ? (
          <span role="alert" className={styles.confirmText}>
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={styles.confirm} role="group" aria-label={question}>
      <span className={styles.confirmText}>{question}</span>
      <button
        ref={confirmRef}
        type="button"
        className={clsx(ui.danger, small && ui.small)}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await onConfirm();
            if (result && result.status === "error") setError(result.message);
            else setError(null);
            setAsking(false);
          })
        }
      >
        {pending ? <LoaderCircle aria-hidden className={ui.spin} /> : null}
        {pending ? "처리 중…" : confirmLabel}
      </button>
      <button
        type="button"
        className={clsx(ui.base, small && ui.small)}
        disabled={pending}
        onClick={() => {
          setAsking(false);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      >
        취소
      </button>
    </span>
  );
}

/** Copies text to the clipboard and confirms with a short stamp. */
export function CopyButton({ text, label, copiedLabel = "복사됨", small = true }: { text: string; label: string; copiedLabel?: string; small?: boolean }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  useEffect(() => {
    if (copied === "idle") return;
    const timer = window.setTimeout(() => setCopied("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className={clsx(ui.base, small && ui.small)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied("done");
        } catch {
          setCopied("failed");
        }
      }}
    >
      {copied === "done" ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">{copied === "done" ? copiedLabel : copied === "failed" ? "복사 실패: 직접 선택해 주세요" : label}</span>
    </button>
  );
}
