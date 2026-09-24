"use client";

import { RotateCcw } from "lucide-react";
import { paths } from "./paths";
import ui from "./ui.module.css";
import styles from "./states.module.css";

/** The sheet could not be drawn: explain, offer a retry and a way back. */
export function StudioError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className={styles.state} role="alert">
      <h1 className={styles.title}>이 콘티를 불러오지 못했어요</h1>
      <p className={styles.text}>
        데이터베이스 연결이 잠시 끊겼거나 요청이 실패했어요. 다시 시도해도 같으면 잠시 후에 열어 주세요.
      </p>
      {error.digest && <p className={styles.code}>오류 번호 {error.digest}</p>}
      <div className={styles.actions}>
        <button type="button" className={ui.button} onClick={() => retry()}>
          <RotateCcw size={16} aria-hidden="true" />
          다시 시도
        </button>
        <a href={paths.today} className={[ui.button, ui.secondary].join(" ")}>
          오늘의 콘티로
        </a>
      </div>
    </div>
  );
}
