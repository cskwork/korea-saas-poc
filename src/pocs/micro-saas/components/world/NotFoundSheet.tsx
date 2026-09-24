import Link from "next/link";
import { EmptyState } from "./EmptyState";
import ui from "./ui.module.css";
import styles from "./empty.module.css";

/** A booking or customer that is not in this shop's book (or no longer is). */
export function NotFoundSheet() {
  return (
    <div className={ui.sheet}>
      <EmptyState
        title="예약장에서 찾을 수 없어요"
        action={
          <div className={styles.actions}>
            <Link className={`${ui.btn} ${ui.ink}`} href="/micro-saas/calendar">
              예약 관리로
            </Link>
            <Link className={`${ui.btn} ${ui.line}`} href="/micro-saas/customers">
              고객 목록으로
            </Link>
          </div>
        }
      >
        지워졌거나 다른 매장의 기록일 수 있어요. 주소를 다시 확인해 주세요.
      </EmptyState>
    </div>
  );
}
