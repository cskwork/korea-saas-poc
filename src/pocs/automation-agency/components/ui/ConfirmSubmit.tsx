"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import clsx from "clsx";
import { SubmitButton } from "./SubmitButton";
import ui from "./ui.module.css";

/**
 * A destructive submit that asks inline first (no modal): the first press reveals
 * the consequence and the real submit button.
 */
export function ConfirmSubmit({
  label,
  question,
  confirmLabel = "삭제",
  small,
  icon = <Trash2 size={15} aria-hidden="true" />,
}: {
  label: string;
  question: ReactNode;
  confirmLabel?: string;
  small?: boolean;
  icon?: ReactNode;
}) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className={clsx(ui.btn, ui.danger, small && ui.small)} onClick={() => setAsking(true)}>
        {icon}
        {label}
      </button>
    );
  }
  return (
    <span className={ui.formFoot} role="group" aria-label={label}>
      <span className={ui.error}>{question}</span>
      <SubmitButton variant="dangerSolid" small={small} pendingLabel="처리 중…">
        {confirmLabel}
      </SubmitButton>
      <button
        type="button"
        className={clsx(ui.btn, ui.ghost, small && ui.small)}
        onClick={() => setAsking(false)}
        autoFocus
      >
        취소
      </button>
    </span>
  );
}
