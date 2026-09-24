import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatRelative } from "@/core/format";
import { deleteCommentAction } from "../server/actions";
import type { PostView } from "../server/types";
import { ConfirmButton } from "./ActionButtons";
import { Avatar } from "./Avatar";
import { CommentForm } from "./CommentForm";
import styles from "./post.module.css";
import ui from "./ui.module.css";

/** Q&A after the slide: the comments, and the form to add one. */
export function Comments({ post, now }: { post: PostView; now: Date }) {
  return (
    <section id="comments" className={styles.comments} aria-labelledby="nc-comments-title">
      <h2 id="nc-comments-title" className={styles.commentsTitle}>
        질의응답 <span className={styles.commentsCount}>댓글 {post.commentCount}개</span>
      </h2>
      {post.locked ? (
        <p className={styles.commentsLocked}>대외비 글의 댓글은 프리미엄 멤버에게만 보여요.</p>
      ) : (
        <>
          {post.comments.length ? (
            <ol className={styles.commentList}>
              {post.comments.map((comment) => (
                <li key={comment.id} className={styles.comment}>
                  <Avatar
                    id={comment.author.id}
                    nickname={comment.author.nickname}
                    size="md"
                    operator={comment.author.role === "operator"}
                  />
                  <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                      <Link href={`/niche-community/members/${comment.author.id}`} className={styles.commentAuthor}>
                        {comment.author.nickname}
                      </Link>
                      {comment.author.role === "operator" ? <span className={ui.tag}>운영자</span> : null}
                      <time dateTime={comment.createdAt.toISOString()}>{formatRelative(comment.createdAt, now)}</time>
                      {comment.canDelete ? (
                        <span className={styles.commentTools}>
                          <ConfirmButton
                            run={deleteCommentAction.bind(null, { id: comment.id })}
                            question="이 댓글을 삭제할까요?"
                            confirmLabel="삭제할게요"
                            className={styles.commentDelete}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            삭제
                          </ConfirmButton>
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.commentText}>{comment.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.commentsEmpty}>아직 질문이 없어요. 첫 댓글로 대화를 시작해 보세요.</p>
          )}
          <CommentForm postId={post.id} />
        </>
      )}
    </section>
  );
}
