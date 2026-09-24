"use client";

import { deleteCaseAction } from "../../server/actions";
import { ConfirmAction } from "../ui/ConfirmAction";

export function DeleteCase({ caseId }: { caseId: string }) {
  return <ConfirmAction size="small" quiet label="내리기" question="게시판에서 내릴까요?" confirmLabel="내리기" run={() => deleteCaseAction({ caseId })} />;
}
