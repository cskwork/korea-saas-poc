"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import type { ActionState } from "@/core/actions";

type FormActionFn<T> = (prev: ActionState<T>, formData: FormData) => Promise<ActionState<T>>;

const idle = { status: "idle" } as const;

/** After a rejected submit, puts the keyboard on the first field that needs fixing. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  const field = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!field) return;
  field.focus({ preventScroll: true });
  field.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/**
 * Runs a server form action from onSubmit inside a transition, so the form keeps what
 * the person typed when validation fails (a plain `<form action>` would reset it).
 */
export function useActionForm<T = undefined>(action: FormActionFn<T>) {
  const [state, dispatch, pending] = useActionState<ActionState<T>, FormData>(action, idle);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state.status === "error") focusFirstInvalid(formRef.current);
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    formRef.current = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const errorFor = (name: string): string | undefined =>
    state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;

  return { state, pending, onSubmit, errorFor };
}
