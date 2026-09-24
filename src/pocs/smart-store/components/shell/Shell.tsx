import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { signFont } from "../../fonts";
import { ToastProvider } from "../ui/Toast";
import { NavLinks } from "./NavLinks";
import { ResetDemoButton } from "./ResetDemoButton";
import styles from "./shell.module.css";

/** Module frame: floor-directory rail (top bar on small screens) and the working area. */
export function Shell({ waiting, children }: { waiting: number; children: ReactNode }) {
  return (
    <div className={clsx(styles.root, signFont.variable)}>
      <a href="#main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <ToastProvider>
        <div className={styles.frame}>
          <header className={styles.rail}>
            <Link href="/smart-store" className={styles.brand} aria-label="스마트셀러 오늘">
              <span className={styles.wordmark} aria-hidden>
                스마트셀러
              </span>
              <span className={styles.brandLine}>스마트스토어 위탁판매 가판대</span>
            </Link>
            <div className={styles.navArea}>
              <NavLinks waiting={waiting} />
            </div>
            <div className={styles.foot}>
              <p className={styles.sample}>
                <Info size={15} strokeWidth={2} aria-hidden />
                <span className={styles.sampleText}>
                  모든 상품·주문·매출은 둘러보기용 샘플이에요. 실제 스토어와 연결되어 있지 않아요.
                </span>
                <span className={styles.sampleShort}>샘플 데이터</span>
              </p>
              <ResetDemoButton />
              <a href="/" className={styles.hubLink} aria-label="1인 SaaS 10선 목록으로">
                <ArrowLeft size={14} strokeWidth={2} aria-hidden />
                <span>1인 SaaS 10선</span>
              </a>
            </div>
          </header>
          <main id="main" className={styles.main} tabIndex={-1}>
            <div className={styles.content}>{children}</div>
          </main>
        </div>
      </ToastProvider>
    </div>
  );
}
