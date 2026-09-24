import Link from "next/link";
import { Sparkles } from "lucide-react";
import { formatRelative } from "@/core/format";
import { ARTICLE_KINDS, ARTICLE_KIND_HINT, ARTICLE_KIND_LABEL, CONTENT_SOURCE_LABEL, type ArticleKind } from "../../domain/catalog";
import type { ArticleSummary } from "../../server/content";
import type { LinkOption } from "../../server/links";
import { formStyles } from "../ui/Field";
import { Band, Chip, Empty, Page, Section, ui } from "../ui/primitives";
import { ArticleForm } from "./ArticleForm";
import styles from "./content.module.css";

export function ContentScreen({
  kind,
  options,
  articles,
  aiEnabled,
  deleted,
}: {
  kind: ArticleKind;
  options: LinkOption[];
  articles: ArticleSummary[];
  aiEnabled: boolean;
  deleted: boolean;
}) {
  return (
    <>
      <Band
        title="콘텐츠 만들기"
        lead="템플릿을 고르고 링크를 채우면 블로그 초안을 써서 보관함에 넣어 둬요. 초안에는 짧은 링크와 대가성 문구가 함께 들어가요."
      >
        <div className={styles.kinds}>
          <nav className={formStyles.segmented} aria-label="템플릿">
            {ARTICLE_KINDS.map((k) => (
              <Link
                key={k}
                href={k === "comparison" ? "/affiliate-marketing/content" : `/affiliate-marketing/content?kind=${k}`}
                className={formStyles.segment}
                aria-current={k === kind ? "page" : undefined}
                scroll={false}
              >
                {ARTICLE_KIND_LABEL[k]}
              </Link>
            ))}
          </nav>
          <p className={styles.kindHint}>{ARTICLE_KIND_HINT[kind]}</p>
          <p className={styles.aiNote}>
            <Sparkles aria-hidden />
            {aiEnabled ? "Claude가 초안을 써요. 응답이 없으면 기본 템플릿으로 대신 만들어요." : "AI 키가 설정되지 않아 기본 템플릿으로 초안을 만들어요."}
          </p>
        </div>
      </Band>
      <Page>
        {deleted ? (
          <p role="status" className={`${ui.noticeOk} ${ui.stamp}`}>
            초안을 삭제했어요.
          </p>
        ) : null}
        <div className={styles.layout}>
          <Section id="compose" title={`${ARTICLE_KIND_LABEL[kind]} 초안 쓰기`}>
            <div className={styles.panel}>
              <ArticleForm key={kind} kind={kind} options={options} />
            </div>
          </Section>
          <Section id="library" title="보관함" note={`${articles.length}개`}>
            {articles.length > 0 ? (
              <ul className={styles.library} role="list">
                {articles.map((article) => (
                  <li key={article.id} className={styles.entry}>
                    <Link href={`/affiliate-marketing/content/${article.id}`}>{article.title}</Link>
                    <span className={styles.entryMeta}>
                      <Chip tone="ink">{ARTICLE_KIND_LABEL[article.kind]}</Chip>
                      <Chip tone={article.source === "claude" ? "solid" : "muted"}>{CONTENT_SOURCE_LABEL[article.source]}</Chip>
                      <span>{formatRelative(article.updatedAt)} 수정</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="보관함이 비어 있어요">왼쪽에서 초안을 만들면 여기 쌓여요. 언제든 열어서 고치고 복사할 수 있어요.</Empty>
            )}
          </Section>
        </div>
      </Page>
    </>
  );
}
