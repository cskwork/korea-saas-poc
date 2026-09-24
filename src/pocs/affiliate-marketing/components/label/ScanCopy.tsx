"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { code39Bars } from "../../domain/barcode";
import styles from "./label.module.css";

/**
 * 스캔 복사: the label's barcode is the copy button. Pressing it sweeps a red
 * scanner line across the bars and copies the tracked short link.
 */
export function ScanCopy({ code, url, className }: { code: string; url: string; className?: string }) {
  const [state, setState] = useState<"idle" | "scanned" | "failed">("idle");
  const ref = useRef<HTMLButtonElement>(null);
  const { bars, width } = code39Bars(code);

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function scan() {
    ref.current?.style.setProperty("--scan-width", `${ref.current.offsetWidth}px`);
    try {
      await navigator.clipboard.writeText(url);
      setState("scanned");
    } catch {
      setState("failed");
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.scan, className)}
      data-state={state}
      onClick={scan}
      title={url}
      aria-label={`짧은 링크 복사: ${url}`}
    >
      <svg className={styles.bars} viewBox={`0 0 ${width} 30`} preserveAspectRatio="none" aria-hidden>
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={30} fill="currentColor" />
        ))}
      </svg>
      <span className={styles.code}>{code}</span>
      <span className={styles.laser} aria-hidden />
      {state !== "idle" ? (
        <span className={clsx(styles.scanned, state === "failed" && styles.failed)} role="status">
          {state === "scanned" ? "복사됨" : "복사 실패"}
        </span>
      ) : null}
    </button>
  );
}
