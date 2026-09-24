import clsx from "clsx";
import { CircleAlert, Check, Info } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./ui.module.css";

const ICON = { ok: Check, error: CircleAlert, info: Info } as const;
const TONE = { ok: styles.noticeOk, error: styles.noticeError, info: styles.noticeInfo } as const;

export function Notice({ tone, children, id }: { tone: keyof typeof ICON; children: ReactNode; id?: string }) {
  const Icon = ICON[tone];
  return (
    <p className={clsx(styles.notice, TONE[tone])} id={id} role={tone === "error" ? "alert" : "status"}>
      <Icon size={16} strokeWidth={2} aria-hidden />
      <span>{children}</span>
    </p>
  );
}
