"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import clsx from "clsx";
import ui from "./ui.module.css";

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";

/** Submit button that shows the form's pending state. */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  small,
  icon,
  className,
  name,
  value,
  pending: pendingOverride,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  small?: boolean;
  icon?: ReactNode;
  className?: string;
  name?: string;
  value?: string;
  /** Pending state when the form is dispatched manually (see useActionForm). */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingOverride || status.pending;
  return (
    <button
      type="submit"
      name={name}
      value={value}
      className={clsx(ui.btn, ui[variant], small && ui.small, className)}
      disabled={pending}
      aria-disabled={pending || undefined}
    >
      {pending ? <LoaderCircle size={16} aria-hidden="true" className={ui.spin} /> : icon}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
