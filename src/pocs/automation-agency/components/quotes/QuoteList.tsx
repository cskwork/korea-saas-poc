import Link from "next/link";
import clsx from "clsx";
import { formatDate, formatKrw, seoulDateKey } from "@/core/format";
import type { QuoteStatus } from "../../db/schema";
import { QUOTE_STATUS_LABEL, QUOTE_STATUSES } from "../../domain/labels";
import type { QuoteFilter, QuoteWithTotals } from "../../server/data/quotes";
import { BASE_PATH } from "../shell/stations";
import { buttonClass } from "../ui/classes";
import { EmptyLine } from "../ui/EmptyLine";
import { QuoteStatusTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./quotes.module.css";

const QUOTES = `${BASE_PATH}/quotes`;
const day = (value: string) => formatDate(`${value}T00:00:00+09:00`, { month: "short", day: "numeric" });

export function QuoteFilters({ filter, counts }: { filter: QuoteFilter; counts: Record<QuoteStatus, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const href = (status?: QuoteStatus) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (filter.q) params.set("q", filter.q);
    const query = params.toString();
    return query ? `${QUOTES}?${query}` : QUOTES;
  };
  return (
    <div className={styles.filters}>
      <nav aria-label="상태별 보기" className={ui.chips}>
        <Link href={href()} className={ui.chip} aria-current={!filter.status ? "true" : undefined}>
          전체 <span className={ui.chipCount}>{total}</span>
        </Link>
        {QUOTE_STATUSES.map((status) => (
          <Link
            key={status}
            href={href(status)}
            className={ui.chip}
            aria-current={filter.status === status ? "true" : undefined}
          >
            {QUOTE_STATUS_LABEL[status]} <span className={ui.chipCount}>{counts[status]}</span>
          </Link>
        ))}
      </nav>
      <form action={QUOTES} role="search" className={styles.search}>
        {filter.status ? <input type="hidden" name="status" value={filter.status} /> : null}
        <label htmlFor="q-search" className={ui.srOnly}>
          고객명 검색
        </label>
        <input
          id="q-search"
          name="q"
          type="search"
          className={ui.input}
          defaultValue={filter.q}
          placeholder="고객명으로 검색"
        />
        <button type="submit" className={buttonClass("secondary")}>
          찾기
        </button>
      </form>
    </div>
  );
}

export function QuoteTable({ quotes, filtered }: { quotes: QuoteWithTotals[]; filtered: boolean }) {
  const today = seoulDateKey();
  if (quotes.length === 0) {
    return (
      <EmptyLine
        title={filtered ? "조건에 맞는 견적이 없어요" : "아직 견적서가 없어요"}
        action={
          <Link href={`${QUOTES}/new`} className={buttonClass("primary")}>
            견적서 작성
          </Link>
        }
      >
        카탈로그 패키지를 담아 첫 견적서를 만들어 보세요.
      </EmptyLine>
    );
  }
  return (
    <table className={clsx(ui.table, ui.stack)}>
      <thead>
        <tr>
          <th scope="col">견적</th>
          <th scope="col">상태</th>
          <th scope="col" className={ui.num}>
            구축비 (VAT 포함)
          </th>
          <th scope="col" className={ui.num}>
            월 유지보수 (VAT 포함)
          </th>
          <th scope="col" className={ui.num}>
            유효기한
          </th>
        </tr>
      </thead>
      <tbody>
        {quotes.map((q) => {
          const expired = (q.status === "sent" || q.status === "draft") && q.validUntil < today;
          return (
            <tr key={q.id}>
              <td className={ui.wide}>
                <Link href={`${QUOTES}/${q.id}`} className={ui.rowLink}>
                  {q.clientName}
                </Link>
                <span className={ui.sub}>
                  {q.number} · {day(q.issuedOn)} 발행 · 항목 {q.items.length}개
                </span>
              </td>
              <td data-label="상태">
                <QuoteStatusTag status={q.status} />
              </td>
              <td data-label="구축비" className={ui.num}>
                {formatKrw(q.totals.setup.total)}
              </td>
              <td data-label="월 유지보수" className={ui.num}>
                {formatKrw(q.totals.monthly.total)}
              </td>
              <td data-label="유효기한" className={ui.num}>
                {day(q.validUntil)}
                {expired ? <span className={clsx(ui.sub, styles.expired)}>기한 지남</span> : null}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
