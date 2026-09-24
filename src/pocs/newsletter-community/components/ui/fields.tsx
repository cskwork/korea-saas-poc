"use client";

import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./ui.module.css";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Hide the label visually (it still names the control). */
  hideLabel?: boolean;
}

function useFieldIds(error?: string, hint?: string) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, hintId, errorId, describedBy: [errorId, hintId].filter(Boolean).join(" ") || undefined };
}

function Chrome({
  id,
  label,
  hint,
  error,
  hintId,
  errorId,
  className,
  hideLabel,
  children,
}: FieldChrome & { id: string; hintId?: string; errorId?: string; children: React.ReactNode }) {
  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={id} className={clsx(styles.label, hideLabel && styles.srOnly)}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, className, hideLabel, ...input }: FieldChrome & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(error, hint);
  return (
    <Chrome {...{ label, hint, error, className, hideLabel }} {...ids}>
      <input
        id={ids.id}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...input}
      />
    </Chrome>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  hideLabel,
  children,
  ...select
}: FieldChrome & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(error, hint);
  return (
    <Chrome {...{ label, hint, error, className, hideLabel }} {...ids}>
      <select
        id={ids.id}
        className={styles.select}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...select}
      >
        {children}
      </select>
    </Chrome>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  hideLabel,
  ...textarea
}: FieldChrome & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ids = useFieldIds(error, hint);
  return (
    <Chrome {...{ label, hint, error, className, hideLabel }} {...ids}>
      <textarea
        id={ids.id}
        className={styles.textarea}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...textarea}
      />
    </Chrome>
  );
}
