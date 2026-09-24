"use client";

import { RotateCw } from "lucide-react";
import clsx from "clsx";
import ui from "../ui/ui.module.css";
import styles from "./states.module.css";

/** Route error boundary body: says what failed and offers a retry. */
export function ErrorState({
  error,
  retry,
  title = "화면을 불러오지 못했어요",
  standalone = false,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
  /** Rendered outside a shell (module-level boundary): adds page padding. */
  standalone?: boolean;
}) {
  return (
    <section className={clsx(styles.state, standalone && styles.standalone)} role="alert">
      <h1 className={styles.stateTitle}>{title}</h1>
      <p className={styles.stateText}>
        잠시 연결이 불안정했을 수 있어요. 다시 시도해도 계속되면 조금 뒤에 새로고침해 주세요.
        {error.digest ? <span className={styles.digest}> 오류 코드 {error.digest}</span> : null}
      </p>
      <button type="button" className={clsx(ui.button, ui.primary)} onClick={() => retry()}>
        <RotateCw size={16} aria-hidden />
        다시 시도
      </button>
    </section>
  );
}
