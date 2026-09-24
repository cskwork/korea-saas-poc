"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { likePost } from "../../server/actions";
import { useToast } from "../ui/Toaster";
import styles from "./board.module.css";

/** 좋아요, applied optimistically; the server's count replaces the guess. */
export function LikeButton({
  postId,
  liked,
  count,
  as,
  disabled,
}: {
  postId: string;
  liked: boolean;
  count: number;
  as: "editor" | "reader";
  disabled?: boolean;
}) {
  const [state, setOptimistic] = useOptimistic({ liked, count }, (_current, next: { liked: boolean; count: number }) => next);
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  const toggle = () =>
    startTransition(async () => {
      const next = !state.liked;
      setOptimistic({ liked: next, count: state.count + (next ? 1 : -1) });
      const result = await likePost({ as, postId, liked: next });
      if (result.status === "error") report(result);
    });

  return (
    <button
      type="button"
      className={styles.like}
      aria-pressed={state.liked}
      onClick={toggle}
      disabled={disabled || pending}
      title={disabled ? "유료 구독자와 에디터가 누를 수 있어요" : undefined}
    >
      <Heart size={16} aria-hidden fill={state.liked ? "currentColor" : "none"} />
      좋아요 <span className={styles.likeCount}>{state.count}</span>
    </button>
  );
}
