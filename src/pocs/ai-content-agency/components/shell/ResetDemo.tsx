"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { resetDemoAction } from "../../server/actions";
import { ConfirmAction } from "../ui/ConfirmAction";

/** Restores this workspace's sample data (asks first). */
export function ResetDemo() {
  const [done, setDone] = useState(false);
  return (
    <div>
      {done ? null : (
        <ConfirmAction
          size="small"
          label={
            <>
              <RotateCcw size={14} aria-hidden="true" />
              데모 데이터 초기화
            </>
          }
          question="지금까지 바꾼 내용이 모두 사라져요."
          confirmLabel="초기화"
          run={async () => {
            const result = await resetDemoAction({});
            if (result.status === "success") setDone(true);
            return result;
          }}
        />
      )}
      <span role="status">{done ? "데모 데이터를 처음 상태로 되돌렸어요." : ""}</span>
    </div>
  );
}
