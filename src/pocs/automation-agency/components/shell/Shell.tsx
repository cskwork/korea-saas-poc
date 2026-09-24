import type { ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { signFont } from "../../fonts";
import { BrandMark } from "./BrandMark";
import { ResetDemo } from "./ResetDemo";
import { StationNav } from "./StationNav";
import { BASE_PATH } from "./stations";
import styles from "./shell.module.css";

/** Module frame: station-sign band, sample-data strip, page body. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className={clsx(styles.root, signFont.variable)}>
      <a className={styles.skip} href="#main">
        본문으로 건너뛰기
      </a>
      <header className={styles.band}>
        <StationNav
          brand={
            <Link href={BASE_PATH} className={styles.brand}>
              <BrandMark className={styles.brandMark} />
              AutoMate Pro
            </Link>
          }
        />
      </header>
      <div className={styles.announce}>
        <div className={styles.announceInner}>
          <p className={styles.announceText}>
            <span className={styles.sampleTag}>샘플 데이터</span>
            고객사·금액·일정은 모두 예시예요.
          </p>
          <ResetDemo />
          <a className={styles.hubLink} href="/">
            10선 목록으로
          </a>
        </div>
      </div>
      <main id="main" className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>AutoMate Pro · 업무 자동화 대행 운영 도구</p>
          <p>금액은 원 단위, 날짜는 한국 시간 기준이에요.</p>
        </div>
      </footer>
    </div>
  );
}
