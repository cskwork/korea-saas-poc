import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileStack } from "lucide-react";
import type { School } from "../../db/schema";
import { Mark } from "./Wordmark";
import styles from "./shell.module.css";

/** The public school (storefront) frame a student sees. */
export function SchoolShell({ school, children }: { school: Pick<School, "name" | "creatorName">; children: ReactNode }) {
  return (
    <div className={styles.school}>
      <a href="#main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <header className={styles.schoolBar}>
        <div className={styles.schoolBarInner}>
          <Link href="/online-education/school" className={styles.schoolBrand}>
            <span className={styles.schoolBrandName}>{school.name}</span>
            <span className={styles.schoolBrandBy}>{school.creatorName}의 온라인 스쿨</span>
          </Link>
          <nav className={styles.schoolNav} aria-label="스쿨">
            <Link href="/online-education/school#courses" className={styles.schoolNavLink}>
              <BookOpen size={16} aria-hidden />
              <span className={styles.schoolNavLabel}>강의</span>
            </Link>
            <Link href="/online-education/school#products" className={styles.schoolNavLink}>
              <FileStack size={16} aria-hidden />
              <span className={styles.schoolNavLabel}>자료</span>
            </Link>
            <Link href="/online-education" className={styles.schoolNavLink}>
              <ArrowLeft size={16} aria-hidden />
              <span className={styles.schoolNavLabel}>스튜디오</span>
            </Link>
          </nav>
        </div>
      </header>
      <p className={styles.sampleStrip}>
        <span className={styles.sampleStripInner}>
          샘플 스쿨이에요. 수강 신청과 구매는 데모로 기록만 되고 실제 결제는 일어나지 않아요.
        </span>
      </p>
      <main id="main" className={styles.schoolMain}>
        {children}
      </main>
      <footer className={styles.schoolFoot}>
        <div className={styles.schoolFootInner}>
          <span>
            © {school.creatorName} · {school.name}
          </span>
          <Link href="/online-education" className={styles.poweredBy}>
            <Mark size={18} />
            에듀마켓으로 만든 스쿨
          </Link>
        </div>
      </footer>
    </div>
  );
}
