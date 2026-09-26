import Link from "next/link";
import { Grommets } from "./Grommets";
import { MastheadCta, MastheadNav } from "./MastheadNav";
import { ResetDemo } from "./ResetDemo";
import styles from "./shell.module.css";

/** The operator's frame: cobalt masthead banner, the page, and the sample-data footer. */
export function ConsoleShell({ aiMode, children }: { aiMode: "claude" | "template"; children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        본문으로 건너뛰기
      </a>
      <header className={styles.masthead}>
        <Grommets />
        <div className={styles.mastheadInner}>
          <Link href="/ai-content-agency" className={styles.wordmark} aria-label="글품 현황으로">
            글<em>품</em>
          </Link>
          <MastheadNav />
          <div className={styles.mastheadEnd}>
            <span className={styles.sampleTag} title="고객·의뢰·사례는 모두 예시 데이터예요">
              샘플<span className={styles.sampleLong}>작업실</span>
            </span>
            <MastheadCta />
          </div>
        </div>
      </header>
      <main className={styles.main} id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerNote}>
            <strong>글품 샘플 작업실</strong> · 여기 있는 고객, 의뢰, 사례는 모두 예시예요. 실제 결제나 연락은 일어나지 않아요.
          </p>
          <span className={styles.aiMode}>
            <span className={styles.aiDot} data-mode={aiMode} aria-hidden="true" />
            {aiMode === "claude" ? "AI 초안: Claude 연결됨" : "AI 초안: 기본 템플릿 (API 키 없음)"}
          </span>
          <ResetDemo />
          <a href="/" className={styles.hubLink}>
            10개 서비스 목록으로
          </a>
        </div>
      </footer>
    </>
  );
}
