import Link from "next/link";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { formatKrw, formatNumber } from "@/core/format";
import { categoryLabel } from "../../domain/categories";
import type { ListingEntry, ListingFilters } from "../../server/data/listings";
import { EmptyState } from "../ui/EmptyState";
import { FilterResults, FilterScope } from "../ui/FilterScope";
import { MarginChip } from "../ui/HangTag";
import { Notice } from "../ui/Notice";
import { PageHead } from "../ui/PageHead";
import { StatusChip } from "../ui/StatusChip";
import ui from "../ui/ui.module.css";
import { CopySourceLabel } from "./CopySourceLabel";
import { ListingFiltersBar } from "./ListingFiltersBar";
import { ListingStatusToggle } from "./ListingStatusToggle";
import styles from "./listings.module.css";

interface Props {
  entries: ListingEntry[];
  counts: { selling: number; paused: number };
  filters: ListingFilters;
  deleted: boolean;
}

export function ListingsPage({ entries, counts, filters, deleted }: Props) {
  return (
    <>
      <PageHead
        title="등록 상품"
        lede={`판매중 ${counts.selling}개 · 판매중지 ${counts.paused}개. 가격을 바꾸면 남는 돈이 바로 다시 계산돼요.`}
        actions={
          <>
            <Link href="/smart-store/sourcing" className={ui.btn}>
              도매 상품에서 고르기
            </Link>
            <Link href="/smart-store/listings/new" className={clsx(ui.btn, ui.btnPop)}>
              <Plus size={16} strokeWidth={2} aria-hidden /> 직접 입력해 등록
            </Link>
          </>
        }
      />
      {deleted ? <Notice tone="ok">상품을 삭제했어요. 이미 들어온 주문 기록은 그대로 남아 있어요.</Notice> : null}
      <FilterScope>
        <ListingFiltersBar status={filters.status} query={filters.query} counts={counts} />
        <FilterResults>
          {entries.length === 0 ? (
            <div className={ui.slip}>
              <EmptyState
                title={
                  filters.status || filters.query ? "조건에 맞는 등록 상품이 없어요." : "아직 등록한 상품이 없어요."
                }
                action={
                  <Link href="/smart-store/sourcing" className={clsx(ui.btn, ui.btnPop)}>
                    도매 상품 고르러 가기
                  </Link>
                }
              >
                소싱 목록에서 마진이 남는 도매 상품을 골라 AI로 한 번에 등록할 수 있어요.
              </EmptyState>
            </div>
          ) : (
            <ul className={styles.list}>
              {entries.map((entry) => (
                <li key={entry.id} className={clsx(ui.slip, styles.row, entry.status === "paused" && styles.paused)}>
                  <div className={styles.rowMain}>
                    <p className={styles.rowMeta}>
                      <StatusChip kind={entry.status} />
                      <span>{categoryLabel(entry.category)}</span>
                      <CopySourceLabel source={entry.copySource} />
                    </p>
                    <Link href={`/smart-store/listings/${entry.id}`} className={styles.rowTitle}>
                      {entry.title}
                    </Link>
                    <p className={styles.rowStats}>
                      주문 {formatNumber(entry.stats.orders)}건 · 판매 {formatNumber(entry.stats.units)}개 · 누적 매출{" "}
                      {formatKrw(entry.stats.revenue)}
                    </p>
                  </div>
                  <dl className={styles.rowPrices}>
                    <div>
                      <dt>매입가</dt>
                      <dd>{formatNumber(entry.cost)}</dd>
                    </div>
                    <div>
                      <dt>판매가</dt>
                      <dd className={styles.price}>{formatNumber(entry.price)}</dd>
                    </div>
                    <div>
                      <dt>남는 돈</dt>
                      <dd>
                        <MarginChip margin={entry.margin} />
                      </dd>
                    </div>
                  </dl>
                  <div className={styles.rowActions}>
                    <Link href={`/smart-store/listings/${entry.id}`} className={clsx(ui.btn, ui.btnSm)}>
                      가격·상품명 수정
                    </Link>
                    <ListingStatusToggle id={entry.id} status={entry.status} small />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </FilterResults>
      </FilterScope>
    </>
  );
}
