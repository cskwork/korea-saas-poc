"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CustomerSort } from "../../server/store/customers";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import styles from "./customers.module.css";

const SORTS: { value: CustomerSort; label: string }[] = [
  { value: "visits", label: "방문 많은 순" },
  { value: "recent", label: "최근 방문 순" },
  { value: "name", label: "이름 순" },
];

/**
 * Live search by name or phone digits, kept in the URL (?q=&sort=) so the list is
 * server-rendered, shareable and survives a refresh. Works as a plain GET form without JS.
 */
export function CustomerSearch({ query, sort, count }: { query: string; sort: CustomerSort; count: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const navigate = (q: string, s: CustomerSort) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (s !== "visits") params.set("sort", s);
    const search = params.toString();
    startTransition(() => router.replace(`/micro-saas/customers${search ? `?${search}` : ""}`, { scroll: false }));
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <form
      className={styles.searchForm}
      action="/micro-saas/customers"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(timer.current);
        navigate(value, sort);
      }}
    >
      <div className={styles.search} aria-busy={pending}>
        <label htmlFor="customer-search" className={ui.visuallyHidden}>
          고객 검색
        </label>
        <Icon name="search" />
        <input
          id="customer-search"
          name="q"
          type="search"
          placeholder="이름 또는 연락처로 찾기"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => navigate(next, sort), 250);
          }}
        />
        <span className={styles.count} aria-live="polite">
          {count}
        </span>
      </div>
      <label className={styles.sort}>
        <span className={ui.visuallyHidden}>정렬</span>
        <select
          name="sort"
          value={sort}
          onChange={(event) => navigate(value, event.target.value as CustomerSort)}
          aria-label="정렬"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
