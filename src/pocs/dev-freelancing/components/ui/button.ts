import clsx from "clsx";
import ui from "./ui.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** Class list for a button or a link styled as one. */
export function buttonClass(variant: ButtonVariant = "secondary", options: { small?: boolean; iconOnly?: boolean } = {}) {
  return clsx(
    ui.btn,
    variant === "primary" && ui.primary,
    variant === "ghost" && ui.ghost,
    variant === "danger" && ui.danger,
    options.small && ui.small,
    options.iconOnly && ui.iconOnly,
  );
}
