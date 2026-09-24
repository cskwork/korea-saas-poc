"use client";

import clsx from "clsx";
import { ClipboardCheck } from "lucide-react";
import { advanceOrderStep } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";

/** 신규주문 → 발주확인: the seller has placed the order with the wholesaler. */
export function ConfirmOrderButton({ orderId, small }: { orderId: string; small?: boolean }) {
  return (
    <ActionButton
      action={advanceOrderStep}
      input={{ id: orderId }}
      className={clsx(ui.btn, ui.btnPop, small && ui.btnSm)}
    >
      <ClipboardCheck size={small ? 14 : 16} strokeWidth={2} aria-hidden />
      발주 확인
    </ActionButton>
  );
}
