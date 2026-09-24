import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatDate, formatKrw, formatNumber, formatRelative, formatTime } from "@/core/format";
import { formatTrackingNumber } from "../../domain/orders";
import type { OrderEntry, OrderFilters, StatusCounts } from "../../server/data/orders";
import { PAGE_SIZE } from "../../server/data/shared";
import { EmptyState } from "../ui/EmptyState";
import { FilterResults, FilterScope } from "../ui/FilterScope";
import { MarginChip } from "../ui/HangTag";
import { PageHead } from "../ui/PageHead";
import { Slip } from "../ui/Slip";
import { StatusChip } from "../ui/StatusChip";
import ui from "../ui/ui.module.css";
import { OrderActions } from "./OrderActions";
import { OrderFiltersBar } from "./OrderFiltersBar";
import { TestOrderForm } from "./TestOrderForm";
import styles from "./orders.module.css";

interface Props {
  rows: OrderEntry[];
  total: number;
  page: number;
  pages: number;
  counts: StatusCounts;
  listings: { id: string; title: string; price: number }[];
  filters: OrderFilters;
  now: Date;
}

function pageHref(filters: OrderFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.query) params.set("q", filters.query);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/smart-store/orders?${query}` : "/smart-store/orders";
}

function stepNote(order: OrderEntry, now: Date) {
  switch (order.status) {
    case "new":
      return `${formatRelative(order.orderedAt, now)} 주문 · 도매처에 발주하고 확인을 눌러 주세요`;
    case "confirmed":
      return `발주 확인 ${order.confirmedAt ? formatRelative(order.confirmedAt, now) : ""} · 도매처 송장을 입력해 주세요`;
    case "shipping":
      return `${order.shippedAt ? formatDate(order.shippedAt, { month: "numeric", day: "numeric" }) : ""} 발송`;
    case "delivered":
      return `${order.deliveredAt ? formatDate(order.deliveredAt, { month: "numeric", day: "numeric" }) : ""} 배송 완료`;
    case "cancelled":
      return `${order.cancelledAt ? formatDate(order.cancelledAt, { month: "numeric", day: "numeric" }) : ""} 취소됨`;
  }
}

export function OrdersPage({ rows, total, page, pages, counts, listings, filters, now }: Props) {
  return (
    <>
      <PageHead
        title="주문"
        lede="신규주문 → 발주확인 → 배송중 → 배송완료. 들어온 주문을 도매처에 넘기고 송장을 입력하세요. 모든 주문은 샘플이에요."
      />
      <details className={clsx(ui.slip, styles.testBox)}>
        <summary className={styles.testSummary}>
          <span className={styles.testIcon} aria-hidden>
            <Plus size={14} strokeWidth={2.5} />
          </span>
          테스트 주문 넣기
        </summary>
        <div className={styles.testBody}>
          <p className={ui.muted}>
            판매중인 상품에 구매자가 주문한 것처럼 신규주문을 만들어요. 매출 분석에도 반영돼요.
          </p>
          <TestOrderForm listings={listings} />
        </div>
      </details>
      <FilterScope>
        <OrderFiltersBar status={filters.status} query={filters.query} counts={counts} />
        <FilterResults>
          <Slip flush>
            {rows.length === 0 ? (
              <EmptyState
                title={filters.status || filters.query ? "조건에 맞는 주문이 없어요." : "아직 주문이 없어요."}
              >
                위의 &lsquo;테스트 주문 넣기&rsquo;로 주문을 만들어 처리 흐름을 확인해 보세요.
              </EmptyState>
            ) : (
              <ol className={styles.orders}>
                {rows.map((order) => (
                  <li key={order.id} className={clsx(styles.order, order.status === "cancelled" && styles.cancelled)}>
                    <div className={styles.orderHead}>
                      <StatusChip kind={order.status} />
                      <span className={clsx(ui.num, styles.orderNo)}>{order.orderNo}</span>
                      {order.isTest ? <StatusChip kind="quiet">테스트</StatusChip> : null}
                      <time className={styles.orderTime} dateTime={order.orderedAt.toISOString()}>
                        {formatDate(order.orderedAt, { month: "numeric", day: "numeric" })}{" "}
                        {formatTime(order.orderedAt)}
                      </time>
                    </div>
                    <div className={styles.orderBody}>
                      <div className={styles.orderMain}>
                        <p className={styles.orderName}>{order.productName}</p>
                        <p className={styles.orderWho}>
                          {order.customerName} · {order.region} · {formatNumber(order.quantity)}개
                        </p>
                        <p className={styles.orderStep}>
                          {stepNote(order, now)}
                          {order.trackingNumber ? (
                            <span className={styles.tracking}>
                              {order.courier}{" "}
                              <span className={ui.num}>{formatTrackingNumber(order.trackingNumber)}</span>
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className={styles.orderMoney}>
                        <span className={styles.orderTotal}>{formatKrw(order.amounts.revenue)}</span>
                        {order.status === "cancelled" ? null : (
                          <MarginChip
                            margin={{
                              profit: order.amounts.profit,
                              marginRate: order.amounts.profit / order.amounts.revenue,
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <OrderActions id={order.id} status={order.status} orderNo={order.orderNo} />
                  </li>
                ))}
              </ol>
            )}
            {pages > 1 ? (
              <div className={ui.pagination}>
                <span>
                  {formatNumber(total)}건 중 {formatNumber((page - 1) * PAGE_SIZE + 1)}–
                  {formatNumber(Math.min(page * PAGE_SIZE, total))}
                </span>
                <nav aria-label="주문 페이지">
                  {page > 1 ? (
                    <Link href={pageHref(filters, page - 1)} className={clsx(ui.btn, ui.btnSm)} scroll={false}>
                      <ChevronLeft size={14} aria-hidden /> 이전
                    </Link>
                  ) : null}
                  <span className={styles.pageNo} aria-current="page">
                    {page} / {pages}
                  </span>
                  {page < pages ? (
                    <Link href={pageHref(filters, page + 1)} className={clsx(ui.btn, ui.btnSm)} scroll={false}>
                      다음 <ChevronRight size={14} aria-hidden />
                    </Link>
                  ) : null}
                </nav>
              </div>
            ) : null}
          </Slip>
        </FilterResults>
      </FilterScope>
    </>
  );
}
