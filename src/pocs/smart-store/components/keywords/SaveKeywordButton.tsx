"use client";

import clsx from "clsx";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { removeKeywordAction, saveKeywordAction } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";

/** Saves a keyword, or removes it when it is already saved. */
export function SaveKeywordButton({
  keyword,
  savedId,
  small = true,
}: {
  keyword: string;
  savedId?: string;
  small?: boolean;
}) {
  if (savedId) {
    return (
      <ActionButton
        action={removeKeywordAction}
        input={{ id: savedId }}
        className={clsx(ui.btn, ui.btnPop, small && ui.btnSm)}
        aria-label={`${keyword} 저장 취소`}
      >
        <BookmarkCheck size={14} strokeWidth={2} aria-hidden />
        저장됨
      </ActionButton>
    );
  }
  return (
    <ActionButton
      action={saveKeywordAction}
      input={{ keyword }}
      className={clsx(ui.btn, small && ui.btnSm)}
      aria-label={`${keyword} 저장`}
    >
      <BookmarkPlus size={14} strokeWidth={2} aria-hidden />
      저장
    </ActionButton>
  );
}
