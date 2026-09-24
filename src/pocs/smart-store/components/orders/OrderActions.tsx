"use client";

import clsx from "clsx";
import { PackageCheck, X } from "lucide-react";
import type { OrderStatus } from "../../domain/orders";
import { advanceOrderStep, cancelOrderAction } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";
import { ConfirmOrderButton } from "./ConfirmOrderButton";
import { ShipForm } from "./ShipForm";
import styles from "./orders.module.css";

/** The next step for an order, plus cancel while the parcel has not left. */
export function OrderActions({ id, status, orderNo }: { id: string; status: OrderStatus; orderNo: string }) {
  const cancel = (
    <ActionButton
      action={cancelOrderAction}
      input={{ id }}
      className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
      aria-label={`주문 ${orderNo} 취소`}
      confirm={{
        title: "이 주문을 취소할까요?",
        text: "구매자에게 취소가 안내되고 되돌릴 수 없어요. 도매처에 발주했다면 도매처 취소도 함께 해 주세요.",
        confirmLabel: "주문 취소",
        danger: true,
      }}
    >
      <X size={14} strokeWidth={2} aria-hidden />
      취소
    </ActionButton>
  );

  if (status === "new") {
    return (
      <div className={styles.actions}>
        <ConfirmOrderButton orderId={id} small />
        {cancel}
      </div>
    );
  }
  if (status === "confirmed") {
    return (
      <div className={styles.actions}>
        <ShipForm orderId={id} />
        {cancel}
      </div>
    );
  }
  if (status === "shipping") {
    return (
      <div className={styles.actions}>
        <ActionButton action={advanceOrderStep} input={{ id }} className={clsx(ui.btn, ui.btnSm)}>
          <PackageCheck size={14} strokeWidth={2} aria-hidden />
          배송 완료
        </ActionButton>
      </div>
    );
  }
  return null;
}
