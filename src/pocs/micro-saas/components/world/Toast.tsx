"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./toast.module.css";

interface ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
  tone?: "info" | "error";
}

interface ToastState extends ToastOptions {
  id: number;
  message: string;
}

type Show = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<Show>(() => {});

/** Ink bar at the bottom of the sheet, with an optional 되돌리기 action. */
export function ToastProvider({ children, aboveTabBar = false }: { children: ReactNode; aboveTabBar?: boolean }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const counter = useRef(0);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback<Show>(
    (message, options = {}) => {
      clearTimeout(timer.current);
      counter.current += 1;
      setToast({ id: counter.current, message, ...options });
      timer.current = setTimeout(hide, options.onAction ? 7000 : 3600);
    },
    [hide],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`${styles.region}${aboveTabBar ? ` ${styles.aboveTabBar}` : ""}`} role="status" aria-live="polite">
        {toast ? (
          <div key={toast.id} className={`${styles.toast}${toast.tone === "error" ? ` ${styles.error}` : ""}`}>
            <span>{toast.message}</span>
            {toast.onAction ? (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  hide();
                  toast.onAction?.();
                }}
              >
                {toast.actionLabel ?? "되돌리기"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Show {
  return useContext(ToastContext);
}
