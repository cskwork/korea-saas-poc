import { CircleAlert, CircleCheck, Info } from "lucide-react";
import styles from "./ui.module.css";

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

/** Inline feedback. Always rendered inside a live region by its caller or with role="status". */
export function Notice({ tone, children }: { tone: keyof typeof ICONS; children: React.ReactNode }) {
  const Icon = ICONS[tone];
  return (
    <p className={styles.notice} data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
