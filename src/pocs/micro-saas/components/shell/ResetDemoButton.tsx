"use client";

import { resetDemoAction } from "../../server/actions";
import { ConfirmButton } from "../world/Dialog";
import ui from "../world/ui.module.css";

/** "데모 데이터 초기화": restores the sample shop after a confirmation slip. */
export function ResetDemoButton({ variant = "button" }: { variant?: "icon" | "button" }) {
  return (
    <ConfirmButton
      label={variant === "icon" ? "" : "데모 데이터 초기화"}
      icon="reset"
      className={variant === "icon" ? ui.iconBtn : `${ui.btn} ${ui.danger}`}
      title="샘플 데이터를 새로 만들까요?"
      body={
        <>
          <p>지금까지 적은 예약, 고객, 서비스와 매장 설정이 모두 지워지고 처음의 샘플 매장으로 돌아가요.</p>
          <p>이 브라우저의 체험 데이터에만 적용돼요.</p>
        </>
      }
      confirmLabel="초기화"
      run={() => resetDemoAction({})}
      ariaLabel={variant === "icon" ? "데모 데이터 초기화" : undefined}
    />
  );
}
