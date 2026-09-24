"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { Check, CircleAlert, Link2, LoaderCircle } from "lucide-react";
import type { ActionState } from "@/core/actions";
import ui from "./ui.module.css";

/** Client form primitives shared by every studio and school form. */

export const IDLE = { status: "idle" } as const;

type AnyState = ActionState<unknown>;

/**
 * Binds a `formAction` to a form without React's automatic reset, so a
 * validation error keeps what the person typed. Works without JS through `action`.
 */
export function useFormAction<TData>(
  action: (state: ActionState<TData>, formData: FormData) => Promise<ActionState<TData>>,
  options: { resetOnSuccess?: boolean } = {},
) {
  const [state, dispatch, pending] = useActionState(action, IDLE as ActionState<TData>);
  const ref = useRef<HTMLFormElement>(null);
  const { resetOnSuccess = false } = options;
  useEffect(() => {
    if (resetOnSuccess && state.status === "success") ref.current?.reset();
  }, [state, resetOnSuccess]);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Include the clicked submit button's name/value, as a native submission would.
    const data = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(data));
  };
  return { state, pending, formProps: { ref, action: dispatch, onSubmit } };
}

export function SubmitButton({
  children,
  pendingLabel,
  className,
  icon,
  pending: pendingProp,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  icon?: ReactNode;
  /** Pass when the form submits through `useFormAction` (form status is not tracked then). */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={clsx(ui.button, ui.primary, className)} disabled={pending} aria-disabled={pending}>
      {pending ? <LoaderCircle size={16} className={ui.spin} aria-hidden /> : icon}
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Success or form-level error of the last submission, announced politely. */
export function FormNotice({ state }: { state: AnyState }) {
  return (
    <div aria-live="polite" role="status">
      {state.status === "success" && state.message ? (
        <p className={clsx(ui.notice, ui.success)}>
          <Check size={16} aria-hidden />
          {state.message}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className={clsx(ui.notice, ui.error)}>
          <CircleAlert size={16} aria-hidden />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

const errorsOf = (state: AnyState, name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);

/** `aria-invalid` / `aria-describedby` for a control whose errors render in `<FieldMessage>`. */
export function fieldAttrs(state: AnyState, name: string, id: string, hintId?: string) {
  const invalid = Boolean(errorsOf(state, name)?.length);
  const describedBy = [hintId, invalid ? `${id}-error` : undefined].filter(Boolean).join(" ");
  return { id, name, "aria-invalid": invalid || undefined, "aria-describedby": describedBy || undefined };
}

export function FieldMessage({ state, name, id }: { state: AnyState; name: string; id: string }) {
  const errors = errorsOf(state, name);
  if (!errors?.length) return null;
  return (
    <p id={`${id}-error`} className={ui.fieldError}>
      {errors[0]}
    </p>
  );
}

/**
 * Runs a button action (publish, move, refund…) in a transition and shows its
 * outcome next to the button.
 */
export function ActionButton({
  run,
  children,
  pendingLabel,
  className,
  title,
  showSuccess = true,
}: {
  run: () => Promise<AnyState>;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  title?: string;
  showSuccess?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AnyState>(IDLE);
  return (
    <span className={ui.confirm}>
      <button
        type="button"
        className={className ?? ui.button}
        disabled={pending}
        aria-disabled={pending}
        title={title}
        onClick={() =>
          startTransition(async () => {
            // An action that redirects resolves to nothing: the navigation is the outcome.
            const result: AnyState | undefined = await run();
            if (result) setState(result);
          })
        }
      >
        {pending ? <LoaderCircle size={14} className={ui.spin} aria-hidden /> : null}
        {pending && pendingLabel ? pendingLabel : children}
      </button>
      <span role="status" aria-live="polite" className={ui.inlineStatus} data-tone={state.status}>
        {state.status === "error" || (showSuccess && state.status === "success") ? state.message : null}
      </span>
    </span>
  );
}

/** A destructive action behind an inline "정말 …할까요?" step (no browser confirm dialog). */
export function ConfirmButton({
  run,
  label,
  confirmLabel,
  prompt,
  className,
  icon,
  triggerLabel,
}: {
  run: () => Promise<AnyState>;
  label: string;
  confirmLabel: string;
  prompt: string;
  className?: string;
  icon?: ReactNode;
  /** Accessible name for an icon-only trigger. */
  triggerLabel?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<AnyState>(IDLE);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (asking) confirmRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <span className={ui.confirm}>
        <button
          type="button"
          className={className ?? clsx(ui.button, ui.danger)}
          aria-label={triggerLabel}
          onClick={() => setAsking(true)}
        >
          {icon}
          {label}
        </button>
        <span role="status" aria-live="polite" className={ui.inlineStatus} data-tone={state.status}>
          {state.status !== "idle" ? state.message : null}
        </span>
      </span>
    );
  }
  return (
    <span className={ui.confirm} role="group" aria-label={prompt}>
      <span className={ui.confirmText}>{prompt}</span>
      <button
        ref={confirmRef}
        type="button"
        className={clsx(ui.button, ui.small, ui.dangerSolid)}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            // Redirecting actions resolve to nothing; the navigation is the outcome.
            const result: AnyState | undefined = await run();
            if (!result) return;
            setState(result);
            setAsking(false);
          })
        }
      >
        {pending ? <LoaderCircle size={14} className={ui.spin} aria-hidden /> : null}
        {confirmLabel}
      </button>
      <button type="button" className={clsx(ui.button, ui.small, ui.ghost)} disabled={pending} onClick={() => setAsking(false)}>
        취소
      </button>
    </span>
  );
}

/** Copies an absolute link to a school page. */
export function CopyLinkButton({ path, label = "링크 복사", className }: { path: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  useEffect(() => {
    if (copied === "idle") return;
    const timer = setTimeout(() => setCopied("idle"), 2400);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className={className ?? ui.button}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
          setCopied("done");
        } catch {
          setCopied("failed");
        }
      }}
    >
      {copied === "done" ? <Check size={16} aria-hidden /> : <Link2 size={16} aria-hidden />}
      <span aria-live="polite">{copied === "done" ? "복사했어요" : copied === "failed" ? "복사하지 못했어요" : label}</span>
    </button>
  );
}

/** A select inside a GET filter form that applies itself on change. */
export function AutoSubmitSelect(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={clsx(ui.select, props.className)}
      onChange={(event) => {
        props.onChange?.(event);
        event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
