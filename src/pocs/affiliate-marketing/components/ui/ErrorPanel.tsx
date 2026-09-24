"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Page, ui } from "./primitives";
import styles from "./states.module.css";

/** Error boundary body: says what happened, offers retry and a way home. */
export function ErrorPanel({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <Page>
      <div className={styles.state} role="alert">
        <h1 className={styles.stateTitle}>화면을 불러오지 못했어요</h1>
        <span className={styles.stateSticker} aria-hidden>
          점검 중
        </span>
        <p className={styles.stateBody}>
          잠깐 연결이 끊겼거나 데이터를 읽는 중에 문제가 생겼어요. 입력한 기록은 그대로 남아 있어요. 다시 시도해도 계속되면 잠시 후에
          들어와 주세요.
        </p>
        {error.digest ? <p className={styles.stateCode}>오류 코드 {error.digest}</p> : null}
        <div className={styles.stateActions}>
          <button type="button" className={ui.primary} onClick={() => retry()}>
            <RotateCcw aria-hidden />
            다시 시도
          </button>
          <Link href="/affiliate-marketing" className={ui.base}>
            대시보드로
          </Link>
        </div>
      </div>
    </Page>
  );
}
