"use client";

import { useTransition } from "react";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { pinPost, removeComment, removePost } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { ConfirmAction } from "../ui/ConfirmAction";
import { useToast } from "../ui/Toaster";

export function PinButton({ postId, pinned }: { postId: string; pinned: boolean }) {
  const [pending, startTransition] = useTransition();
  const { report } = useToast();
  return (
    <button
      type="button"
      className={buttonClass("secondary", "sm")}
      disabled={pending}
      onClick={() => startTransition(async () => report(await pinPost({ id: postId, pinned: !pinned })))}
    >
      {pinned ? <PinOff size={14} aria-hidden /> : <Pin size={14} aria-hidden />}
      {pinned ? "고정 풀기" : "맨 위에 고정"}
    </button>
  );
}

export function DeletePostButton({ postId, as, title }: { postId: string; as: "editor" | "reader"; title: string }) {
  return (
    <ConfirmAction
      variant="danger"
      title="이 글을 지울까요?"
      description={`‘${title}’과(와) 달린 댓글, 좋아요가 모두 지워져요.`}
      confirmLabel="글 지우기"
      run={() => removePost({ as, id: postId })}
    >
      <Trash2 size={14} aria-hidden />
      지우기
    </ConfirmAction>
  );
}

export function DeleteCommentButton({ commentId, as }: { commentId: string; as: "editor" | "reader" }) {
  return (
    <ConfirmAction
      variant="quiet"
      label="댓글 지우기"
      title="이 댓글을 지울까요?"
      description="지운 댓글은 되돌릴 수 없어요."
      confirmLabel="댓글 지우기"
      run={() => removeComment({ as, id: commentId })}
    >
      <Trash2 size={14} aria-hidden />
    </ConfirmAction>
  );
}
