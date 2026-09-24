"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { idleState, type ActionState } from "@/core/actions";

type FormActionFn<T> = (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>;

/**
 * `useActionState` for forms that must keep what the user typed when the server
 * rejects it: submitting through `onSubmit` skips React's automatic form reset.
 */
export function useFormAction<T = undefined>(action: FormActionFn<T>) {
  const [state, dispatch, pending] = useActionState(action, idleState as ActionState<T>);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const fieldError = (name: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;

  return { state, pending, onSubmit, fieldError };
}

/** id, aria-invalid and aria-describedby for a control and its error/hint lines. */
export function controlProps(id: string, error?: string, hint?: boolean) {
  const describedBy = [error ? `${id}-error` : "", hint ? `${id}-hint` : ""].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy || undefined,
  };
}
