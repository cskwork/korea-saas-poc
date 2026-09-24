"use client";

import clsx from "clsx";
import { Search } from "lucide-react";
import { useFilters, useSearchText } from "../ui/FilterScope";
import filters from "../ui/filters.module.css";
import ui from "../ui/ui.module.css";

export function KeywordSearch({ query }: { query: string }) {
  const { update, pending } = useFilters();
  const [q, setQ] = useSearchText(query || undefined);
  return (
    <form
      action="/smart-store/keywords"
      className={filters.bar}
      role="search"
      aria-label="키워드 분석"
      onSubmit={(event) => {
        event.preventDefault();
        update({ q: q.trim() || undefined });
      }}
    >
      <div className={clsx(filters.group, filters.search)}>
        <label className={filters.groupLabel} htmlFor="keyword-q">
          분석할 키워드
        </label>
        <div className={filters.searchBox}>
          <Search size={16} strokeWidth={2} aria-hidden />
          <input
            id="keyword-q"
            type="search"
            name="q"
            value={q}
            maxLength={40}
            placeholder="예: 텀블러, 여성 원피스, 선크림"
            onChange={(event) => setQ(event.target.value)}
          />
        </div>
      </div>
      <button type="submit" className={clsx(ui.btn, ui.btnPop)} disabled={pending}>
        분석
      </button>
    </form>
  );
}
