"use client";

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/core/actions";
import ui from "./ui.module.css";
import styles from "./actionButtons.module.css";

type Run = () => Promise<ActionState<unknown> | void>;

function useRun(run: Run) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const execute = (onDone?: (ok: boolean) => void) =>
    startTransition(async () => {
      const state = await run();
      if (!state) return;
      const ok = state.status !== "error";
      setResult(state.status === "error" ? { ok, message: state.message } : state.status === "success" && state.message ? { ok, message: state.message } : null);
      onDone?.(ok);
    });
  return { pending, result, execute };
}

function Feedback({ result }: { result: { ok: boolean; message: string } | null }) {
  return (
    <span role={result?.ok === false ? "alert" : "status"} className={`${ui.status} ${result?.ok === false ? ui.statusError : ""}`}>
      {result?.message ?? ""}
    </span>
  );
}

interface ActionButtonProps {
  run: Run;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  showFeedback?: boolean;
}

/** A button bound to a server action, with a pending label and its result announced. */
export function ActionButton({ run, children, pendingLabel = "처리 중…", className, showFeedback = true }: ActionButtonProps) {
  const { pending, result, execute } = useRun(run);
  return (
    <span className={styles.wrap}>
      <button type="button" className={className ?? ui.button} onClick={() => execute()} disabled={pending} aria-busy={pending}>
        {pending ? pendingLabel : children}
      </button>
      {showFeedback ? <Feedback result={result} /> : null}
    </span>
  );
}

interface ConfirmButtonProps {
  run: Run;
  /** The first, harmless button. */
  children: ReactNode;
  /** What will be lost, asked before anything happens. */
  question: string;
  confirmLabel: string;
  className?: string;
}

/** Destructive actions ask inline first; nothing happens until the second, explicit button. */
export function ConfirmButton({ run, children, question, confirmLabel, className }: ConfirmButtonProps) {
  const [asking, setAsking] = useState(false);
  const { pending, result, execute } = useRun(run);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const questionId = useId();

  useEffect(() => {
    if (asking) confirmRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <span className={styles.wrap}>
        <button type="button" className={className ?? `${ui.button} ${ui.danger}`} onClick={() => setAsking(true)}>
          {children}
        </button>
        <Feedback result={result} />
      </span>
    );
  }

  return (
    <span
      className={styles.confirm}
      role="group"
      aria-labelledby={questionId}
      onKeyDown={(event) => {
        if (event.key === "Escape") setAsking(false);
      }}
    >
      <span id={questionId} className={styles.question}>
        {question}
      </span>
      <span className={styles.row}>
        <button type="button" className={`${ui.button} ${ui.small}`} onClick={() => setAsking(false)} disabled={pending}>
          취소
        </button>
        <button
          ref={confirmRef}
          type="button"
          className={`${ui.button} ${ui.small} ${ui.dangerSolid}`}
          onClick={() => execute((ok) => ok && setAsking(false))}
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "처리 중…" : confirmLabel}
        </button>
      </span>
      <Feedback result={result} />
    </span>
  );
}
