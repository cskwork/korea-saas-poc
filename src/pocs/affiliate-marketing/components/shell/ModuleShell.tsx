import clsx from "clsx";
import { displayFont, figureFont } from "../../fonts";
import { ResetDemo } from "./ResetDemo";
import { StoreHeader } from "./StoreHeader";
import styles from "./shell.module.css";

/** The module frame: tokens, fonts, store band, main landmark and the small-print footer. */
export function ModuleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={clsx(styles.root, displayFont.variable, figureFont.variable)}>
      <a href="#main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <StoreHeader />
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerNote}>
            링크잇의 링크, 클릭, 판매 기록은 모두 이 브라우저의 샘플 워크스페이스에 저장돼요. 수치는 저장된 기록으로 계산하며, 프로그램 조건은
            참고용이에요.
          </p>
          <div className={styles.footerLinks}>
            <ResetDemo />
            <a href="/">한국형 1인 SaaS 10선 둘러보기</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
