import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./ui.module.css";

interface FieldFrame {
  /** Unique id of the control; the hint and error ids derive from it. */
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: string[];
  className?: string;
}

function describedBy(id: string, hint: unknown, errors?: string[]) {
  const ids = [hint ? `${id}-hint` : null, errors?.length ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

function Frame({ id, label, hint, errors, className, children }: FieldFrame & { children: ReactNode }) {
  return (
    <div className={clsx(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <span className={styles.hint} id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {errors?.length ? (
        <span className={styles.error} id={`${id}-error`}>
          {errors[0]}
        </span>
      ) : null}
    </div>
  );
}

type InputProps = FieldFrame & Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & { numeric?: boolean };

export function InputField({ id, label, hint, errors, className, numeric, ...input }: InputProps) {
  return (
    <Frame id={id} label={label} hint={hint} errors={errors} className={className}>
      <input
        id={id}
        className={clsx(styles.input, numeric && styles.numeric)}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        {...(numeric ? { inputMode: "numeric" as const } : {})}
        {...input}
      />
    </Frame>
  );
}

type SelectProps = FieldFrame & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & { children: ReactNode };

export function SelectField({ id, label, hint, errors, className, children, ...select }: SelectProps) {
  return (
    <Frame id={id} label={label} hint={hint} errors={errors} className={className}>
      <select
        id={id}
        className={styles.select}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        {...select}
      >
        {children}
      </select>
    </Frame>
  );
}

type TextAreaProps = FieldFrame & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export function TextAreaField({ id, label, hint, errors, className, ...textarea }: TextAreaProps) {
  return (
    <Frame id={id} label={label} hint={hint} errors={errors} className={className}>
      <textarea
        id={id}
        className={styles.textarea}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy(id, hint, errors)}
        {...textarea}
      />
    </Frame>
  );
}
