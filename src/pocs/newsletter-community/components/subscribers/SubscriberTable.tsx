import Link from "next/link";
import { formatNumber } from "@/core/format";
import type { SubscriberRow as Row } from "../../server/store/subscribers";
import { buttonClass } from "../ui/button";
import { EmptyState } from "../ui/EmptyState";
import ui from "../ui/ui.module.css";
import { SubscriberRow } from "./SubscriberRow";
import styles from "./subscribers.module.css";

export function SubscriberTable({
  rows,
  total,
  page,
  pageSize,
  pageHref,
  filtered,
}: {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  pageHref: (page: number) => string;
  filtered: boolean;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={filtered ? "조건에 맞는 구독자가 없어요" : "명부가 비어 있어요"}
        action={
          filtered ? (
            <Link href="/newsletter-community/subscribers" className={buttonClass("secondary")}>
              조건 지우기
            </Link>
          ) : undefined
        }
      >
        {filtered
          ? "검색어의 일부만 넣거나 등급·상태 필터를 풀어 보세요."
          : "‘명부에 올리기’로 한 명씩 올리거나 CSV로 한꺼번에 가져오세요. 레터 구독 폼으로 신청한 사람도 여기 쌓여요."}
      </EmptyState>
    );
  }
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={ui.srOnly}>구독자 명부</caption>
          <thead>
            <tr>
              <th scope="col">이름</th>
              <th scope="col">이메일</th>
              <th scope="col">등급</th>
              <th scope="col">상태</th>
              <th scope="col">가입</th>
              <th scope="col">최근 열람</th>
              <th scope="col">
                <span className={ui.srOnly}>관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <SubscriberRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
      <nav className={styles.pager} aria-label="쪽 넘기기">
        <p>
          {formatNumber(total)}명 중 {formatNumber(from)}–{formatNumber(from + rows.length - 1)}
        </p>
        <div className={styles.pagerLinks}>
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonClass("secondary", "sm")}>
              이전
            </Link>
          ) : (
            <span className={buttonClass("secondary", "sm")} aria-disabled="true">
              이전
            </span>
          )}
          <span className={styles.pageNumber}>
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={buttonClass("secondary", "sm")}>
              다음
            </Link>
          ) : (
            <span className={buttonClass("secondary", "sm")} aria-disabled="true">
              다음
            </span>
          )}
        </div>
      </nav>
    </>
  );
}
