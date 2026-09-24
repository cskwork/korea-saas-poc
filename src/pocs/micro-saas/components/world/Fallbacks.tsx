"use client";

import Link from "next/link";
import { EmptyState } from "./EmptyState";
import ui from "./ui.module.css";
import styles from "./empty.module.css";

/** A segment failed to load: say so plainly and offer another try. */
export function ErrorSheet({ retry, digest }: { retry: () => void; digest?: string }) {
  return (
    <div className={ui.sheet} role="alert">
      <EmptyState
        title="예약장을 펼치지 못했어요"
        action={
          <div className={styles.actions}>
            <button type="button" className={`${ui.btn} ${ui.ink}`} onClick={() => retry()}>
              다시 시도
            </button>
            <Link className={`${ui.btn} ${ui.line}`} href="/micro-saas">
              대시보드로
            </Link>
          </div>
        }
      >
        잠시 연결이 고르지 않았을 수 있어요. 다시 시도해도 같으면 조금 뒤에 열어 주세요.
        {digest ? <span className={styles.digest}>오류 번호 {digest}</span> : null}
      </EmptyState>
    </div>
  );
}
