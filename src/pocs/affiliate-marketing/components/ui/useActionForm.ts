"use client";

import { startTransition, useActionState, useCallback } from "react";
import { idleState, type ActionState } from "@/core/actions";

/**
 * `useActionState` for forms that must keep what the user typed when validation
 * fails: submitting through `onSubmit` avoids React's automatic reset of
 * uncontrolled fields after a form action.
 */
export function useActionForm<TData>(action: (state: ActionState<TData>, formData: FormData) => Promise<ActionState<TData>>) {
  const [state, dispatch, pending] = useActionState(action, idleState as ActionState<TData>);
  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startTransition(() => dispatch(formData));
    },
    [dispatch],
  );
  const errors: Partial<Record<string, string[]>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return { state, pending, onSubmit, errors };
}
