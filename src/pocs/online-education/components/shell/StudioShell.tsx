import type { ReactNode } from "react";
import Link from "next/link";
import { Store, Tag } from "lucide-react";
import type { School } from "../../db/schema";
import { planOf } from "../../domain/plans";
import ui from "../ui/ui.module.css";
import { NavLinks } from "./NavLinks";
import { ResetDemoButton } from "./ResetDemoButton";
import { Wordmark } from "./Wordmark";
import styles from "./shell.module.css";

/** The creator's studio: timetable rail on desktop, top bar + tab bar on phones. */
export function StudioShell({ school, children }: { school: Pick<School, "name" | "creatorName" | "plan">; children: ReactNode }) {
  return (
    <div className={styles.studio}>
      <a href="#main" className={styles.skip}>
        본문으로 건너뛰기
      </a>

      <div className={styles.railColumn}>
      <aside className={styles.rail} aria-label="스튜디오 메뉴">
        <Link href="/online-education" className={styles.brandLink}>
          <Wordmark caption="강사 스튜디오" />
        </Link>
        <div className={styles.schoolCard}>
          <p className={styles.schoolName}>{school.name}</p>
          <p className={styles.schoolMeta}>
            {school.creatorName} · {planOf(school.plan).name} 요금제
          </p>
          <span className={ui.badge} data-tone="sample">
            샘플 데이터로 채운 데모
          </span>
        </div>
        <nav aria-label="스튜디오">
          <NavLinks variant="rail" />
        </nav>
        <div className={styles.railFoot}>
          <Link href="/online-education/school" className={styles.railLink}>
            <span className={styles.navIcon}>
              <Store size={17} strokeWidth={1.9} aria-hidden />
            </span>
            <span>내 스쿨 보기</span>
          </Link>
          <ResetDemoButton compact />
        </div>
      </aside>
      </div>

      <header className={styles.topbar}>
        <Link href="/online-education" className={styles.brandLink} aria-label="에듀마켓 스튜디오 홈">
          <Wordmark />
        </Link>
        <p className={styles.topbarSchool}>{school.name}</p>
        <div className={styles.topbarActions}>
          <Link href="/online-education/school" className={ui.iconButton} aria-label="내 스쿨 보기">
            <Store size={19} aria-hidden />
          </Link>
          <Link href="/online-education/pricing" className={ui.iconButton} aria-label="요금제·설정">
            <Tag size={19} aria-hidden />
          </Link>
        </div>
      </header>

      <main id="main" className={styles.main}>
        {children}
      </main>

      <nav className={styles.tabbar} aria-label="스튜디오">
        <NavLinks variant="tabs" />
      </nav>
    </div>
  );
}
