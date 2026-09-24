"use client";

import clsx from "clsx";
import { Trash2, Undo2 } from "lucide-react";
import { deleteLearnerAction, refundPaymentAction } from "../../server/actions";
import { ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";

export function RefundButton({ paymentId, kind }: { paymentId: string; kind: "course" | "product" }) {
  return (
    <ConfirmButton
      run={() => refundPaymentAction({ id: paymentId })}
      label="환불"
      confirmLabel="환불 처리"
      prompt={kind === "course" ? "수강도 함께 종료돼요." : "환불할까요?"}
      icon={<Undo2 size={14} aria-hidden />}
      className={clsx(ui.button, ui.small, ui.ghost)}
    />
  );
}

export function DeleteLearner({ id, name }: { id: string; name: string }) {
  return (
    <section className={ui.dangerZone} aria-label="수강생 정보 삭제">
      <div>
        <h2 className={ui.sectionTitle}>수강생 정보 삭제</h2>
        <p>{name}님의 이름, 이메일, 수강 기록을 지워요. 결제 금액은 수익 분석에 익명으로 남아요.</p>
      </div>
      <ConfirmButton
        run={() => deleteLearnerAction({ id })}
        label="정보 삭제"
        confirmLabel="영구 삭제"
        prompt="되돌릴 수 없어요."
        icon={<Trash2 size={15} aria-hidden />}
        className={clsx(ui.button, ui.danger)}
      />
    </section>
  );
}
