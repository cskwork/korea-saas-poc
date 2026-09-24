"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "../server/actions";
import styles from "./slide.module.css";

/** 좋아요 with an optimistic count; the server's answer (and revalidation) settles it. */
export function LikeButton({ postId, liked, count }: { postId: string; liked: boolean; count: number }) {
  const [optimistic, setOptimistic] = useOptimistic({ liked, count });
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = () =>
    startTransition(async () => {
      setError(null);
      setOptimistic({ liked: !optimistic.liked, count: optimistic.count + (optimistic.liked ? -1 : 1) });
      const result = await toggleLikeAction({ id: postId });
      if (result.status === "error") setError(result.message);
    });

  return (
    <>
      <button
        type="button"
        className={styles.action}
        data-active={optimistic.liked}
        aria-pressed={optimistic.liked}
        aria-label={`좋아요 ${optimistic.count}개${optimistic.liked ? ", 내가 누름" : ""}`}
        onClick={toggle}
      >
        <Heart size={16} aria-hidden="true" fill={optimistic.liked ? "currentColor" : "none"} />
        <span className={styles.count}>{optimistic.count}</span>
      </button>
      {error ? (
        <span role="alert" className={styles.actionError}>
          {error}
        </span>
      ) : null}
    </>
  );
}
