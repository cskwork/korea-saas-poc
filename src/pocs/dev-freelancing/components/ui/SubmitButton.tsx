"use client";

import clsx from "clsx";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonVariant } from "./button";
import ui from "./ui.module.css";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  small?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
}

/** A form's submit button: disabled with a progress label while the action runs. */
export function SubmitButton({ children, pendingLabel = "저장 중…", variant = "primary", small, disabled, name, value }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={clsx(buttonClass(variant, { small }), pending && ui.pending)}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
