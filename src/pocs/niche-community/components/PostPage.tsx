import { ViewTransition } from "react";
import Link from "next/link";
import { Lock, Pin } from "lucide-react";
import { formatDate, formatNumber, formatTime } from "@/core/format";
import { feedSearch } from "../domain/inputs";
import { canPostIn, hasPremiumAccess } from "../domain/rules";
import type { getPostPage } from "../server/queries";
import { Avatar } from "./Avatar";
import { ChannelIcon } from "./ChannelIcon";
import { Comments } from "./Comments";
import { EditablePost } from "./EditablePost";
import { LikeButton } from "./LikeButton";
import { PresenterNav, SLIDE_NEXT, SLIDE_PREVIOUS } from "./PresenterNav";
import { ShareButton } from "./ShareButton";
import { personaLabel } from "./labels";
import styles from "./post.module.css";
import ui from "./ui.module.css";

type PostData = NonNullable<Awaited<ReturnType<typeof getPostPage>>>;

/** Presenter view: the slide in front, the previous and next slides beside it, Q&A below. */
export function PostPage({ data }: { data: PostData }) {
  const { post, neighbors, query, channels, viewer, previous, next, now } = data;
  const search = feedSearch({ channelId: query.channelId, sort: query.sort, q: query.q });
  const slideHref = (id: string | null | undefined) => (id ? `/niche-community/posts/${id}${search}` : null);

  return (
    <div className={styles.page}>
      <PresenterNav
        backHref={`/niche-community${search}`}
        previousHref={slideHref(neighbors?.previousId)}
        nextHref={slideHref(neighbors?.nextId)}
        position={neighbors ? neighbors.index + 1 : null}
        total={neighbors?.total ?? null}
      />
      <div className={styles.layout}>
        <div className={styles.main}>
          <ViewTransition
            key={post.id}
            enter={{ [SLIDE_NEXT]: styles.pushFromRight, [SLIDE_PREVIOUS]: styles.pushFromLeft, default: "none" }}
            exit={{ [SLIDE_NEXT]: styles.pushToLeft, [SLIDE_PREVIOUS]: styles.pushToRight, default: "none" }}
            default="none"
          >
            <article className={`${ui.slide} ${styles.slide}`} aria-labelledby="nc-post-title">
              <EditablePost
                post={{ ...post, body: post.body ?? "" }}
                channels={channels.map((channel) => ({ ...channel, writable: canPostIn(viewer, channel) }))}
                canEdit={post.canEdit && !post.locked}
                canDelete={post.canDelete}
                canPin={post.canPin}
                canPublishPremium={hasPremiumAccess(viewer)}
              >
                <p className={styles.meta}>
                  <Link href={`/niche-community${feedSearch({ channelId: post.channel.id })}`} className={styles.channel}>
                    <ChannelIcon icon={post.channel.icon} size={15} />
                    {post.channel.name}
                  </Link>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt)} {formatTime(post.createdAt)}
                  </time>
                  {post.edited ? <span>수정됨</span> : null}
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
                </p>
                <h1 id="nc-post-title" className={styles.title}>
                  {post.title}
                </h1>
                <p className={styles.byline}>
                  <Avatar id={post.author.id} nickname={post.author.nickname} size="md" operator={post.author.role === "operator"} />
                  <span className={styles.bylineText}>
                    <Link href={`/niche-community/members/${post.author.id}`} className={styles.bylineName}>
                      {post.author.nickname}
                    </Link>
                    <span className={styles.bylineHeadline}>
                      {personaLabel(post.author)}
                      {post.author.headline ? ` · ${post.author.headline}` : ""}
                    </span>
                  </span>
                </p>
                {post.locked ? (
                  <div className={styles.cover}>
                    <Lock size={22} aria-hidden="true" />
                    <p className={styles.coverTitle}>프리미엄 멤버에게 공개된 슬라이드예요</p>
                    <p className={styles.coverText}>
                      본문 {formatNumber(post.bodyLength)}자와 댓글 {post.commentCount}개가 있어요. 프리미엄 멤버십으로 대외비 채널의 모든 글을
                      읽고 쓸 수 있어요.
                    </p>
                    <Link href="/niche-community/membership" className={`${ui.button} ${styles.coverCta}`}>
                      멤버십 보기
                    </Link>
                  </div>
                ) : (
                  <div className={styles.body}>{post.body}</div>
                )}
                {post.locked ? null : (
                  <div className={styles.actions}>
                    <LikeButton postId={post.id} liked={post.likedByViewer} count={post.likeCount} />
                    <ShareButton path={`/niche-community/posts/${post.id}`} />
                  </div>
                )}
              </EditablePost>
            </article>
          </ViewTransition>
          <Comments post={post} now={now} />
        </div>
        <aside className={styles.side} aria-label="이전·다음 슬라이드">
          {[
            { label: "다음", slide: next, type: SLIDE_NEXT },
            { label: "이전", slide: previous, type: SLIDE_PREVIOUS },
          ].map(({ label, slide, type }) =>
            slide ? (
              <Link key={label} href={slideHref(slide.id) ?? "#"} className={styles.preview} transitionTypes={[type]}>
                <span className={styles.previewTitle}>{slide.title}</span>
                <span className={styles.previewChannel}>
                  {label === "다음" ? "다음 글 →" : "← 이전 글"} · {slide.channelName}
                </span>
              </Link>
            ) : null,
          )}
        </aside>
      </div>
    </div>
  );
}
