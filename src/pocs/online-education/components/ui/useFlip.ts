"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Blocks slide to their new place instead of jumping (FLIP): after each change
 * of `version`, every `[data-flip="<id>"]` element inside `root` animates from
 * where it was. Positions are measured relative to `root`, so page scroll never
 * reads as movement. Reduced motion shows the end state.
 */
export function useFlip(root: RefObject<HTMLElement | null>, version: unknown) {
  const previous = useRef(new Map<string, { x: number; y: number }>());

  useLayoutEffect(() => {
    const container = root.current;
    if (!container) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const origin = container.getBoundingClientRect();
    const next = new Map<string, { x: number; y: number }>();

    container.querySelectorAll<HTMLElement>("[data-flip]").forEach((element) => {
      const id = element.dataset.flip;
      if (!id) return;
      const rect = element.getBoundingClientRect();
      const position = { x: rect.left - origin.left + container.scrollLeft, y: rect.top - origin.top + container.scrollTop };
      next.set(id, position);
      const before = previous.current.get(id);
      if (reduce || !before) return;
      const dx = before.x - position.x;
      const dy = before.y - position.y;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
        duration: 240,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
    });
    previous.current = next;
  }, [root, version]);
}
