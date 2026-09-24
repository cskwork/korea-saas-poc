"use client";

import { writeComment } from "../../server/actions";
import { buttonClass } from "../ui/button";
import { TextAreaField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useFormSubmit } from "../ui/useFormSubmit";
import styles from "./board.module.css";

export function CommentForm({ postId, as, name }: { postId: string; as: "editor" | "reader"; name: string }) {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(writeComment, {
    resetOnSuccess: true,
    toast: true,
  });
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.commentForm} aria-label="댓글 쓰기">
      <input type="hidden" name="as" value={as} />
      <input type="hidden" name="postId" value={postId} />
      <TextAreaField label={`${name}(으)로 댓글 쓰기`} name="body" rows={3} required maxLength={1000} error={fieldError("body")} />
      <div className={styles.composerActions}>
        <button type="submit" className={buttonClass("primary", "sm")} disabled={pending}>
          {pending ? "다는 중…" : "댓글 달기"}
        </button>
        <FormMessage state={state} showSuccess={false} />
      </div>
    </form>
  );
}
