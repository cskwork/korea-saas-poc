import { Grommets } from "./Grommets";
import styles from "./shell.module.css";

/**
 * What a client sees: a slim cobalt strip with the agency's wordmark, the page, and the
 * sample note. No operator menu, no demo controls.
 */
export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className={`${styles.masthead} ${styles.clientMasthead}`}>
        <Grommets />
        <div className={styles.mastheadInner}>
          <span className={styles.wordmark}>
            글<em>품</em>
          </span>
          <span className={styles.clientRole}>콘텐츠 대행 · 납품서</span>
          <div className={styles.mastheadEnd}>
            <span className={styles.sampleTag} title="고객·의뢰·원고는 모두 예시 데이터예요">
              샘플
            </span>
          </div>
        </div>
      </header>
      <main className={`${styles.main} ${styles.clientMain}`} id="main">
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerNote}>
            <strong>글품</strong> · AI가 시안을 쓰고 에디터가 검수해 납품해요. 이 납품서는 샘플 작업실에서 만든 예시예요.
          </p>
        </div>
      </footer>
    </>
  );
}
