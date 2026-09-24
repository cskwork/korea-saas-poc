import Form from "next/form";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { feedSearch, LIMITS, type FeedQuery } from "../domain/inputs";
import styles from "./feed.module.css";
import ui from "./ui.module.css";

/** Order (최신순 / 인기순) and search, both kept in the URL so every view is linkable. */
export function FeedControls({ query }: { query: FeedQuery }) {
  const sortHref = (sort: FeedQuery["sort"]) =>
    `/niche-community${feedSearch({ channelId: query.channelId, sort, q: query.q })}`;
  return (
    <div className={styles.controls}>
      <nav aria-label="정렬" className={styles.segmented}>
        <Link href={sortHref("latest")} aria-current={query.sort === "latest" ? "page" : undefined} scroll={false}>
          최신순
        </Link>
        <Link href={sortHref("popular")} aria-current={query.sort === "popular" ? "page" : undefined} scroll={false}>
          인기순
        </Link>
      </nav>
      <Form action="/niche-community" className={styles.search} role="search" scroll={false}>
        {query.channelId ? <input type="hidden" name="channel" value={query.channelId} /> : null}
        {query.sort === "popular" ? <input type="hidden" name="sort" value="popular" /> : null}
        <label htmlFor="nc-feed-search" className={ui.srOnly}>
          글 검색
        </label>
        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
        <input
          id="nc-feed-search"
          name="q"
          type="search"
          defaultValue={query.q}
          maxLength={LIMITS.search}
          placeholder="제목이나 본문으로 검색"
          className={`${ui.input} ${styles.searchInput}`}
        />
        {query.q ? (
          <Link
            href={`/niche-community${feedSearch({ channelId: query.channelId, sort: query.sort })}`}
            className={styles.clear}
            aria-label="검색어 지우기"
            scroll={false}
          >
            <X size={14} aria-hidden="true" />
          </Link>
        ) : null}
      </Form>
    </div>
  );
}
