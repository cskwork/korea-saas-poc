"use client";

import { useId, useRef, useTransition, type ReactNode } from "react";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import type { ActionState } from "@/core/actions";
import { useToast } from "./Toast";
import styles from "./ui.module.css";

export interface ConfirmCopy {
  title: string;
  text: ReactNode;
  confirmLabel: string;
  danger?: boolean;
}

interface ActionButtonProps<TInput> {
  action: (input: TInput) => Promise<ActionState<unknown>>;
  input: TInput;
  children: ReactNode;
  className?: string;
  /** Asks before running (destructive or hard-to-undo actions). */
  confirm?: ConfirmCopy;
  "aria-label"?: string;
}

/** Runs a server action from a button, with a pending state, toast feedback and optional confirmation. */
export function ActionButton<TInput>({
  action,
  input,
  children,
  className,
  confirm,
  ...aria
}: ActionButtonProps<TInput>) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const run = () => {
    dialog.current?.close();
    startTransition(async () => {
      const result = await action(input);
      if (result.status === "error") toast(result.message, "error");
      else if (result.status === "success" && result.message) toast(result.message);
    });
  };

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={() => (confirm ? dialog.current?.showModal() : run())}
        {...aria}
      >
        {pending ? <LoaderCircle size={16} className={styles.spin} aria-hidden /> : null}
        {children}
      </button>
      {confirm ? (
        <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}>
          <div className={styles.dialogBody}>
            <p className={styles.dialogTitle} id={titleId}>
              {confirm.title}
            </p>
            <div className={styles.dialogText}>{confirm.text}</div>
          </div>
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={clsx(styles.btn, styles.btnGhost)}
              onClick={() => dialog.current?.close()}
              autoFocus
            >
              그만두기
            </button>
            <button
              type="button"
              className={clsx(styles.btn, confirm.danger ? styles.btnDangerSolid : styles.btnPop)}
              onClick={run}
            >
              {confirm.confirmLabel}
            </button>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
