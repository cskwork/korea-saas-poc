import clsx from "clsx";
import { formatDate, formatNumber, formatRelative } from "@/core/format";
import { CONTENT_SOURCE_LABEL, SOCIAL_PLATFORMS, SOCIAL_PLATFORM_LABEL } from "../../domain/catalog";
import { PLATFORM_LIMIT, fitsPlatform, platformLength } from "../../domain/social";
import type { SocialPostRow } from "../../server/content";
import type { LinkOption } from "../../server/links";
import { CopyButton } from "../ui/actions";
import { Band, Chip, Empty, Page, Section } from "../ui/primitives";
import { DeletePost } from "./DeletePost";
import { SocialForm } from "./SocialForm";
import styles from "./content.module.css";

function VariantSet({ post }: { post: SocialPostRow }) {
  return (
    <div className={styles.variants}>
      {SOCIAL_PLATFORMS.map((platform) => {
        const text = post.variants[platform];
        const limit = PLATFORM_LIMIT[platform];
        const fits = fitsPlatform(platform, text);
        return (
          <article key={platform} className={styles.variant} aria-label={`${SOCIAL_PLATFORM_LABEL[platform]} 게시물`}>
            <div className={styles.variantHead}>
              <span>{SOCIAL_PLATFORM_LABEL[platform]}</span>
              <span className={clsx(styles.meter, !fits && styles.meterOver)}>
                {formatNumber(platformLength(platform, text))}
                {limit.max ? ` / ${formatNumber(limit.max)}` : "자"}
                {platform === "x" ? " (가중치)" : ""}
                {!fits ? " · 너무 길어요" : ""}
              </span>
            </div>
            <pre className={styles.variantText}>{text}</pre>
            <div className={styles.variantFoot}>
              <span className={styles.meter}>{platform === "instagram" ? "링크는 프로필에 걸어 두세요" : platform === "x" ? "링크는 23자로 계산돼요" : " "}</span>
              <CopyButton text={text} label="복사" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function SocialScreen({ posts, options, aiEnabled }: { posts: SocialPostRow[]; options: LinkOption[]; aiEnabled: boolean }) {
  const [latest, ...older] = posts;
  return (
    <>
      <Band
        title="SNS 게시물 만들기"
        lead={`링크를 고르면 인스타그램·블로그·X·스레드용 글을 한 번에 써요. 플랫폼마다 채널 태그가 붙은 짧은 링크와 광고 표시가 들어가요. ${aiEnabled ? "Claude가 쓰고, 응답이 없으면 기본 템플릿으로 만들어요." : "AI 키가 없어 기본 템플릿으로 만들어요."}`}
      />
      <Page>
        <div className={styles.layout}>
          <Section id="latest" title={latest ? latest.productName : "최근 게시물"} note={latest ? `${formatRelative(latest.createdAt)} · ${CONTENT_SOURCE_LABEL[latest.source]}` : undefined}>
            {latest ? (
              <>
                <VariantSet post={latest} />
                <div className={styles.setHead}>
                  <Chip tone={latest.source === "claude" ? "solid" : "muted"}>{CONTENT_SOURCE_LABEL[latest.source]}</Chip>
                  <DeletePost id={latest.id} />
                </div>
              </>
            ) : (
              <Empty title="아직 만든 게시물이 없어요">오른쪽에서 링크를 고르고 강조할 점을 적으면 플랫폼별 게시물 4개가 만들어져요.</Empty>
            )}
          </Section>
          <Section id="compose" title="새 게시물">
            <div className={styles.panel}>
              <SocialForm options={options} />
            </div>
          </Section>
        </div>

        {older.length > 0 ? (
          <Section id="older" title="지난 게시물" note={`${older.length}세트`}>
            {older.map((post) => (
              <details key={post.id} className={styles.older}>
                <summary>
                  {post.productName}
                  <Chip tone={post.source === "claude" ? "solid" : "muted"}>{CONTENT_SOURCE_LABEL[post.source]}</Chip>
                  <span className={styles.meter}>{formatDate(post.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                </summary>
                <div className={styles.olderBody}>
                  <VariantSet post={post} />
                  <div className={styles.setHead}>
                    <span />
                    <DeletePost id={post.id} />
                  </div>
                </div>
              </details>
            ))}
          </Section>
        ) : null}
      </Page>
    </>
  );
}

