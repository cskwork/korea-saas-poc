"use client";

import { Search } from "lucide-react";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "../../domain/orders";
import type { StatusCounts } from "../../server/data/orders";
import { useDebounced, useFilters, useSearchText, useSyncedState } from "../ui/FilterScope";
import styles from "../ui/filters.module.css";

export function OrderFiltersBar({ status, query, counts }: { status?: string; query?: string; counts: StatusCounts }) {
  const { update } = useFilters();
  const [statusValue, setStatus] = useSyncedState(status ?? "");
  const [q, setQ] = useSearchText(query);
  const debouncedQuery = useDebounced((value: string) => update({ q: value.trim() || undefined }));
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const tabs = [
    { value: "", label: "전체", count: total },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s], count: counts[s] })),
  ];

  return (
    <form
      action="/smart-store/orders"
      className={styles.bar}
      role="search"
      aria-label="주문 필터"
      onSubmit={(event) => {
        event.preventDefault();
        update({ q: q.trim() || undefined });
      }}
    >
      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>주문 상태</legend>
        <div className={styles.segments}>
          {tabs.map((tab) => (
            <label key={tab.value} className={styles.segment}>
              <input
                type="radio"
                name="status"
                value={tab.value}
                checked={statusValue === tab.value}
                onChange={() => {
                  setStatus(tab.value);
                  update({ status: tab.value || undefined });
                }}
              />
              <span>
                {tab.label} <span className={styles.count}>{tab.count}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={`${styles.group} ${styles.search}`}>
        <label className={styles.groupLabel} htmlFor="orders-q">
          주문 검색
        </label>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            id="orders-q"
            type="search"
            name="q"
            value={q}
            placeholder="구매자, 상품명, 주문번호, 송장번호"
            onChange={(event) => {
              setQ(event.target.value);
              debouncedQuery(event.target.value);
            }}
          />
        </div>
      </div>
    </form>
  );
}
