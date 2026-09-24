"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import ui from "./ui.module.css";

/** The blank-screen slide for failures: what happened, and the two ways out. */
export function ErrorSlide({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  return (
    <div className={`${ui.page} ${ui.pageNarrow}`}>
      <section className={ui.stageSlide} role="alert" aria-labelledby="nc-error-title">
        <h1 id="nc-error-title" className={ui.stageSlideTitle}>
          이 화면을 불러오지 못했어요
        </h1>
        <p className={ui.stageSlideText}>
          잠깐 연결이 불안정했을 수 있어요. 다시 시도해도 같다면 피드로 돌아가 다른 화면부터 열어 주세요.
          {digest ? <span className={ui.stageSlideDigest}> 오류 코드 {digest}</span> : null}
        </p>
        <div className={ui.stageSlideActions}>
          <button type="button" className={`${ui.button} ${ui.stageSlidePrimary}`} onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            다시 시도
          </button>
          <Link href="/niche-community" className={`${ui.button} ${ui.stageSlideSecondary}`}>
            피드로 가기
          </Link>
        </div>
      </section>
    </div>
  );
}
