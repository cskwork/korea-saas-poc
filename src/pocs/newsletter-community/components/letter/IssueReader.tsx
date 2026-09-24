import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Scissors } from "lucide-react";
import { CATEGORY_LABEL, readingMinutes } from "../../domain/issues";
import type { Block } from "../../domain/markup";
import { AUDIENCE_LABEL, TIER_LABEL, unlockingTier } from "../../domain/tiers";
import type { Reader } from "../../server/context";
import type { Issue, PublishedIssueSummary } from "../../server/store/issues";
import type { Plan, Publication } from "../../server/store/publication";
import { IssueBody } from "../issue/IssueBody";
import { IssueCoverBand } from "../issue/IssueCoverBand";
import { longDate } from "../format";
import ui from "../ui/ui.module.css";
import { SampleReaderButton } from "./ReaderControls";
import { ReplyCard } from "./ReplyCard";
import styles from "./letter.module.css";

interface IssueReaderProps {
  issue: Issue;
  blocks: Block[];
  unlocked: boolean;
  publication: Publication;
  plans: Plan[];
  reader: Reader | null;
  sponsor: { sponsorName: string; message: string } | null;
  newer: PublishedIssueSummary | null;
  older: PublishedIssueSummary | null;
}

/** An issue as its readers see it: the cover band, the text, and — for paid issues — the perforated line. */
export function IssueReader({ issue, blocks, unlocked, publication, plans, reader, sponsor, newer, older }: IssueReaderProps) {
  const number = issue.number ?? 0;
  const cardPlans = plans.map(({ tier, name, price, summary }) => ({ tier, name, price, summary }));
  const needed = unlockingTier(issue.audience);
  return (
    <article className={styles.issue} aria-labelledby="issue-title">
      <IssueCoverBand
        number={number}
        title={issue.title}
        titleId="issue-title"
        lede={issue.lede}
        meta={
          <>
            <span>{issue.publishedAt && longDate(issue.publishedAt)}</span>
            <span>{CATEGORY_LABEL[issue.category]}</span>
            <span>
              {issue.audience !== "everyone" && <Lock size={13} aria-hidden className={styles.inlineIcon} />}
              {AUDIENCE_LABEL[issue.audience]}
            </span>
            <span>읽는 데 약 {readingMinutes(issue.body)}분</span>
          </>
        }
      />
      <IssueBody blocks={blocks} />

      {unlocked ? (
        <>
          {sponsor && (
            <aside className={styles.sponsor} aria-label="광고">
              <span className={ui.tag}>광고</span>
              <p>
                <strong>{sponsor.sponsorName}</strong> {sponsor.message}
              </p>
            </aside>
          )}
          <p className={styles.endMark} aria-hidden>
            끝
          </p>
        </>
      ) : (
        <div className={styles.paywall}>
          <p className={styles.paywallLine}>
            <Scissors size={16} aria-hidden />
            여기부터는 {AUDIENCE_LABEL[issue.audience]}만 읽을 수 있어요
          </p>
          <p className={styles.paywallText}>
            {reader && reader.status === "active"
              ? `${reader.name}님은 지금 ${TIER_LABEL[reader.tier]} 구독 중이에요. ${TIER_LABEL[needed]} 이상으로 바꾸면 이어서 읽을 수 있어요.`
              : `${TIER_LABEL[needed]} 이상 정기구독을 신청하면 이 호와 지난 유료 호를 모두 읽을 수 있어요.`}
          </p>
          <ReplyCard
            id="paywall-card"
            plans={cardPlans}
            publicationName={publication.name}
            defaultTier={needed}
            returnTo={`/newsletter-community/letter/${number}`}
            title="이어서 읽으려면 정기구독을 신청하세요"
            defaults={reader ? { name: reader.name, email: reader.email } : undefined}
          />
          <p className={styles.paywallDemo}>
            구경만 하고 싶다면 <SampleReaderButton />
          </p>
        </div>
      )}

      <nav className={styles.issueNav} aria-label="다른 호">
        {older ? (
          <Link href={`/newsletter-community/letter/${older.number}`} className={styles.issueNavLink}>
            <span className={styles.issueNavLabel}>
              <ArrowLeft size={14} aria-hidden />
              지난 호 · 제{older.number}호
            </span>
            <span className={styles.issueNavTitle}>{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link href={`/newsletter-community/letter/${newer.number}`} className={`${styles.issueNavLink} ${styles.issueNavNext}`}>
            <span className={styles.issueNavLabel}>
              다음 호 · 제{newer.number}호
              <ArrowRight size={14} aria-hidden />
            </span>
            <span className={styles.issueNavTitle}>{newer.title}</span>
          </Link>
        )}
      </nav>

      {unlocked && !reader && (
        <div className={styles.afterIssue}>
          <ReplyCard
            id="after-card"
            plans={cardPlans}
            publicationName={publication.name}
            title="다음 호부터 메일로 받아 보세요"
          />
        </div>
      )}
    </article>
  );
}
