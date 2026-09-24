import { Check, CircleAlert } from "lucide-react";
import clsx from "clsx";
import type { ActionState } from "@/core/actions";
import styles from "./ui.module.css";

/** The outcome of a form, announced politely next to its submit button. */
export function FormMessage({ state, showSuccess = true }: { state: ActionState<unknown>; showSuccess?: boolean }) {
  const visible = state.status === "error" || (showSuccess && state.status === "success" && state.message);
  return (
    <p role="status" aria-live="polite" className={clsx(styles.message, state.status === "error" ? styles.messageError : styles.messageSuccess)}>
      {visible && state.status === "error" && (
        <>
          <CircleAlert size={16} aria-hidden />
          {state.message}
        </>
      )}
      {visible && state.status === "success" && (
        <>
          <Check size={16} aria-hidden />
          {state.message}
        </>
      )}
    </p>
  );
}
