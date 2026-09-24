import ui from "./ui.module.css";

const errorId = (id: string) => `nc-${id}-error`;

/** aria wiring for a field that may carry a validation message. */
export function fieldProps(id: string, messages: string[] | undefined) {
  return messages?.length ? { "aria-invalid": true, "aria-describedby": errorId(id) } : {};
}

export function FieldError({ id, messages }: { id: string; messages: string[] | undefined }) {
  if (!messages?.length) return null;
  return (
    <p id={errorId(id)} className={ui.fieldError}>
      {messages[0]}
    </p>
  );
}
