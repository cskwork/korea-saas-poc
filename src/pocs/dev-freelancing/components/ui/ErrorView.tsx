"use client";

import { RotateCcw } from "lucide-react";
import { buttonClass } from "./button";
import { Cell } from "./Cells";
import styles from "./StatusView.module.css";

/** Unexpected failure inside the workspace: say what happened and offer a retry. */
export function ErrorView({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className={styles.view} role="alert">
      <div className={styles.cells} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <Cell key={i} state={i % 3 === 1 ? "warnSolid" : "hollow"} size={14} />
        ))}
      </div>
      <h1 className={styles.title}>화면을 불러오지 못했어요</h1>
      <p className={styles.text}>데이터베이스 연결이 잠깐 끊겼거나 요청이 실패했어요. 입력한 내용은 저장된 것까지 남아 있어요.</p>
      <div className={styles.actions}>
        <button type="button" className={buttonClass("primary")} onClick={() => retry()}>
          <RotateCcw size={14} aria-hidden="true" />
          다시 시도
        </button>
        <a href="/dev-freelancing" className={buttonClass("secondary")}>
          개요로
        </a>
      </div>
      {error.digest ? <p className={styles.digest}>오류 코드 {error.digest}</p> : null}
    </div>
  );
}
