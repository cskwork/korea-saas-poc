"use client";

import clsx from "clsx";
import { Pause, Play, Trash2 } from "lucide-react";
import { deleteProductAction, setProductStatusAction } from "../../server/actions";
import { ActionButton, ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";

export function ProductRowActions({ id, status, showDelete = true }: { id: string; status: "on_sale" | "paused"; showDelete?: boolean }) {
  const next = status === "on_sale" ? "paused" : "on_sale";
  return (
    <>
      <ActionButton
        run={() => setProductStatusAction({ productId: id, status: next })}
        className={clsx(ui.button, ui.small, ui.ghost)}
        pendingLabel="바꾸는 중"
        showSuccess={false}
      >
        {next === "paused" ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        {next === "paused" ? "판매 중지" : "다시 판매"}
      </ActionButton>
      {showDelete ? (
        <ConfirmButton
          run={() => deleteProductAction({ id })}
          label="삭제"
          confirmLabel="삭제"
          prompt="판매 기록은 남아요."
          icon={<Trash2 size={14} aria-hidden />}
          className={clsx(ui.button, ui.small, ui.ghost, ui.danger)}
        />
      ) : null}
    </>
  );
}
