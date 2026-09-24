"use client";

import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import { resetDemoData } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";
import styles from "./shell.module.css";

export function ResetDemoButton() {
  return (
    <ActionButton
      action={resetDemoData}
      input={{}}
      className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
      confirm={{
        title: "샘플 데이터를 처음으로 되돌릴까요?",
        text: "직접 등록한 상품, 주문 처리 내역, 계산 기록과 저장한 키워드가 모두 지워지고 처음 샘플로 바뀌어요.",
        confirmLabel: "초기화",
        danger: true,
      }}
    >
      <RotateCcw size={14} strokeWidth={2} aria-hidden />
      <span className={styles.long}>데모 데이터 초기화</span>
      <span className={styles.short}>초기화</span>
    </ActionButton>
  );
}
