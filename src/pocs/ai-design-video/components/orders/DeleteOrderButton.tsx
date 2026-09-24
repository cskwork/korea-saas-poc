"use client";

import { Trash2 } from "lucide-react";
import { deleteOrderAction } from "../../server/actions";
import { ConfirmButton } from "../ui/ConfirmButton";

export function DeleteOrderButton({ orderId, title }: { orderId: string; title: string }) {
  return (
    <ConfirmButton
      title="이 주문을 삭제할까요?"
      description={`‘${title}’ 주문과 수정 기록, 진행 기록, AI 콘티가 모두 지워지고 되돌릴 수 없어요. 매출 분석에서도 빠져요.`}
      confirmLabel="주문 삭제"
      onConfirm={() => deleteOrderAction({ orderId })}
    >
      <Trash2 size={15} aria-hidden="true" />
      삭제
    </ConfirmButton>
  );
}
