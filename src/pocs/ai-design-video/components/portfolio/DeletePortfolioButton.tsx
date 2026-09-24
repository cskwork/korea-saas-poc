"use client";

import { Trash2 } from "lucide-react";
import { deletePortfolioAction } from "../../server/actions";
import { ConfirmButton } from "../ui/ConfirmButton";

export function DeletePortfolioButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmButton
      title="포트폴리오에서 내릴까요?"
      description={`‘${title}’ 작업이 포트폴리오에서 지워져요. 연결된 주문은 그대로 남아요.`}
      confirmLabel="작업 삭제"
      onConfirm={() => deletePortfolioAction({ id })}
    >
      <Trash2 size={15} aria-hidden="true" />
      포트폴리오에서 삭제
    </ConfirmButton>
  );
}
