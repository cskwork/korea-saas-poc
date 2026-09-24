"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "@/core/actions";

type FormActionFn<T> = (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>;

const idle = { status: "idle" } as const;

/**
 * Runs a server form action from onSubmit inside a transition, so the form keeps what
 * the person typed when validation fails (a plain `<form action>` would reset it).
 */
export function useActionForm<T = undefined>(action: FormActionFn<T>) {
  const [state, dispatch, pending] = useActionState<ActionState<T>, FormData>(action, idle);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const errorFor = (name: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;

  return { state, pending, onSubmit, errorFor };
}
