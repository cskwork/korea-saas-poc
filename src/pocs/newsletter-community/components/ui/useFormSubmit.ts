"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { useToast } from "./Toaster";

type FormActionFn<TData> = (state: ActionState<TData>, formData: FormData) => Promise<ActionState<TData>>;

interface Options {
  /** Clear the form after a successful submit (create forms). */
  resetOnSuccess?: boolean;
  /** Also announce success as a toast (errors stay inline, next to the fields). */
  toast?: boolean;
}

/**
 * `useActionState` for forms that keep their input on validation errors.
 * React resets a form after an `action` submit; submitting from `onSubmit`
 * instead keeps what the person typed when the server says no, while the
 * `action` prop still makes the form work before hydration.
 */
export function useFormSubmit<TData>(fn: FormActionFn<TData>, options: Options = {}) {
  const [state, dispatch, pending] = useActionState(fn, idleState as ActionState<TData>);
  const formRef = useRef<HTMLFormElement>(null);
  const { report } = useToast();
  const { resetOnSuccess = false, toast = false } = options;

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "success" && resetOnSuccess) formRef.current?.reset();
    if (toast && state.status === "success") report(state);
  }, [state, resetOnSuccess, toast, report]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => dispatch(data));
  };

  const fieldError = (name: string) => (state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined);

  return { state, pending, formRef, onSubmit, action: dispatch, fieldError };
}
