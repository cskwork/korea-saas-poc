import Link from "next/link";
import { MIN_MARGIN_MAX } from "../../server/search-params";
import type { CatalogEntry, CatalogFilters } from "../../server/data/catalog";
import { EmptyState } from "../ui/EmptyState";
import { FilterResults, FilterScope } from "../ui/FilterScope";
import { PageHead } from "../ui/PageHead";
import filterStyles from "../ui/filters.module.css";
import ui from "../ui/ui.module.css";
import { CatalogBoard } from "./CatalogBoard";
import { SourcingFilters } from "./SourcingFilters";

interface Props {
  filters: CatalogFilters;
  entries: CatalogEntry[];
  hiddenByMargin: number;
}

export function SourcingPage({ filters, entries, hiddenByMargin }: Props) {
  const filtered = Boolean(filters.supplier || filters.category || filters.query || filters.minMargin > 0);
  return (
    <>
      <PageHead
        title="도매 소싱"
        lede="권장 판매가에서 매입가, 네이버 카테고리 수수료, 도매처 배송비를 뺀 금액이 남는 돈이에요. 샘플 도매 상품 목록이에요."
      />
      <FilterScope>
        <SourcingFilters
          supplier={filters.supplier}
          category={filters.category}
          minMargin={filters.minMargin}
          query={filters.query}
          sort={filters.sort}
          maxMargin={MIN_MARGIN_MAX}
        />
        <FilterResults>
          <p className={filterStyles.summary} aria-live="polite">
            {entries.length}개 상품
            {hiddenByMargin > 0 ? ` · 마진 ${filters.minMargin}% 미만 ${hiddenByMargin}개 숨김` : ""}
          </p>
          {entries.length > 0 ? (
            <CatalogBoard entries={entries} />
          ) : (
            <div className={ui.slip}>
              <EmptyState
                title="조건에 맞는 도매 상품이 없어요."
                action={
                  filtered ? (
                    <Link href="/smart-store/sourcing" className={`${ui.btn} ${ui.btnSm}`}>
                      필터 모두 풀기
                    </Link>
                  ) : undefined
                }
              >
                최소 마진율을 낮추거나 도매처·카테고리 조건을 넓혀 보세요.
              </EmptyState>
            </div>
          )}
        </FilterResults>
      </FilterScope>
    </>
  );
}
