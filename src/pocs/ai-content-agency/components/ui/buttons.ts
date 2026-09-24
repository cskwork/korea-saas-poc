import styles from "./ui.module.css";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "dangerSolid";

/** Class names for a button or a link drawn as one. */
export function buttonClass(variant: Variant = "secondary", size: "regular" | "small" = "regular"): string {
  return [styles.button, styles[variant], size === "small" ? styles.small : ""].filter(Boolean).join(" ");
}

export const uiStyles = styles;
