import Link from "next/link";
import { ArrowUpRight, PenLine } from "lucide-react";
import { formatDate } from "@/core/format";
import type { Publication } from "../../server/store/publication";
import { buttonClass } from "../ui/button";
import { StudioNav } from "./StudioNav";
import styles from "./studio.module.css";

/** The editorial office: 제호 block, dated masthead, section strip, colophon footer. */
export function StudioShell({ publication, children }: { publication: Publication; children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <Link href="/newsletter-community" className={styles.wordmark} aria-label="펴냄 편집실 첫 화면">
            펴냄
          </Link>
          <p className={styles.imprint}>
            <span className={styles.pubName}>{publication.name}</span>
            <span className={styles.office}>편집실</span>
          </p>
          <p className={styles.dateline}>{formatDate(new Date(), { dateStyle: "full" })}</p>
          <div className={styles.mastActions}>
            <Link href="/newsletter-community/letter" className={buttonClass("quiet", "sm", styles.letterLink)}>
              레터 보기
              <ArrowUpRight size={15} aria-hidden />
            </Link>
            <Link href="/newsletter-community/issues/new" className={buttonClass("primary", "sm")} aria-label="새 호 쓰기">
              <PenLine size={15} aria-hidden />
              <span className={styles.newLabel} aria-hidden>
                새 호 쓰기
              </span>
            </Link>
          </div>
        </div>
        <StudioNav />
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>
            <strong>펴냄</strong> — 1인 발행인을 위한 뉴스레터·유료 구독·독자 마당 도구. 이 편집실의 구독자, 글, 수입은
            모두 샘플 데이터이고 이메일은 실제로 발송되지 않아요.
          </p>
          <p className={styles.footerLinks}>
            <Link href="/newsletter-community/settings#reset">샘플 데이터 되돌리기</Link>
            <a href="/">한국형 1인 SaaS 10선으로</a>
          </p>
        </div>
      </footer>
    </>
  );
}
