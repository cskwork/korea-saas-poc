"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClass } from "./buttons";
import styles from "./ui.module.css";

/** Copies text to the clipboard and says so for two seconds. */
export function CopyButton({
  text,
  label = "복사",
  variant = "secondary",
  size = "regular",
}: {
  text: string;
  label?: string;
  variant?: "primary" | "secondary" | "quiet";
  size?: "regular" | "small";
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <>
      <button type="button" className={buttonClass(variant, size)} onClick={copy}>
        {state === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
        {state === "copied" ? "복사했어요" : label}
      </button>
      <span className={styles.srOnly} role="status">
        {state === "copied" ? "클립보드에 복사했어요." : state === "failed" ? "복사하지 못했어요. 직접 선택해 복사해 주세요." : ""}
      </span>
    </>
  );
}
