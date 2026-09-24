import type { ReactNode } from "react";
import theme from "../theme.module.css";

/** Scopes the module's tokens and browser-surface theming. */
export function ModuleRoot({ children }: { children: ReactNode }) {
  return <div className={theme.root}>{children}</div>;
}
