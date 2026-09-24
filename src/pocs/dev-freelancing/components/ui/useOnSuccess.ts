"use client";

import { useEffect, useRef } from "react";
import type { ActionState } from "@/core/actions";

/** Calls `callback` once for each new successful action result (forms reset themselves in React 19). */
export function useOnSuccess<T>(state: ActionState<T>, callback: ((state: ActionState<T>) => void) | undefined) {
  const handled = useRef<ActionState<T> | null>(null);
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return;
    handled.current = state;
    latest.current?.(state);
  }, [state]);
}
