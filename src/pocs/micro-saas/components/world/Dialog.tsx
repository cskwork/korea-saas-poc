"use client";

import { useCallback, useId, useRef, useState, useTransition, type ReactNode, type RefObject } from "react";
import type { ActionState } from "@/core/actions";
import { Icon, type IconName } from "./Icon";
import styles from "./dialog.module.css";
import { useToast } from "./Toast";
import ui from "./ui.module.css";

/** Open/close handles for a native <dialog> (focus trap, Esc and inert page come with it). */
export function useDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback(() => ref.current?.showModal(), []);
  const close = useCallback(() => ref.current?.close(), []);
  return { ref, open, close };
}

/** A printed slip lifted off the page: the only floating layer besides the toast. */
export function Dialog({
  dialogRef,
  title,
  children,
  onClose,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  children: ReactNode;
  onClose?: () => void;
}) {
  const titleId = useId();
  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className={styles.head}>
        <h2 id={titleId}>{title}</h2>
        <button type="button" className={ui.iconBtn} aria-label="닫기" onClick={() => dialogRef.current?.close()}>
          <Icon name="x" />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}

/**
 * A destructive action behind a confirmation slip. `run` returns the action's state; errors
 * stay in the slip, success closes it and shows the message as a toast.
 */
export function ConfirmButton({
  label,
  title,
  body,
  confirmLabel,
  run,
  icon,
  className,
  ariaLabel,
}: {
  label: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  run: () => Promise<ActionState<unknown> | undefined>;
  icon?: IconName;
  className?: string;
  /** For icon-only triggers. */
  ariaLabel?: string;
}) {
  const dialog = useDialog();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        className={className ?? `${ui.btn} ${ui.danger}`}
        onClick={dialog.open}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {icon ? <Icon name={icon} /> : null}
        {label ? <span>{label}</span> : null}
      </button>
      <Dialog dialogRef={dialog.ref} title={title} onClose={() => setError(null)}>
        <div className={styles.confirmBody}>{body}</div>
        {error ? (
          <p className={ui.formError} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="button" className={`${ui.btn} ${ui.line}`} onClick={dialog.close} disabled={pending}>
            그대로 두기
          </button>
          <button
            type="button"
            className={`${ui.btn} ${ui.danger}`}
            aria-busy={pending}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await run();
                if (result?.status === "error") {
                  setError(result.message);
                  return;
                }
                dialog.close();
                if (result?.status === "success" && result.message) toast(result.message);
              })
            }
          >
            {pending ? "처리하는 중…" : confirmLabel}
          </button>
        </div>
      </Dialog>
    </>
  );
}
