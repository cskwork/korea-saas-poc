"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CircleAlert, Check } from "lucide-react";
import clsx from "clsx";
import styles from "./toast.module.css";

type Tone = "ok" | "error";
interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => {});

/** Short confirmations after an action ("발주를 확인했어요."), announced politely. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const show = useCallback((message: string, tone: Tone = "ok") => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDone={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDone(toast.id), toast.tone === "error" ? 6000 : 3500);
    return () => window.clearTimeout(timer);
  }, [onDone, toast.id, toast.tone]);
  const Icon = toast.tone === "error" ? CircleAlert : Check;
  return (
    <p className={clsx(styles.toast, toast.tone === "error" && styles.error)}>
      <Icon size={16} strokeWidth={2.25} aria-hidden />
      <span>{toast.message}</span>
    </p>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
