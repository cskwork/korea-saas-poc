import { cloneElement, isValidElement, useId } from "react";
import styles from "./forms.module.css";

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
};

/**
 * Label + control + hint + error, wired with aria-describedby / aria-invalid.
 * The single child is the control (input, select or textarea).
 */
export function Field({
  label,
  hint,
  error,
  optional,
  unit,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string[] | string;
  optional?: boolean;
  unit?: string;
  children: React.ReactElement<ControlProps>;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorText = Array.isArray(error) ? error[0] : error;
  const errorId = errorText ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        className: [styles.control, children.props.className].filter(Boolean).join(" "),
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": errorText ? true : undefined,
      })
    : children;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}>(선택)</span> : null}
      </label>
      {unit ? (
        <div className={styles.withUnit}>
          {control}
          <span className={styles.unit} aria-hidden>
            {unit}
          </span>
        </div>
      ) : (
        control
      )}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className={styles.error}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}

export const formStyles = styles;
