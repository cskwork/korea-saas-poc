"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./filters.module.css";

type Patch = Record<string, string | undefined>;

interface FilterContext {
  pending: boolean;
  /** Merges the patch into the URL (dropping `page`) and re-renders the server results. */
  update: (patch: Patch) => void;
}

const Context = createContext<FilterContext>({ pending: false, update: () => {} });

/** URL-driven filters: controls update the query string, results dim while the server re-renders. */
export function FilterScope({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("page");
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const query = next.toString();
      startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  return <Context.Provider value={{ pending, update }}>{children}</Context.Provider>;
}

export function useFilters() {
  return useContext(Context);
}

/** Wraps the results a filter scopes: keeps the previous render at reduced opacity while refetching. */
export function FilterResults({ children }: { children: ReactNode }) {
  const { pending } = useFilters();
  return (
    <div className={styles.results} data-pending={pending || undefined} aria-busy={pending || undefined}>
      {children}
    </div>
  );
}

/** Calls `fn` once the value has been stable for `delay` ms (search boxes, sliders). */
export function useDebounced<T>(fn: (value: T) => void, delay = 300) {
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  }, [fn]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return useCallback(
    (value: T) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => latest.current(value), delay);
    },
    [delay],
  );
}

/**
 * Local state for a filter control that follows the URL: it changes instantly
 * on input and resets whenever the server-rendered value changes (back button,
 * "clear filters" links).
 */
export function useSyncedState<T>(value: T): [T, (next: T) => void] {
  const [state, setState] = useState(value);
  const [previous, setPrevious] = useState(value);
  if (!Object.is(value, previous)) {
    setPrevious(value);
    setState(value);
  }
  return [state, setState];
}

/** Like useSyncedState for free text: follows the URL only when the filter is cleared, never mid-typing. */
export function useSearchText(value: string | undefined): [string, (next: string) => void] {
  const [state, setState] = useState(value ?? "");
  const [previous, setPrevious] = useState(value);
  if (value !== previous) {
    setPrevious(value);
    if (!value) setState("");
  }
  return [state, setState];
}
