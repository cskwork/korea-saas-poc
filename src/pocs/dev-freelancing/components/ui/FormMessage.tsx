import type { ActionState } from "@/core/actions";
import ui from "./ui.module.css";

/** The outcome of the last submit: announced politely on success, assertively on error. */
export function FormMessage({ state }: { state: ActionState<unknown> }) {
  if (state.status === "error") {
    return (
      <p className={ui.message} data-tone="error" role="alert">
        {state.message}
      </p>
    );
  }
  return (
    <p className={ui.message} data-tone={state.status === "success" && state.message ? "success" : undefined} role="status">
      {state.status === "success" ? state.message : null}
    </p>
  );
}
