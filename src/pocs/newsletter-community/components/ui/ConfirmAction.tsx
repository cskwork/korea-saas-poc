"use client";

import { useId, useRef, useTransition, type ReactNode } from "react";
import type { ActionState } from "@/core/actions";
import { buttonClass, type ButtonVariant } from "./button";
import { useToast } from "./Toaster";
import styles from "./ui.module.css";

interface ConfirmActionProps {
  /** Trigger content (text, or icon + text). */
  children: ReactNode;
  /** Accessible name when the trigger shows only an icon. */
  label?: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  run: () => Promise<ActionState<unknown> | void>;
  variant?: ButtonVariant;
  size?: "md" | "sm";
  className?: string;
  destructive?: boolean;
}

/**
 * A button that asks first. The question lives in a native <dialog> (focus is
 * trapped and Escape cancels); the answer runs a server action in a transition.
 */
export function ConfirmAction({
  children,
  label,
  title,
  description,
  confirmLabel,
  run,
  variant = "secondary",
  size = "sm",
  className,
  destructive = true,
}: ConfirmActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  const confirm = () => {
    startTransition(async () => {
      const result = await run();
      if (result) report(result);
      dialogRef.current?.close();
    });
  };

  return (
    <>
      <button
        type="button"
        className={buttonClass(variant, size, className)}
        aria-label={label}
        aria-haspopup="dialog"
        disabled={pending}
        onClick={() => dialogRef.current?.showModal()}
      >
        {children}
      </button>
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId}>
        <div className={styles.dialogBody}>
          <h2 className={styles.dialogTitle} id={titleId}>
            {title}
          </h2>
          <div className={styles.dialogText}>{description}</div>
          <div className={styles.dialogActions}>
            <button type="button" className={buttonClass("secondary")} onClick={() => dialogRef.current?.close()} autoFocus>
              그만두기
            </button>
            <button
              type="button"
              className={buttonClass(destructive ? "dangerSolid" : "primary")}
              onClick={confirm}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "처리 중…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
