import Form from "next/form";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  ORDER_TYPE_INFO,
  STATUS_INFO,
  type OrderStatus,
  type OrderType,
} from "../../domain/catalog";
import type { OrderSort, OrderSummary } from "../../server/order-data";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import { CutTable } from "./CutTable";
import styles from "./orders.module.css";

export interface OrdersQuery {
  status?: OrderStatus | "open";
  type?: OrderType;
  q?: string;
  sort: OrderSort;
}

interface OrdersViewProps {
  query: OrdersQuery;
  orders: OrderSummary[];
  counts: Record<OrderStatus, number>;
  today: string;
}

const SORT_LABEL: Record<OrderSort, string> = { due: "마감 가까운 순", recent: "최근 접수 순", amount: "금액 큰 순" };

function href(query: OrdersQuery, patch: Partial<OrdersQuery>) {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.status) params.set("status", next.status);
  if (next.type) params.set("type", next.type);
  if (next.q) params.set("q", next.q);
  if (next.sort !== "due") params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `${paths.orders}?${qs}` : paths.orders;
}

export function OrdersView({ query, orders, counts, today }: OrdersViewProps) {
  const total = ORDER_STATUSES.reduce((acc, s) => acc + counts[s], 0);
  const open = counts.received + counts.drafting + counts.revision;
  const filtered = Boolean(query.type || query.q);

  return (
    <>
      <SheetHeader
        title="주문 콘티"
        lead="장면(S#)을 눌러 단계별로 보고, 작업 종류와 검색어로 좁혀 보세요."
        actions={
          <Link href={paths.newOrder} className={ui.button}>
            <Plus size={16} aria-hidden="true" />새 주문 접수
          </Link>
        }
      >
        <HeaderCell
          label="전체"
          value={`${total}건`}
          href={href(query, { status: undefined })}
          current={!query.status}
        />
        <HeaderCell
          label="진행 중"
          value={`${open}건`}
          href={href(query, { status: "open" })}
          current={query.status === "open"}
        />
        {ORDER_STATUSES.map((status) => (
          <HeaderCell
            key={status}
            label={`S#${STATUS_INFO[status].scene} ${STATUS_INFO[status].label}`}
            value={`${counts[status]}건`}
            href={href(query, { status })}
            current={query.status === status}
            tone={status === "revision" && counts.revision > 0 ? "alert" : undefined}
          />
        ))}
      </SheetHeader>

      <div className={styles.body}>
        <Form action={paths.orders} className={styles.filters} role="search" aria-label="주문 찾기">
          {query.status && <input type="hidden" name="status" value={query.status} />}
          <div className={ui.field}>
            <label className={ui.label} htmlFor="orders-q">
              검색
            </label>
            <input
              id="orders-q"
              className={ui.input}
              type="search"
              name="q"
              defaultValue={query.q}
              placeholder="고객, 작업명, 주문번호"
              maxLength={50}
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="orders-type">
              작업 종류
            </label>
            <select id="orders-type" className={ui.input} name="type" defaultValue={query.type ?? ""}>
              <option value="">전체</option>
              {ORDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ORDER_TYPE_INFO[type].label}
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label className={ui.label} htmlFor="orders-sort">
              정렬
            </label>
            <select id="orders-sort" className={ui.input} name="sort" defaultValue={query.sort}>
              {(Object.keys(SORT_LABEL) as OrderSort[]).map((sort) => (
                <option key={sort} value={sort}>
                  {SORT_LABEL[sort]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={[ui.button, styles.submit].join(" ")}>
            <Search size={16} aria-hidden="true" />
            찾기
          </button>
        </Form>

        <p className={styles.resultLine} role="status">
          <strong>{orders.length}건</strong>
          {query.status && <span> · {query.status === "open" ? "진행 중" : STATUS_INFO[query.status].label}</span>}
          {query.type && <span> · {ORDER_TYPE_INFO[query.type].label}</span>}
          {query.q && <span> · “{query.q}”</span>}
          {(filtered || query.status) && (
            <Link href={paths.orders} className={ui.quiet}>
              조건 지우기
            </Link>
          )}
        </p>

        {orders.length > 0 ? (
          <CutTable orders={orders} today={today} label="주문 목록" />
        ) : (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>{total === 0 ? "아직 받은 주문이 없어요" : "조건에 맞는 주문이 없어요"}</p>
            <p className={ui.emptyText}>
              {total === 0
                ? "가격표에서 패키지를 고르거나 새 주문 접수를 눌러 첫 주문을 받아 보세요. 접수한 주문은 이 콘티에 마감 순서로 쌓여요."
                : "검색어를 줄이거나 작업 종류를 전체로 바꿔 보세요. 단계(S#) 칸을 눌러 다른 단계의 주문도 볼 수 있어요."}
            </p>
            {total === 0 ? (
              <Link href={paths.newOrder} className={ui.button}>
                새 주문 접수
              </Link>
            ) : (
              <Link href={paths.orders} className={[ui.button, ui.secondary].join(" ")}>
                모든 주문 보기
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
