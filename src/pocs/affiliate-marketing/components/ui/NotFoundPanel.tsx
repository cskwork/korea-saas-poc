import Link from "next/link";
import { Page, ui } from "./primitives";
import styles from "./states.module.css";

/** Missing or foreign ids land here: the item is not on this workspace's shelf. */
export function NotFoundPanel() {
  return (
    <Page>
      <div className={styles.state}>
        <h1 className={styles.stateTitle}>진열대에 없는 항목이에요</h1>
        <span className={styles.stateSticker} aria-hidden>
          품절
        </span>
        <p className={styles.stateBody}>
          삭제되었거나 다른 워크스페이스의 항목이에요. 주소를 다시 확인하거나 목록에서 찾아 주세요.
        </p>
        <div className={styles.stateActions}>
          <Link href="/affiliate-marketing/links" className={ui.primary}>
            링크 목록
          </Link>
          <Link href="/affiliate-marketing" className={ui.base}>
            대시보드
          </Link>
        </div>
      </div>
    </Page>
  );
}
