import clsx from "clsx";
import { measureFont } from "../fonts";
import theme from "./theme.module.css";

/** DevFlow's root: tokens, the measuring face and themed browser surfaces for every route. */
export function ModuleRoot({ children }: { children: React.ReactNode }) {
  return <div className={clsx(theme.root, measureFont.variable)}>{children}</div>;
}

/** The client-facing register (public profile): white paper, graphite ink. */
export function PaperRoot({ children }: { children: React.ReactNode }) {
  return <div className={theme.paper}>{children}</div>;
}
