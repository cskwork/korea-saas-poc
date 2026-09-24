"use client";

import { Search } from "lucide-react";
import { CATALOG_CATEGORIES, CATEGORY_INFO, SUPPLIERS, SUPPLIER_LABEL } from "../../domain/categories";
import { useDebounced, useFilters, useSearchText, useSyncedState } from "../ui/FilterScope";
import styles from "../ui/filters.module.css";

interface Props {
  supplier?: string;
  category?: string;
  minMargin: number;
  query?: string;
  sort: string;
  maxMargin: number;
}

const SORT_LABEL = {
  margin: "마진율 높은 순",
  profit: "남는 돈 많은 순",
  price: "매입가 낮은 순",
  stock: "재고 많은 순",
} as const;

/** Supplier, category, minimum-margin, search and sort for the wholesale board (a GET form without JS). */
export function SourcingFilters({ supplier, category, minMargin, query, sort, maxMargin }: Props) {
  const { update } = useFilters();
  const [supplierValue, setSupplier] = useSyncedState(supplier ?? "");
  const [categoryValue, setCategory] = useSyncedState(category ?? "");
  const [sortValue, setSort] = useSyncedState(sort);
  const [min, setMin] = useSyncedState(minMargin);
  const [q, setQ] = useSearchText(query);
  const debouncedMin = useDebounced((value: number) => update({ min: value > 0 ? String(value) : undefined }));
  const debouncedQuery = useDebounced((value: string) => update({ q: value.trim() || undefined }));

  return (
    <form
      action="/smart-store/sourcing"
      className={styles.bar}
      role="search"
      aria-label="도매 상품 필터"
      onSubmit={(event) => {
        event.preventDefault();
        const q = new FormData(event.currentTarget).get("q");
        update({ q: typeof q === "string" && q.trim() ? q.trim() : undefined });
      }}
    >
      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>도매처</legend>
        <div className={styles.segments}>
          {[undefined, ...SUPPLIERS].map((value) => (
            <label key={value ?? "all"} className={styles.segment}>
              <input
                type="radio"
                name="supplier"
                value={value ?? ""}
                checked={supplierValue === (value ?? "")}
                onChange={() => {
                  setSupplier(value ?? "");
                  update({ supplier: value });
                }}
              />
              <span>{value ? SUPPLIER_LABEL[value] : "전체"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={`${styles.group} ${styles.half}`}>
        <label className={styles.groupLabel} htmlFor="sourcing-category">
          카테고리
        </label>
        <select
          id="sourcing-category"
          name="category"
          className={styles.control}
          value={categoryValue}
          onChange={(event) => {
            setCategory(event.target.value);
            update({ category: event.target.value || undefined });
          }}
        >
          <option value="">전체 카테고리</option>
          {CATALOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_INFO[c].feeLabel}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.group} ${styles.half}`}>
        <label className={styles.groupLabel} htmlFor="sourcing-sort">
          정렬
        </label>
        <select
          id="sourcing-sort"
          name="sort"
          className={styles.control}
          value={sortValue}
          onChange={(event) => {
            setSort(event.target.value);
            update({ sort: event.target.value === "margin" ? undefined : event.target.value });
          }}
        >
          {Object.entries(SORT_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.groupLabel} htmlFor="sourcing-min">
          최소 마진율
        </label>
        <div className={styles.range}>
          <input
            id="sourcing-min"
            type="range"
            name="min"
            min={0}
            max={maxMargin}
            step={5}
            value={min}
            aria-valuetext={min > 0 ? `${min}% 이상` : "제한 없음"}
            onChange={(event) => {
              const value = Number(event.target.value);
              setMin(value);
              debouncedMin(value);
            }}
          />
          <output htmlFor="sourcing-min">{min > 0 ? `${min}% 이상` : "제한 없음"}</output>
        </div>
      </div>

      <div className={`${styles.group} ${styles.search}`}>
        <label className={styles.groupLabel} htmlFor="sourcing-q">
          상품명·코드 검색
        </label>
        <div className={styles.searchBox}>
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            id="sourcing-q"
            type="search"
            name="q"
            value={q}
            placeholder="예: 텀블러, DMK-47730"
            onChange={(event) => {
              setQ(event.target.value);
              debouncedQuery(event.target.value);
            }}
          />
        </div>
      </div>
      <noscript>
        <button type="submit" className={styles.control}>
          적용
        </button>
      </noscript>
    </form>
  );
}
