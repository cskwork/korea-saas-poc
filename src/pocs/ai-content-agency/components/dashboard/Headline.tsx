import { FilePlus2, PenLine } from "lucide-react";
import Link from "next/link";
import { longDate } from "../../domain/dates";
import { PLANS, type PlanId } from "../../domain/plans";
import type { HeadlineCounts } from "../../domain/stats";
import { buttonClass } from "../ui/buttons";
import styles from "./dashboard.module.css";

/** The day's status line: what is due today and what waits for review. */
export function Headline({ today, counts, plan }: { today: string; counts: HeadlineCounts; plan: PlanId }) {
  const sub = [
    counts.late > 0 ? `마감이 지난 의뢰 ${counts.late}건을 먼저 챙겨 주세요.` : "마감이 지난 의뢰는 없어요.",
    `이번 주 남은 마감 ${counts.dueThisWeek}건.`,
  ].join(" ");
  return (
    <div className={styles.headline}>
      <div>
        <h1 className={styles.headlineText}>
          {counts.dueToday > 0 ? (
            <>
              오늘 마감 <mark>{counts.dueToday}건</mark>
            </>
          ) : (
            "오늘 마감은 없어요"
          )}
          {" · "}
          검수 대기 <mark>{counts.awaitingReview}건</mark>
        </h1>
        <p className={styles.subline}>
          <span className={styles.dateLine}>
            {longDate(today)} · {PLANS[plan].name} 요금제
          </span>
          {counts.late > 0 ? <strong className={styles.late}>지연 {counts.late}건. </strong> : null}
          {sub}
        </p>
      </div>
      <div className={styles.actions}>
        <Link href="/ai-content-agency/orders/new" className={buttonClass("primary")}>
          <FilePlus2 size={18} aria-hidden="true" />
          의뢰서 쓰기
        </Link>
        <Link href="/ai-content-agency/write" className={buttonClass("secondary")}>
          <PenLine size={18} aria-hidden="true" />
          시안 쓰기
        </Link>
      </div>
    </div>
  );
}
