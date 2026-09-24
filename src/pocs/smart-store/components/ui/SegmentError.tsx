"use client";

import clsx from "clsx";
import { RotateCcw } from "lucide-react";
import { EmptyState } from "./EmptyState";
import ui from "./ui.module.css";

/** error.tsx body: says what happened and offers a retry of the segment. */
export function SegmentError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className={ui.slip} role="alert">
      <EmptyState
        title="화면을 불러오지 못했어요."
        action={
          <button type="button" className={clsx(ui.btn, ui.btnPop)} onClick={() => retry()}>
            <RotateCcw size={16} strokeWidth={2} aria-hidden />
            다시 시도
          </button>
        }
      >
        잠시 뒤 다시 시도해 주세요. 계속되면 데모 데이터를 초기화해 보세요.
        {error.digest ? <span className={ui.muted}> (오류 코드 {error.digest})</span> : null}
      </EmptyState>
    </div>
  );
}
