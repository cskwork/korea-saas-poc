import Link from "next/link";
import { formatDate } from "@/core/format";
import type { BadgeStatus } from "../domain/badges";
import type { PostingAllowance } from "../domain/rules";
import type { FeedItem, ViewerInfo } from "../server/types";
import { Avatar } from "./Avatar";
import { BadgeIcon } from "./BadgeIcon";
import { personaLabel } from "./labels";
import styles from "./feed.module.css";
import ui from "./ui.module.css";

interface FeedRailProps {
  viewer: ViewerInfo;
  allowance: PostingAllowance;
  nextBadge: (BadgeStatus & { remaining: number }) | null;
  popular: FeedItem[];
}

/** The presenter's side notes: whose tag you wear, what you can still do today, what is popular. */
export function FeedRail({ viewer, allowance, nextBadge, popular }: FeedRailProps) {
  return (
    <aside className={styles.rail} aria-label="내 명찰과 인기 글">
      <section className={`${ui.slide} ${styles.card}`} aria-labelledby="nc-rail-me">
        <div className={styles.me}>
          <Avatar id={viewer.id} nickname={viewer.nickname} size="lg" operator={viewer.role === "operator"} />
          <div>
            <h2 id="nc-rail-me" className={styles.meName}>
              <Link href={`/niche-community/members/${viewer.id}`}>{viewer.nickname}</Link>
            </h2>
            <p className={styles.meRole}>
              {personaLabel(viewer)} · {formatDate(viewer.joinedAt)} 합류
            </p>
          </div>
        </div>
        <dl className={styles.facts}>
          <div>
            <dt>오늘 쓸 수 있는 글</dt>
            <dd className={ui.num}>{allowance.limit === null ? "제한 없음" : `${allowance.left} / ${allowance.limit}`}</dd>
          </div>
          {nextBadge ? (
            <div>
              <dt>다음 뱃지</dt>
              <dd className={styles.nextBadge}>
                <BadgeIcon badge={nextBadge.key} size={14} />
                {nextBadge.name}까지 {nextBadge.remaining}
                {nextBadge.key === "regular" ? "회" : "개"}
              </dd>
            </div>
          ) : null}
        </dl>
        {viewer.role === "member" && viewer.tier === "free" ? (
          <Link href="/niche-community/membership" className={`${ui.button} ${ui.small}`}>
            대외비 채널 열기
          </Link>
        ) : null}
      </section>
      {popular.length ? (
        <section className={styles.popular} aria-labelledby="nc-rail-popular">
          <h2 id="nc-rail-popular" className={styles.railTitle}>
            반응이 뜨거운 글
          </h2>
          <ol className={styles.popularList}>
            {popular.map((post) => (
              <li key={post.id}>
                <Link href={`/niche-community/posts/${post.id}?sort=popular`} className={styles.popularLink}>
                  {post.title}
                </Link>
                <span className={styles.popularMeta}>
                  {post.channel.name} · 좋아요 {post.likeCount} · 댓글 {post.commentCount}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </aside>
  );
}
