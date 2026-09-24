"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { removeKeywordAction } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";

export function RemoveSavedButton({ id, keyword, icon }: { id: string; keyword: string; icon: ReactNode }) {
  return (
    <ActionButton
      action={removeKeywordAction}
      input={{ id }}
      className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
      aria-label={`${keyword} 저장 취소`}
    >
      {icon}
    </ActionButton>
  );
}
