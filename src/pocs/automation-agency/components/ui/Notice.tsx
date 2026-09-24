import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import clsx from "clsx";
import type { ActionState } from "@/core/actions";
import ui from "./ui.module.css";

type Tone = "ok" | "error" | "info";

export function Notice({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  const Icon = tone === "ok" ? CircleCheck : tone === "error" ? CircleAlert : Info;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        ui.notice,
        tone === "ok" ? ui.noticeOk : tone === "error" ? ui.noticeError : ui.noticeInfo,
        className,
      )}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Renders an action's outcome (success message or error) in a live region. */
export function ActionNotice<T>({ state, className }: { state: ActionState<T>; className?: string }) {
  if (state.status === "success" && state.message)
    return (
      <Notice tone="ok" className={className}>
        {state.message}
      </Notice>
    );
  if (state.status === "error")
    return (
      <Notice tone="error" className={className}>
        {state.message}
      </Notice>
    );
  return <span role="status" className={ui.srOnly} />;
}
