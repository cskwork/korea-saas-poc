"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { clearCalculationsAction, deleteCalculationAction } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";

export function DeleteCalculationButton({ id, label }: { id: string; label: string }) {
  return (
    <ActionButton
      action={deleteCalculationAction}
      input={{ id }}
      className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
      aria-label={`${label} 기록 지우기`}
    >
      <Trash2 size={14} strokeWidth={2} aria-hidden />
    </ActionButton>
  );
}

export function ClearHistoryButton({ count }: { count: number }) {
  return (
    <ActionButton
      action={clearCalculationsAction}
      input={{}}
      className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
      confirm={{
        title: "계산 기록을 모두 지울까요?",
        text: `기록 ${count}건이 모두 지워지고 되돌릴 수 없어요.`,
        confirmLabel: "모두 지우기",
        danger: true,
      }}
    >
      기록 모두 지우기
    </ActionButton>
  );
}
