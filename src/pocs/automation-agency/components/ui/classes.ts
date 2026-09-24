import clsx from "clsx";
import ui from "./ui.module.css";

type Variant = "primary" | "secondary" | "danger" | "ghost";

/** Class names for a link or button styled as a button. */
export function buttonClass(variant: Variant = "secondary", options: { small?: boolean } = {}) {
  return clsx(ui.btn, ui[variant], options.small && ui.small);
}

export { ui };
