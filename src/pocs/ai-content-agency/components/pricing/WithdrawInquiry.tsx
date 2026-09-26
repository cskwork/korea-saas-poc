"use client";

import { deleteInquiryAction } from "../../server/actions";
import { ConfirmAction } from "../ui/ConfirmAction";

export function WithdrawInquiry({ inquiryId }: { inquiryId: string }) {
  return (
    <ConfirmAction
      size="small"
      quiet
      label="거두기"
      question="이 문의를 거둘까요?"
      confirmLabel="거두기"
      run={() => deleteInquiryAction({ inquiryId })}
    />
  );
}
