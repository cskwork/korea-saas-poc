import type { ActionState } from "@/core/actions";
import styles from "../ui.module.css";

/** The result line of a form or action, announced to screen readers. */
export function FormStatus({ state, className }: { state: ActionState<unknown>; className?: string }) {
  const message = state.status === "idle" ? undefined : state.message;
  return (
    <p role="status" aria-live="polite" className={className}>
      {message && (
        <span
          className={[styles.notice, state.status === "error" ? styles.noticeError : styles.noticeSuccess].join(" ")}
        >
          {message}
        </span>
      )}
    </p>
  );
}
