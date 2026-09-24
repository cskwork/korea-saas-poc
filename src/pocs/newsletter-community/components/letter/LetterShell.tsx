import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatNumber } from "@/core/format";
import { TIER_LABEL } from "../../domain/tiers";
import type { Reader } from "../../server/context";
import type { Plan, Publication } from "../../server/store/publication";
import { LetterNav } from "./LetterNav";
import { StopReadingButton } from "./ReaderControls";
import styles from "./letter.module.css";

/** The public letter: a slim masthead with the nameplate, and the magazine's colophon at the foot. */
export function LetterShell({
  publication,
  plans,
  reader,
  children,
}: {
  publication: Publication;
  plans: Plan[];
  reader: Reader | null;
  children: React.ReactNode;
}) {
  const paid = plans.filter((plan) => plan.price > 0);
  return (
    <div className={styles.letter}>
      <a href="#letter-main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <div className={styles.utility}>
        <div className={styles.utilityInner}>
          <Link href="/newsletter-community" className={styles.back}>
            <ArrowLeft size={14} aria-hidden />
            편집실로
          </Link>
          <p className={styles.readerState}>
            {reader ? (
              <>
                <span>
                  <strong>{reader.name}</strong>님 · {TIER_LABEL[reader.tier]}
                  {reader.status === "active" ? " 구독 중" : " (해지)"}
                </span>
                <StopReadingButton />
              </>
            ) : (
              <span>펴냄으로 만든 샘플 레터예요</span>
            )}
          </p>
        </div>
      </div>
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <Link href="/newsletter-community/letter" className={styles.nameplate}>
            {publication.name}
          </Link>
          <LetterNav />
        </div>
      </header>
      <main id="letter-main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.colophon}>
        <div className={styles.colophonInner}>
          <p className={styles.colophonName}>{publication.name}</p>
          <dl className={styles.colophonList}>
            <div>
              <dt>펴낸이</dt>
              <dd>{publication.editorName}</dd>
            </div>
            <div>
              <dt>발행</dt>
              <dd>매주 오전 {publication.sendHour}시 이메일</dd>
            </div>
            <div>
              <dt>구독료</dt>
              <dd>
                {paid.length > 0
                  ? paid.map((plan) => `${plan.name} 월 ${formatNumber(plan.price)}원`).join(" · ")
                  : "무료"}
              </dd>
            </div>
            <div>
              <dt>만든 곳</dt>
              <dd>
                펴냄 — 이 레터와 독자, 글은 모두 샘플이에요. <a href="/">한국형 1인 SaaS 10선</a>
              </dd>
            </div>
          </dl>
        </div>
      </footer>
    </div>
  );
}
