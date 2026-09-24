import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatRelative, formatTime } from "@/core/format";
import { BOARD_CATEGORY_LABEL, canDelete, canParticipate, type BoardActor } from "../../domain/board";
import type { PostDetail } from "../../server/store/board";
import { buttonClass } from "../ui/button";
import ui from "../ui/ui.module.css";
import { CommentForm } from "./CommentForm";
import { LikeButton } from "./LikeButton";
import { DeleteCommentButton, DeletePostButton, PinButton } from "./PostTools";
import styles from "./board.module.css";

export function PostView({
  post,
  actor,
  base,
  as,
  locked,
}: {
  post: PostDetail;
  actor: BoardActor | null;
  base: string;
  as: "editor" | "reader";
  locked?: React.ReactNode;
}) {
  const participant = canParticipate(actor);
  return (
    <article className={styles.post} aria-labelledby="post-title">
      <Link href={base} className={buttonClass("quiet", "sm", styles.back)}>
        <ArrowLeft size={16} aria-hidden />
        독자 마당
      </Link>
      <header className={styles.postHead}>
        <span className={clsx(ui.tag, post.category === "notice" && ui.tagSolid)}>{BOARD_CATEGORY_LABEL[post.category]}</span>
        <h1 id="post-title" className={styles.postTitle}>
          {post.title}
        </h1>
        <p className={styles.postByline}>
          <strong>{post.authorName}</strong>
          {post.authorRole === "editor" && <span className={styles.editorMark}>에디터</span>}
          <span>
            <time dateTime={post.createdAt.toISOString()}>
              {formatDate(post.createdAt)} {formatTime(post.createdAt)}
            </time>
          </span>
        </p>
      </header>
      <div className={styles.postBody}>{post.body}</div>
      <div className={styles.postActions}>
        <LikeButton postId={post.id} liked={post.liked} count={post.likeCount} as={as} disabled={!participant} />
        {actor?.role === "editor" && <PinButton postId={post.id} pinned={post.pinned} />}
        {canDelete(actor, post) && <DeletePostButton postId={post.id} as={as} title={post.title} />}
      </div>

      <section className={styles.thread} aria-labelledby="comments-title">
        <h2 id="comments-title" className={styles.threadTitle}>
          댓글 {post.comments.length}
        </h2>
        {post.comments.length === 0 ? (
          <p className={styles.quiet}>아직 댓글이 없어요.</p>
        ) : (
          <ol className={styles.comments} role="list">
            {post.comments.map((comment) => (
              <li key={comment.id} className={styles.comment}>
                <div className={styles.commentHead}>
                  <strong>{comment.authorName}</strong>
                  {comment.authorRole === "editor" && <span className={styles.editorMark}>에디터</span>}
                  <span>{formatRelative(comment.createdAt)}</span>
                  {canDelete(actor, comment) && <DeleteCommentButton commentId={comment.id} as={as} />}
                </div>
                <p className={styles.commentBody}>{comment.body}</p>
              </li>
            ))}
          </ol>
        )}
        {participant && actor ? <CommentForm postId={post.id} as={as} name={actor.name} /> : locked}
      </section>
    </article>
  );
}
