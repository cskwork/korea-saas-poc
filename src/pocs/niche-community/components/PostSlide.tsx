import Link from "next/link";
import { Lock, MessageSquare, Pin } from "lucide-react";
import { formatNumber, formatRelative } from "@/core/format";
import type { FeedItem } from "../server/types";
import { Avatar } from "./Avatar";
import { ChannelIcon } from "./ChannelIcon";
import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import styles from "./slide.module.css";
import ui from "./ui.module.css";

interface PostSlideProps {
  post: FeedItem;
  /** Feed filters carried into the post so 발표 모드 steps through the same list. */
  search: string;
  now: Date;
}

/** One post as a slide: meta line, action title, excerpt (or the covered 대외비 slide), deck footer. */
export function PostSlide({ post, search, now }: PostSlideProps) {
  const href = `/niche-community/posts/${post.id}${search}`;
  return (
    <article className={`${ui.slide} ${styles.slide}`} aria-labelledby={`nc-post-${post.id}`}>
      <p className={styles.meta}>
        <span className={styles.channel}>
          <ChannelIcon icon={post.channel.icon} size={14} />
          {post.channel.name}
        </span>
        <span className={styles.author}>
          <Avatar id={post.author.id} nickname={post.author.nickname} size="sm" operator={post.author.role === "operator"} />
          <Link href={`/niche-community/members/${post.author.id}`} className={styles.authorLink}>
            {post.author.nickname}
          </Link>
          {post.author.role === "operator" ? <span className={ui.tag}>운영자</span> : null}
        </span>
        <time dateTime={post.createdAt.toISOString()} className={styles.time}>
          {formatRelative(post.createdAt, now)}
          {post.edited ? " · 수정됨" : ""}
        </time>
      </p>
      <h3 id={`nc-post-${post.id}`} className={styles.title}>
        <Link href={href} className={styles.titleLink}>
          {post.title}
        </Link>
      </h3>
      {post.locked ? (
        <div className={styles.cover}>
          <p className={styles.coverText}>
            <Lock size={16} aria-hidden="true" />
            프리미엄 멤버에게 공개된 슬라이드예요
          </p>
          <p className={styles.coverMeta}>
            본문 {formatNumber(post.bodyLength)}자 · 댓글 {post.commentCount}개
          </p>
          <Link href="/niche-community/membership" className={`${ui.button} ${ui.small} ${styles.coverCta}`}>
            프리미엄으로 열기
          </Link>
        </div>
      ) : (
        <p className={styles.excerpt}>{post.excerpt}</p>
      )}
      <footer className={styles.foot}>
        {post.locked ? (
          <span className={styles.static} aria-label={`좋아요 ${post.likeCount}개`}>
            <span className={styles.count}>좋아요 {post.likeCount}</span>
          </span>
        ) : (
          <LikeButton postId={post.id} liked={post.likedByViewer} count={post.likeCount} />
        )}
        <Link href={`${href}#comments`} className={styles.action} aria-label={`댓글 ${post.commentCount}개`}>
          <MessageSquare size={16} aria-hidden="true" />
          <span className={styles.count}>{post.commentCount}</span>
        </Link>
        <ShareButton path={`/niche-community/posts/${post.id}`} />
        <span className={styles.marks}>
          {post.pinned ? (
            <span className={`${ui.tag} ${ui.tagInk}`}>
              <Pin aria-hidden="true" />
              공지
            </span>
          ) : null}
          {post.premiumOnly ? (
            <span className={`${ui.tag} ${ui.secret}`}>
              <Lock aria-hidden="true" />
              대외비
            </span>
          ) : null}
        </span>
      </footer>
    </article>
  );
}
