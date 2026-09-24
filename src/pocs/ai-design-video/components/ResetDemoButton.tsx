"use client";

import { useState } from "react";
import { resetDemoAction } from "../server/actions";
import { ConfirmButton } from "./ui/ConfirmButton";
import ui from "./ui.module.css";

export function ResetDemoButton() {
  const [message, setMessage] = useState<string>();
  return (
    <div>
      <ConfirmButton
        buttonClassName={ui.quiet}
        title="샘플 데이터를 처음 상태로 되돌릴까요?"
        description="직접 추가하거나 바꾼 주문, 콘티, 포트폴리오, 가격, 목표가 모두 지워지고 처음 샘플로 바뀌어요."
        confirmLabel="데모 데이터 초기화"
        onConfirm={() => resetDemoAction({})}
        onDone={(state) => setMessage(state.status === "success" ? state.message : undefined)}
      >
        데모 데이터 초기화
      </ConfirmButton>
      <span role="status" aria-live="polite" className={ui.hint}>
        {message}
      </span>
    </div>
  );
}
