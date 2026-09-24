import Link from "next/link";
import { feedSearch } from "../domain/inputs";
import { canPostIn, hasPremiumAccess } from "../domain/rules";
import type { getFeedPage } from "../server/queries";
import { ChannelAgenda } from "./ChannelAgenda";
import { Composer } from "./Composer";
import { FeedControls } from "./FeedControls";
import { FeedRail } from "./FeedRail";
import { PostSlide } from "./PostSlide";
import { StageBand } from "./StageBand";
import styles from "./feed.module.css";
import ui from "./ui.module.css";

type FeedData = Awaited<ReturnType<typeof getFeedPage>>;

/** The light table: stage band, agenda of channels, the blank slide, then the slides. */
export function FeedPage({ data }: { data: FeedData }) {
  const { query, feed, channels, viewer, now } = data;
  const channel = channels.find((item) => item.id === query.channelId) ?? null;
  const total = channels.reduce((sum, item) => sum + item.postCount, 0);
  const search = feedSearch({ channelId: query.channelId, sort: query.sort, q: query.q });
  const heading = channel?.name ?? "모든 채널";

  return (
    <>
      <StageBand meetup={data.nextMeetup} viewer={viewer} now={now} />
      <div className={styles.layout}>
        <div className={styles.agendaArea}>
          <ChannelAgenda channels={channels} query={query} total={total} />
        </div>
        <div className={styles.feedArea}>
          <header className={styles.feedHeader}>
            <h1 className={styles.feedTitle}>{heading}</h1>
            <p className={styles.feedLead}>
              {channel
                ? channel.description || "채널 설명이 아직 없어요."
                : "초기 창업가들이 숫자와 경험으로 나누는 글. 대외비 표시는 프리미엄 멤버에게만 열려요."}
            </p>
          </header>
          <FeedControls query={query} />
          <Composer
            channels={channels.map((item) => ({ ...item, writable: canPostIn(viewer, item) }))}
            defaultChannelId={query.channelId}
            allowance={data.allowance}
            canPublishPremium={hasPremiumAccess(viewer)}
          />
          {query.q ? (
            <p className={styles.resultNote} role="status">
              ‘{query.q}’ 검색 결과 {feed.items.length}
              {feed.hasMore ? "개 이상" : "개"}
            </p>
          ) : null}
          {feed.items.length ? (
            <ol className={styles.slides} aria-label={`${heading} 글`}>
              {feed.items.map((post) => (
                <li key={post.id}>
                  <PostSlide post={post} search={search} now={now} />
                </li>
              ))}
            </ol>
          ) : (
            <div className={`${ui.slide} ${styles.empty}`}>
              <p className={styles.emptyTitle}>{query.q ? "찾는 글이 없어요" : "아직 이 채널에 글이 없어요"}</p>
              <p className={styles.emptyText}>
                {query.q
                  ? "다른 단어로 검색하거나 모든 채널에서 찾아보세요."
                  : "위의 빈 슬라이드에 첫 글을 올려 보세요. 제목 한 줄이면 시작할 수 있어요."}
              </p>
              {query.q || query.channelId ? (
                <Link href="/niche-community" className={`${ui.button} ${ui.small}`}>
                  모든 채널 보기
                </Link>
              ) : null}
            </div>
          )}
          {feed.hasMore ? (
            <Link
              href={`/niche-community${feedSearch({ ...query, limit: query.limit + 12 })}`}
              className={`${ui.button} ${styles.more}`}
              scroll={false}
            >
              슬라이드 더 보기
            </Link>
          ) : null}
        </div>
        <div className={styles.railArea}>
          <FeedRail viewer={viewer} allowance={data.allowance} nextBadge={data.nextBadge} popular={data.popular} />
        </div>
      </div>
    </>
  );
}
