import type { ReactNode } from "react";
import ui from "./ui.module.css";

/**
 * A printed 신청서 field: a paper label cell beside the writable cell. The error line sits
 * right under the box and is what the control's aria-describedby points at (`${id}-error`).
 */
export function Field({
  id,
  label,
  error,
  area = false,
  stack = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  area?: boolean;
  stack?: boolean;
  children: ReactNode;
}) {
  const classes = [ui.field, area ? ui.fieldArea : "", stack ? ui.fieldStack : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label className={classes} htmlFor={id}>
        <span className={ui.fieldLabel}>{label}</span>
        {children}
      </label>
      {error ? (
        <p id={`${id}-error`} className={ui.fieldError}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
