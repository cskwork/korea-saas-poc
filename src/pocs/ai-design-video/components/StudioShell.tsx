import Link from "next/link";
import type { ReactNode } from "react";
import { formNumerals, roughHeadline } from "../fonts";
import { paths } from "./paths";
import { ResetDemoButton } from "./ResetDemoButton";
import { StudioNav } from "./StudioNav";
import styles from "./studio.module.css";

/** The desk the sheets lie on: printed top bar, the page's sheet, and the sample-data footer. */
export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <div className={[styles.root, formNumerals.variable, roughHeadline.variable].join(" ")}>
      <a className={styles.skip} href="#studio-main">
        본문으로 건너뛰기
      </a>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href={paths.today} className={styles.wordmark}>
            <span className={styles.wordmarkName}>크리에이트잇</span>
            <span className={styles.wordmarkRole}>1인 디자인·영상 제작소</span>
          </Link>
          <StudioNav />
        </div>
      </header>
      <main id="studio-main" className={styles.main}>
        <div className={styles.sheet}>
          {children}
          <footer className={styles.sheetFooter}>
            <p>
              모든 주문·고객·포트폴리오는 기능 확인용 샘플이에요. 방문자마다 따로 저장되고, 언제든 처음 상태로 되돌릴 수
              있어요. <a href="/">다른 제품 보기</a>
            </p>
            <ResetDemoButton />
          </footer>
        </div>
      </main>
    </div>
  );
}
