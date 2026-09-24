import ui from "./ui.module.css";

export interface FieldA11y {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
}

interface FieldProps {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  errors?: string[];
  className?: string;
  children: (a11y: FieldA11y) => React.ReactNode;
}

/** Label, control, hint and error, wired together with ids for assistive tech. */
export function Field({ id, label, hint, errors, className, children }: FieldProps) {
  const error = errors?.[0];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className ? `${ui.field} ${className}` : ui.field}>
      <label className={ui.label} htmlFor={id}>
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? (
        <p id={`${id}-hint`} className={ui.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={ui.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
