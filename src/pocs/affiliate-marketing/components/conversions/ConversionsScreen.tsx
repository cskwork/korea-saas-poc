import Link from "next/link";
import { formatNumber, formatWon } from "@/core/format";
import { CONVERSION_PAGE_SIZE, CONVERSION_STATUSES, CONVERSION_STATUS_LABEL, type ConversionStatus } from "../../domain/catalog";
import type { ConversionRow } from "../../server/conversions";
import type { LinkOption } from "../../server/links";
import { Band, Empty, Page, Section, Won, ui } from "../ui/primitives";
import { formStyles } from "../ui/Field";
import { ConversionFilters } from "./ConversionFilters";
import { ConversionForm } from "./ConversionForm";
import { ConversionTable } from "./ConversionTable";
import styles from "./conversions.module.css";

type Summary = Record<ConversionStatus, { count: number; commission: number; orders: number }>;

export function ConversionsScreen({
  rows,
  summary,
  options,
  programs,
  today,
  months,
  filters,
  hasMore,
}: {
  rows: ConversionRow[];
  summary: Summary;
  options: LinkOption[];
  programs: { id: string; name: string }[];
  today: string;
  months: string[];
  filters: { month: string; status?: ConversionStatus; programId?: string; linkId?: string; pages: number };
  hasMore: boolean;
}) {
  const monthName = `${Number(filters.month.slice(5, 7))}월`;
  const scopedLink = filters.linkId ? options.find((o) => o.id === filters.linkId) : undefined;
  const href = (patch: { status?: ConversionStatus | null; pages?: number; linkId?: string | null }) => {
    const next = { ...filters, ...patch };
    const params = new URLSearchParams();
    if (next.month !== months[0]) params.set("month", next.month);
    if (next.programId) params.set("programId", next.programId);
    if (next.linkId) params.set("linkId", next.linkId);
    if (next.status) params.set("status", next.status);
    if (next.pages && next.pages > 1) params.set("pages", String(next.pages));
    const query = params.toString();
    return `/affiliate-marketing/conversions${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <Band
        title="판매 기록"
        lead="프로그램 보고서에서 확인한 주문을 기록하세요. 수수료는 링크의 조건으로 계산되고, 구매 확정·취소 상태를 따라 합계가 바뀌어요."
      >
        <dl className={styles.strip} aria-label={`${monthName} 판매 요약`}>
          {CONVERSION_STATUSES.map((status) => (
            <div key={status} className={styles.stripCell}>
              <dt>
                {monthName} {CONVERSION_STATUS_LABEL[status]}
              </dt>
              <dd>
                <Won value={summary[status].commission} size="md" tone={status === "confirmed" ? "red" : "ink"} />
                <span className={styles.count}>
                  {formatNumber(summary[status].count)}건 · 주문 {formatWon(summary[status].orders)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </Band>
      <Page>
        <div className={styles.layout}>
          <Section id="ledger" title={`${monthName} 주문 장부`} note={`${formatNumber(rows.length)}건`}>
            <div className={styles.toolbar}>
              <nav className={formStyles.segmented} aria-label="상태로 거르기">
                <Link href={href({ status: null, pages: 1 })} className={formStyles.segment} aria-current={!filters.status ? "page" : undefined}>
                  전체
                </Link>
                {CONVERSION_STATUSES.map((status) => (
                  <Link key={status} href={href({ status, pages: 1 })} className={formStyles.segment} aria-current={filters.status === status ? "page" : undefined}>
                    {CONVERSION_STATUS_LABEL[status]}
                  </Link>
                ))}
              </nav>
              <ConversionFilters
                months={months}
                programs={programs}
                month={filters.month}
                programId={filters.programId ?? ""}
                status={filters.status ?? ""}
                linkId={filters.linkId ?? ""}
              />
            </div>
            {scopedLink ? (
              <p className={styles.scopeNote}>
                &lsquo;{scopedLink.productName}&rsquo; 링크의 기록만 보는 중
                <Link href={href({ linkId: null, pages: 1 })} className={ui.quiet}>
                  모든 링크 보기
                </Link>
              </p>
            ) : null}
            {rows.length > 0 ? (
              <>
                <ConversionTable rows={rows} caption={`${monthName} 판매 기록`} />
                {hasMore ? (
                  <div className={styles.more}>
                    <Link href={href({ pages: filters.pages + 1 })} className={ui.base} scroll={false}>
                      {CONVERSION_PAGE_SIZE}건 더 보기
                    </Link>
                  </div>
                ) : null}
              </>
            ) : (
              <Empty title={`${monthName}에 해당하는 판매 기록이 없어요`}>다른 달이나 상태를 골라 보거나, 오른쪽에서 새 주문을 기록하세요.</Empty>
            )}
          </Section>
          <div id="record" className={styles.formPanel}>
            <ConversionForm options={options} today={today} />
          </div>
        </div>
      </Page>
    </>
  );
}
