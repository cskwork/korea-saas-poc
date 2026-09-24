import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import ui from "./ui.module.css";

export interface ControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}

/**
 * Label + control + hint + error, wired for assistive tech: the control gets
 * `aria-describedby` pointing at the hint and error, and `aria-invalid` on error.
 */
export function Field({
  id,
  label,
  hint,
  errors,
  optional,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  errors?: string[];
  optional?: boolean;
  className?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const error = errors?.[0];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className ? `${ui.field} ${className}` : ui.field}>
      <label htmlFor={id} className={ui.label}>
        {label}
        {optional ? <span className={ui.optional}>(선택)</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint ? (
        <p id={`${id}-hint`} className={ui.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={ui.error}>
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
