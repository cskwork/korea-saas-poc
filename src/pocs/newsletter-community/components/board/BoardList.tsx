import Link from "next/link";
import clsx from "clsx";
import { MessageSquare, Pin } from "lucide-react";
import { formatNumber, formatRelative } from "@/core/format";
import { BOARD_CATEGORIES, BOARD_CATEGORY_LABEL, canParticipate, categoriesFor, type BoardActor, type BoardCategory } from "../../domain/board";
import { excerpt } from "../../domain/markup";
import type { PostSummary } from "../../server/store/board";
import { EmptyState } from "../ui/EmptyState";
import ui from "../ui/ui.module.css";
import { LikeButton } from "./LikeButton";
import { PostComposer } from "./PostComposer";
import styles from "./board.module.css";

export interface BoardListProps {
  base: string;
  as: "editor" | "reader";
  posts: PostSummary[];
  counts: Record<BoardCategory, number>;
  category?: BoardCategory;
  actor: BoardActor | null;
  /** Shown instead of the composer when the viewer cannot post. */
  locked?: React.ReactNode;
}

export function BoardList({ base, as, posts, counts, category, actor, locked }: BoardListProps) {
  const total = counts.notice + counts.discussion + counts.question;
  const participant = canParticipate(actor);
  return (
    <div className={styles.board}>
      <div className={styles.boardBar}>
        <nav className={styles.tabs} aria-label="말머리">
          <Link href={base} className={styles.tab} aria-current={!category ? "page" : undefined}>
            전체 <span>{formatNumber(total)}</span>
          </Link>
          {BOARD_CATEGORIES.map((key) => (
            <Link
              key={key}
              href={`${base}?category=${key}`}
              className={styles.tab}
              aria-current={category === key ? "page" : undefined}
            >
              {BOARD_CATEGORY_LABEL[key]} <span>{formatNumber(counts[key])}</span>
            </Link>
          ))}
        </nav>
        {participant && actor ? <PostComposer as={as} categories={categoriesFor(actor)} /> : locked}
      </div>

      {posts.length === 0 ? (
        <EmptyState title="아직 글이 없어요">
          {category === "notice"
            ? "공지는 에디터만 쓸 수 있어요. 모임 안내나 휴간 소식을 올려 보세요."
            : "첫 이야기나 질문을 올려 보세요. 유료 구독자와 에디터가 함께 읽어요."}
        </EmptyState>
      ) : (
        <ol className={styles.list} role="list">
          {posts.map((post) => (
            <li key={post.id} className={clsx(styles.item, post.pinned && styles.pinned)}>
              <div className={styles.itemHead}>
                <span className={clsx(ui.tag, post.category === "notice" && ui.tagSolid)}>
                  {BOARD_CATEGORY_LABEL[post.category]}
                </span>
                {post.pinned && (
                  <span className={styles.pinMark}>
                    <Pin size={13} aria-hidden />
                    고정
                  </span>
                )}
              </div>
              <h2 className={styles.itemTitle}>
                <Link href={`${base}/${post.id}`}>{post.title}</Link>
              </h2>
              <p className={styles.itemExcerpt}>{excerpt(post.body, 110)}</p>
              <div className={styles.itemMeta}>
                <span>
                  {post.authorName}
                  {post.authorRole === "editor" && <span className={styles.editorMark}>에디터</span>}
                </span>
                <span>{formatRelative(post.createdAt)}</span>
                <span className={styles.metaIcon}>
                  <MessageSquare size={13} aria-hidden />
                  댓글 {formatNumber(post.commentCount)}
                </span>
                <LikeButton postId={post.id} liked={post.liked} count={post.likeCount} as={as} disabled={!participant} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
