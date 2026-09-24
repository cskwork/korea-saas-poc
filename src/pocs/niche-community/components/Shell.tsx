import Link from "next/link";
import type { ReactNode } from "react";
import { ledFont } from "../fonts";
import { resetDemoAction } from "../server/actions";
import type { PersonRef } from "../server/types";
import { ConfirmButton } from "./ActionButtons";
import { AgendaNav, FooterNav } from "./NavLinks";
import { PersonaSwitch } from "./PersonaSwitch";
import { SlideMark } from "./SlideMark";
import styles from "./shell.module.css";
import ui from "./ui.module.css";

interface ShellProps {
  viewer: PersonRef;
  personas: PersonRef[];
  children: ReactNode;
}

/** Deck chrome around every /niche-community page: wordmark, agenda, 명찰, sample-data footer. */
export function Shell({ viewer, personas, children }: ShellProps) {
  return (
    <div className={`${styles.root} ${ledFont.variable}`}>
      <a href="#nc-main" className={styles.skip}>
        본문으로 건너뛰기
      </a>
      <header className={styles.header}>
        <Link href="/niche-community" className={styles.brand}>
          <SlideMark className={styles.brandMark} />
          스타트업 빌더스
        </Link>
        <div className={styles.navDesktop}>
          <AgendaNav isOperator={viewer.role === "operator"} />
        </div>
        <div className={styles.headerEnd}>
          <span className={styles.sample} title="멤버, 글, 모임, 결제는 모두 샘플 데이터예요">
            샘플 데이터
          </span>
          <PersonaSwitch viewer={viewer} personas={personas} />
        </div>
      </header>
      <main id="nc-main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          스타트업 빌더스는 샘플 데이터로 채운 데모 커뮤니티예요. 멤버, 글, 모임, 결제는 모두 가상이며 실제로 청구되지 않습니다.
        </p>
        <ConfirmButton
          run={resetDemoAction.bind(null, {})}
          question="내가 쓴 글, 댓글, 멤버십 변경이 모두 사라지고 처음 샘플 상태로 돌아가요."
          confirmLabel="초기화할게요"
          className={`${ui.button} ${ui.small} ${ui.quiet}`}
        >
          데모 데이터 초기화
        </ConfirmButton>
        <a href="/" className={styles.footerLink}>
          한국형 1인 SaaS 10선으로
        </a>
      </footer>
      <FooterNav />
    </div>
  );
}
