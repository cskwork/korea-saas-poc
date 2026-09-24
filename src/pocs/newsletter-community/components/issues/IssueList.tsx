import Link from "next/link";
import clsx from "clsx";
import { Search } from "lucide-react";
import { formatNumber } from "@/core/format";
import { CATEGORY_LABEL, type IssueStatus } from "../../domain/issues";
import { AUDIENCE_SHORT } from "../../domain/tiers";
import type { IssueListRow } from "../../server/store/issues";
import { coverInk } from "../cover";
import { dayAndTime, percent, shortDate } from "../format";
import theme from "../theme.module.css";
import { buttonClass } from "../ui/button";
import { EmptyState } from "../ui/EmptyState";
import { SampleNote } from "../ui/SectionHead";
import ui from "../ui/ui.module.css";
import styles from "./issues.module.css";
import { StatusTag } from "./StatusTag";

const FILTERS: { status?: IssueStatus; label: string }[] = [
  { label: "전체" },
  { status: "scheduled", label: "발행 예약" },
  { status: "draft", label: "초안" },
  { status: "published", label: "발행" },
];

function filterHref(status: IssueStatus | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const query = params.toString();
  return `/newsletter-community/issues${query ? `?${query}` : ""}`;
}

export function IssueList({
  issues,
  counts,
  status,
  q,
  nextNumber,
}: {
  issues: IssueListRow[];
  counts: Record<IssueStatus, number>;
  status?: IssueStatus;
  q?: string;
  nextNumber: number;
}) {
  const total = counts.draft + counts.scheduled + counts.published;
  const pending = issues.filter((issue) => issue.number === null);

  return (
    <>
      <div className={styles.toolbar}>
        <nav aria-label="상태별 보기" className={styles.filters}>
          {FILTERS.map((filter) => (
            <Link
              key={filter.label}
              href={filterHref(filter.status, q)}
              className={styles.filter}
              aria-current={status === filter.status ? "page" : undefined}
            >
              {filter.label}
              <span className={styles.count}>{formatNumber(filter.status ? counts[filter.status] : total)}</span>
            </Link>
          ))}
        </nav>
        <form className={styles.search} action="/newsletter-community/issues" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="issue-search" className={ui.srOnly}>
            제목이나 소개로 찾기
          </label>
          <input
            id="issue-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="제목·소개로 찾기"
            className={ui.input}
            maxLength={60}
          />
          <button type="submit" className={buttonClass("secondary", "md")} aria-label="찾기">
            <Search size={16} aria-hidden />
          </button>
        </form>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title={q ? `‘${q}’에 맞는 호가 없어요` : "이 칸은 비어 있어요"}
          action={
            <Link href="/newsletter-community/issues/new" className={buttonClass("primary")}>
              새 호 쓰기
            </Link>
          }
        >
          {q ? "다른 낱말로 찾거나 상태 필터를 풀어 보세요." : "새 호를 쓰면 초안으로 이곳에 쌓이고, 예약하거나 발행하면 상태가 바뀌어요."}
        </EmptyState>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className={ui.srOnly}>발행 목록</caption>
            <thead>
              <tr>
                <th scope="col">호</th>
                <th scope="col">제목</th>
                <th scope="col">받는 사람</th>
                <th scope="col">상태</th>
                <th scope="col">날짜</th>
                <th scope="col" className={styles.num}>
                  수신
                </th>
                <th scope="col" className={styles.num}>
                  오픈
                </th>
                <th scope="col" className={styles.num}>
                  클릭
                </th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => {
                const expected = issue.number ?? nextNumber + pending.indexOf(issue);
                const sent = issue.status === "published";
                return (
                  <tr key={issue.id}>
                    <td className={styles.numberCell}>
                      <span className={styles.numberWrap}>
                        <span
                          className={clsx(styles.swatch, theme[`ink-${coverInk(expected)}`], !issue.number && styles.swatchPending)}
                          aria-hidden
                        />
                        <span className={clsx(styles.number, !issue.number && styles.numberPending)} title={issue.number ? undefined : "발행하면 받을 호수"}>
                          {expected}
                        </span>
                      </span>
                    </td>
                    <td className={styles.titleCell}>
                      <div className={styles.titleStack}>
                        <Link href={`/newsletter-community/issues/${issue.id}`} className={styles.title}>
                          {issue.title}
                        </Link>
                        <span className={styles.sub}>
                          {CATEGORY_LABEL[issue.category]}
                          {issue.lede && ` · ${issue.lede}`}
                        </span>
                      </div>
                    </td>
                    <td data-label="받는 사람">{AUDIENCE_SHORT[issue.audience]}</td>
                    <td data-label="상태">
                      <StatusTag status={issue.status} />
                    </td>
                    <td data-label="날짜" className={styles.date}>
                      {sent && issue.publishedAt
                        ? shortDate(issue.publishedAt)
                        : issue.scheduledAt
                          ? dayAndTime(issue.scheduledAt)
                          : `${shortDate(issue.updatedAt)} 저장`}
                    </td>
                    <td data-label="수신" className={styles.num}>
                      {sent ? formatNumber(issue.recipients) : "—"}
                    </td>
                    <td data-label="오픈" className={styles.num}>
                      {sent ? percent(issue.recipients ? issue.opens / issue.recipients : 0) : "—"}
                    </td>
                    <td data-label="클릭" className={styles.num}>
                      {sent ? percent(issue.recipients ? issue.clicks / issue.recipients : 0) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className={styles.footnote}>
        <SampleNote>수신은 발행 때 기록한 발송 행의 수, 오픈·클릭은 시뮬레이션 수치예요</SampleNote>
      </p>
    </>
  );
}
