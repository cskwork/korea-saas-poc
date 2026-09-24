import styles from "./ui.module.css";

/** ids for aria-describedby: the hint and error paragraphs a Field renders. */
export function describedBy(id: string, parts: { hint?: boolean; error?: string }): string | undefined {
  const ids = [parts.hint ? `${id}-hint` : null, parts.error ? `${id}-error` : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/** Label, control, hint and error for one input. The control is passed as children with matching ids. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}>선택</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A radio group drawn as a strip of segments. */
export function Segmented<T extends string>({
  name,
  legend,
  options,
  defaultValue,
  value,
  onChange,
  error,
  renderOption,
}: {
  name: string;
  legend: string;
  options: readonly T[];
  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
  error?: string;
  renderOption: (option: T) => React.ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <fieldset className={styles.segmented} aria-describedby={error ? errorId : undefined}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.segments}>
        {options.map((option) => (
          <label key={option} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={option}
              {...(value !== undefined ? { checked: value === option } : { defaultChecked: defaultValue === option })}
              onChange={onChange ? () => onChange(option) : undefined}
            />
            <span>{renderOption(option)}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
