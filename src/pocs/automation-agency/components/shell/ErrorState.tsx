"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { buttonClass, ui } from "../ui/classes";

/** Route error boundary body: says what happened and offers a retry. */
export function ErrorState({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={ui.empty} aria-labelledby="aa-error-title">
      <svg viewBox="0 0 160 36" aria-hidden="true" focusable="false">
        <path d="M10 18h54" stroke="var(--aa-ink-3)" strokeWidth="6" />
        <path d="M96 18h54" stroke="var(--aa-ink-3)" strokeWidth="6" />
        <path d="M70 8l20 20M90 8L70 28" stroke="var(--aa-danger)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <h1 id="aa-error-title" className={ui.emptyTitle}>
        운행이 잠시 멈췄어요
      </h1>
      <p>화면을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.{error.digest ? ` (오류 코드 ${error.digest})` : ""}</p>
      <button type="button" className={buttonClass("primary")} onClick={() => retry()}>
        <RotateCcw size={16} aria-hidden="true" />
        다시 시도
      </button>
    </section>
  );
}
