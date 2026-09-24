import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Lock } from "lucide-react";
import { formatNumber } from "@/core/format";
import { CATEGORY_LABEL } from "../../domain/issues";
import { AUDIENCE_SHORT, canRead } from "../../domain/tiers";
import type { Reader } from "../../server/context";
import type { PublishedIssueSummary } from "../../server/store/issues";
import type { Plan, Publication } from "../../server/store/publication";
import { coverInk } from "../cover";
import { longDate, shortDate } from "../format";
import theme from "../theme.module.css";
import { EmptyState } from "../ui/EmptyState";
import { ReplyCard } from "./ReplyCard";
import styles from "./letter.module.css";

export function LetterHome({
  publication,
  plans,
  issues,
  reader,
}: {
  publication: Publication;
  plans: Plan[];
  issues: PublishedIssueSummary[];
  reader: Reader | null;
}) {
  const [latest, ...older] = issues;
  const readerTier = reader?.status === "active" ? reader.tier : null;
  return (
    <>
      <section className={styles.front} aria-labelledby="front-title">
        <div className={styles.frontText}>
          <h1 id="front-title" className={styles.frontName}>
            {publication.name}
          </h1>
          <p className={styles.frontDescription}>{publication.description}</p>
          <p className={styles.frontFacts}>
            통권 {formatNumber(issues.length)}호 · 매주 오전 {publication.sendHour}시 · 펴낸이 {publication.editorName}
          </p>
        </div>
        {readerTier ? (
          <div className={styles.welcome}>
            <p className={styles.welcomeTitle}>{reader?.name}님, 반가워요</p>
            <p>
              {readerTier === "free"
                ? "무료 구독 중이에요. 유료 호는 미리보기까지 읽을 수 있어요."
                : "유료 호까지 모두 읽을 수 있어요. 독자 마당에도 글을 남겨 주세요."}
            </p>
            <Link href={readerTier === "free" ? "/newsletter-community/letter/plans" : "/newsletter-community/letter/board"}>
              {readerTier === "free" ? "유료 구독 알아보기" : "독자 마당 가기"}
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        ) : (
          <ReplyCard
            id="subscribe"
            plans={plans.map(({ tier, name, price, summary }) => ({ tier, name, price, summary }))}
            publicationName={publication.name}
          />
        )}
      </section>

      {latest ? (
        <>
          <Link
            href={`/newsletter-community/letter/${latest.number}`}
            className={clsx(styles.latest, theme[`ink-${coverInk(latest.number ?? 1)}`])}
          >
            <span className={styles.latestNumber}>
              <span className={styles.affix}>제</span>
              {latest.number}
              <span className={styles.affix}>호</span>
            </span>
            <span className={styles.latestBody}>
              <span className={styles.latestTitle}>{latest.title}</span>
              {latest.lede && <span className={styles.latestLede}>{latest.lede}</span>}
              <span className={styles.latestMeta}>
                {latest.publishedAt && longDate(latest.publishedAt)} · {CATEGORY_LABEL[latest.category]} ·{" "}
                {AUDIENCE_SHORT[latest.audience]}
                <span className={styles.latestCta}>
                  최신호 읽기 <ArrowRight size={16} aria-hidden />
                </span>
              </span>
            </span>
          </Link>

          <section className={styles.archive} aria-labelledby="archive-title">
            <h2 id="archive-title" className={styles.archiveTitle}>
              지난 호
            </h2>
            <ol className={styles.archiveList} role="list">
              {older.map((issue) => {
                const locked = !canRead(readerTier, issue.audience);
                return (
                  <li key={issue.id}>
                    <Link href={`/newsletter-community/letter/${issue.number}`} className={styles.archiveRow}>
                      <span className={clsx(styles.archiveSwatch, theme[`ink-${coverInk(issue.number ?? 1)}`])} aria-hidden />
                      <span className={styles.archiveNumber}>{issue.number}</span>
                      <span className={styles.archiveMain}>
                        <span className={styles.archiveHeadline}>{issue.title}</span>
                        <span className={styles.archiveLede}>{issue.lede}</span>
                      </span>
                      <span className={styles.archiveMeta}>
                        {locked && (
                          <span className={styles.lock}>
                            <Lock size={13} aria-hidden />
                            {AUDIENCE_SHORT[issue.audience]}
                          </span>
                        )}
                        {issue.publishedAt && shortDate(issue.publishedAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      ) : (
        <EmptyState title="아직 발행한 호가 없어요">첫 호가 나오면 이곳에 표지와 목차가 차례로 쌓여요.</EmptyState>
      )}
    </>
  );
}
