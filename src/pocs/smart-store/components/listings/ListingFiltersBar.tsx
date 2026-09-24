"use client";

import { Search } from "lucide-react";
import { useDebounced, useFilters, useSearchText, useSyncedState } from "../ui/FilterScope";
import styles from "../ui/filters.module.css";

const TABS = [
  { value: "", label: "전체" },
  { value: "selling", label: "판매중" },
  { value: "paused", label: "판매중지" },
] as const;

export function ListingFiltersBar({
  status,
  query,
  counts,
}: {
  status?: string;
  query?: string;
  counts: { selling: number; paused: number };
}) {
  const { update } = useFilters();
  const [statusValue, setStatus] = useSyncedState(status ?? "");
  const [q, setQ] = useSearchText(query);
  const debouncedQuery = useDebounced((value: string) => update({ q: value.trim() || undefined }));
  const total = counts.selling + counts.paused;

  return (
    <form
      action="/smart-store/listings"
      className={styles.bar}
      role="search"
      aria-label="등록 상품 필터"
      onSubmit={(event) => {
        event.preventDefault();
        update({ q: q.trim() || undefined });
      }}
    >
      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>판매 상태</legend>
        <div className={styles.segments}>
          {TABS.map((tab) => (
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
                {tab.label} {tab.value === "" ? total : counts[tab.value]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={`${styles.group} ${styles.search}`}>
        <label className={styles.groupLabel} htmlFor="listings-q">
          상품명 검색
        </label>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            id="listings-q"
            type="search"
            name="q"
            value={q}
            placeholder="예: 텀블러"
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
