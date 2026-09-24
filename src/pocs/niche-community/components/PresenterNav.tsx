"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./post.module.css";

export const SLIDE_NEXT = "slide-next";
export const SLIDE_PREVIOUS = "slide-previous";

interface PresenterNavProps {
  backHref: string;
  previousHref: string | null;
  nextHref: string | null;
  /** 1-based position in the current feed list, when known. */
  position: number | null;
  total: number | null;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));

/**
 * 발표 모드: step through the current feed like a deck — ← / → keys, swipes on touch
 * screens, or the buttons. Each step is a navigation typed for the slide-push transition.
 */
export function PresenterNav({ backHref, previousHref, nextHref, position, total }: PresenterNavProps) {
  const router = useRouter();
  const touch = useRef<{ x: number; y: number } | null>(null);
  // The listeners are bound once; the current neighbours are read from a ref so a key
  // pressed right after a step never falls into an unbind/rebind gap.
  const targets = useRef({ previousHref, nextHref });
  useEffect(() => {
    targets.current = { previousHref, nextHref };
  }, [previousHref, nextHref]);

  useEffect(() => {
    const go = (direction: "previous" | "next") => {
      const href = direction === "next" ? targets.current.nextHref : targets.current.previousHref;
      if (href) router.push(href, { transitionTypes: [direction === "next" ? SLIDE_NEXT : SLIDE_PREVIOUS] });
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || isTyping(event.target)) return;
      if (event.key === "ArrowRight") go("next");
      if (event.key === "ArrowLeft") go("previous");
    };
    const onTouchStart = (event: TouchEvent) => {
      const point = event.touches[0];
      touch.current = isTyping(event.target) ? null : { x: point.clientX, y: point.clientY };
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touch.current;
      touch.current = null;
      const point = event.changedTouches[0];
      if (!start || !point) return;
      const dx = point.clientX - start.x;
      const dy = point.clientY - start.y;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      go(dx < 0 ? "next" : "previous");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return (
    <nav className={styles.presenter} aria-label="발표 모드">
      <Link href={backHref} className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        피드로
      </Link>
      <div className={styles.stepper}>
        {previousHref ? (
          <Link href={previousHref} className={styles.step} transitionTypes={[SLIDE_PREVIOUS]} aria-label="이전 글">
            <ChevronLeft size={18} aria-hidden="true" />
          </Link>
        ) : (
          <span className={styles.step} aria-hidden="true" data-disabled="true">
            <ChevronLeft size={18} />
          </span>
        )}
        {position !== null && total !== null ? (
          <span className={styles.counter} aria-label={`${total}개 중 ${position}번째 글`}>
            <span className={styles.counterNow}>{position}</span>
            <span aria-hidden="true"> / </span>
            {total}
          </span>
        ) : null}
        {nextHref ? (
          <Link href={nextHref} className={styles.step} transitionTypes={[SLIDE_NEXT]} aria-label="다음 글">
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ) : (
          <span className={styles.step} aria-hidden="true" data-disabled="true">
            <ChevronRight size={18} />
          </span>
        )}
      </div>
      <p className={styles.keys}>
        <kbd>←</kbd> <kbd>→</kbd> 키나 옆으로 밀어서 넘기기
      </p>
    </nav>
  );
}
