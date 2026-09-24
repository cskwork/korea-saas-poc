"use client";

import { Trash2 } from "lucide-react";
import { deleteSocialPostAction } from "../../server/actions";
import { ConfirmAction } from "../ui/actions";

export function DeletePost({ id }: { id: string }) {
  return (
    <ConfirmAction
      label={
        <>
          <Trash2 aria-hidden />
          세트 삭제
        </>
      }
      question="게시물 4개를 모두 삭제할까요?"
      confirmLabel="삭제"
      onConfirm={() => deleteSocialPostAction({ id })}
    />
  );
}
