"use client";

import { startTransition, type FormEvent } from "react";
import type { ActionState } from "@/core/actions";

/**
 * Submits a form through its `useActionState` dispatcher without React's automatic reset, so
 * typed values stay put when the server answers with a field error. The same form keeps its
 * `action` prop, which still posts natively before hydration.
 */
export function submitKeepingValues(dispatch: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter instanceof HTMLElement ? submitter : null);
    startTransition(() => dispatch(data));
  };
}

/** First error message for a field, if the last submission had one. */
export function fieldError(state: ActionState<unknown>, field: string): string | undefined {
  return state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;
}

/** Props that tie an input to its error line (aria-invalid + aria-describedby). */
export function errorProps(state: ActionState<unknown>, field: string, id: string) {
  const error = fieldError(state, field);
  return error ? { "aria-invalid": true, "aria-describedby": `${id}-error` } : {};
}
