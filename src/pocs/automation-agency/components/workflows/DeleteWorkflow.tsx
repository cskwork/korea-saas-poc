"use client";

import { useActionState } from "react";
import { idleState } from "@/core/actions";
import { deleteWorkflowAction } from "../../server/actions";
import { ConfirmSubmit } from "../ui/ConfirmSubmit";
import { ActionNotice } from "../ui/Notice";
import ui from "../ui/ui.module.css";

export function DeleteWorkflow({ id }: { id: string }) {
  const [state, action] = useActionState(deleteWorkflowAction, idleState);
  return (
    <form action={action} className={ui.formFoot}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit label="워크플로 삭제" question="노선도와 모든 역이 지워져요. 삭제할까요?" />
      <ActionNotice state={state} />
    </form>
  );
}
