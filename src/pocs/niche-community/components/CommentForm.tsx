"use client";

import { useActionState, useState } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { LIMITS } from "../domain/inputs";
import { addCommentAction } from "../server/actions";
import { FieldError, fieldProps } from "./FieldError";
import styles from "./post.module.css";
import ui from "./ui.module.css";

export function CommentForm({ postId }: { postId: string }) {
  const [sent, setSent] = useState(0);
  const [state, submit, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await addCommentAction(previous, formData);
    if (result.status === "success") setSent((count) => count + 1);
    return result;
  }, idleState);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <form action={submit} className={styles.commentForm} noValidate>
      <input type="hidden" name="postId" value={postId} />
      <label htmlFor="nc-comment-body" className={ui.label}>
        댓글 남기기
      </label>
      <textarea
        key={sent}
        id="nc-comment-body"
        name="body"
        className={ui.textarea}
        rows={3}
        maxLength={LIMITS.comment}
        placeholder="질문이나 경험을 나눠 주세요"
        required
        {...fieldProps("comment-body", errors?.body)}
      />
      <FieldError id="comment-body" messages={errors?.body} />
      <div className={styles.commentFormRow}>
        <p role={state.status === "error" ? "alert" : "status"} className={`${ui.status} ${state.status === "error" ? ui.statusError : ui.statusSuccess}`}>
          {state.status === "error" && !errors ? state.message : state.status === "success" ? state.message : null}
        </p>
        <button type="submit" className={`${ui.button} ${ui.primary}`} disabled={pending} aria-busy={pending}>
          {pending ? "등록하는 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}
