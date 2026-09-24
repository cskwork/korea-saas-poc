import clsx from "clsx";
import styles from "./ui.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "dangerSolid";

/** Class names for a button or a link styled as one. */
export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "sm" = "md", extra?: string) {
  return clsx(
    styles.button,
    variant !== "primary" && styles[variant],
    size === "sm" && styles.small,
    extra,
  );
}
