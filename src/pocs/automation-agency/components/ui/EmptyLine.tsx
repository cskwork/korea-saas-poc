import type { ReactNode } from "react";
import ui from "./ui.module.css";

/** Empty state: an unbuilt stretch of line, with what to do next. */
export function EmptyLine({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={ui.empty}>
      <svg viewBox="0 0 160 36" aria-hidden="true" focusable="false">
        <path d="M10 8v20" stroke="var(--aa-ink-3)" strokeWidth="3" strokeLinecap="round" />
        <path d="M10 18h60" stroke="var(--aa-ink-3)" strokeWidth="6" />
        <path d="M78 18h72" stroke="var(--aa-rule-strong)" strokeWidth="6" strokeDasharray="10 8" />
        <circle cx="70" cy="18" r="8" fill="#fff" stroke="var(--aa-ink-3)" strokeWidth="4" />
      </svg>
      <p className={ui.emptyTitle}>{title}</p>
      {children ? <p>{children}</p> : null}
      {action}
    </div>
  );
}
