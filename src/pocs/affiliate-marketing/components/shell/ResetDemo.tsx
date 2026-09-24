"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { resetDemoAction } from "../../server/actions";
import { ConfirmAction } from "../ui/actions";

/** "데모 데이터 초기화": restores the sample workspace after a confirmation step. */
export function ResetDemo() {
  const [done, setDone] = useState<string | null>(null);
  return (
    <span>
      <ConfirmAction
        tone="base"
        label={
          <>
            <RotateCcw aria-hidden />
            데모 데이터 초기화
          </>
        }
        question="직접 추가한 링크와 기록이 모두 지워져요. 초기화할까요?"
        confirmLabel="초기화"
        onConfirm={async () => {
          const result = await resetDemoAction({});
          setDone(result.status === "success" ? (result.message ?? null) : null);
          return result;
        }}
      />
      {done ? (
        <span role="status" aria-live="polite">
          {" "}
          {done}
        </span>
      ) : null}
    </span>
  );
}
