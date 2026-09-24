"use client";

import { useActionState } from "react";
import { idleState } from "@/core/actions";
import { deleteProjectAction } from "../../server/actions";
import { ConfirmSubmit } from "../ui/ConfirmSubmit";
import { ActionNotice } from "../ui/Notice";
import ui from "../ui/ui.module.css";

export function DeleteProject({ id, clientName }: { id: string; clientName: string }) {
  const [state, action] = useActionState(deleteProjectAction, idleState);
  return (
    <form action={action} className={ui.formFoot}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        label="프로젝트 삭제"
        question={`‘${clientName}’ 프로젝트를 지울까요? 연결된 워크플로는 남아요.`}
      />
      <ActionNotice state={state} />
    </form>
  );
}
