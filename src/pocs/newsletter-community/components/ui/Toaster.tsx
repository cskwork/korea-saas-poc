"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CircleAlert, Check } from "lucide-react";
import clsx from "clsx";
import type { ActionState } from "@/core/actions";
import styles from "./ui.module.css";

type Tone = "success" | "error";
interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}

interface ToastApi {
  show: (message: string, tone?: Tone) => void;
  /** Shows an action's outcome: its message on success, its error otherwise. */
  report: (state: ActionState<unknown>) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const TOAST_MS = 4200;

export function Toaster({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, tone: Tone = "success") => {
    const id = ++nextId.current;
    setItems((current) => [...current.slice(-2), { id, tone, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), TOAST_MS);
  }, []);

  const report = useCallback(
    (state: ActionState<unknown>) => {
      if (state.status === "error") show(state.message, "error");
      else if (state.status === "success" && state.message) show(state.message);
    },
    [show],
  );

  const api = useMemo(() => ({ show, report }), [show, report]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.toaster} role="status" aria-live="polite">
        {items.map((item) => (
          <p key={item.id} className={clsx(styles.toast, item.tone === "error" && styles.toastError)}>
            {item.tone === "error" ? <CircleAlert size={16} aria-hidden /> : <Check size={16} aria-hidden />}
            <span>{item.message}</span>
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <Toaster>");
  return api;
}
