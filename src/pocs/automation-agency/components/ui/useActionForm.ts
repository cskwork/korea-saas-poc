"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { idleState, type ActionState } from "@/core/actions";

type FormActionFn<T> = (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>;

/**
 * `useActionState` for forms that must keep what the user typed when the server
 * rejects it. React resets a form after a native form action; submitting through
 * `onSubmit` avoids that, while `action` keeps the form working before hydration.
 */
export function useActionForm<T = undefined>(action: FormActionFn<T>) {
  const [state, dispatch, pending] = useActionState<ActionState<T>, FormData>(action, idleState);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  const errors = (field: string) => (state.status === "error" ? state.fieldErrors?.[field] : undefined);
  return { state, pending, errors, formProps: { action: dispatch, onSubmit } };
}
