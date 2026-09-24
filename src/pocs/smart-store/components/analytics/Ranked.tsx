import Link from "next/link";
import { formatKrw, formatNumber, formatPercent } from "@/core/format";
import { categoryLabel } from "../../domain/categories";
import type { CategoryShare, TopSeller } from "../../domain/analytics";
import { EmptyState } from "../ui/EmptyState";
import styles from "./charts.module.css";

/** Revenue by category as ranked bars (one hue; the share is the label). */
export function CategoryShares({ categories }: { categories: CategoryShare[] }) {
  if (categories.length === 0) return <EmptyState title="이 기간에 팔린 상품이 없어요." />;
  const max = Math.max(...categories.map((c) => c.revenue), 1);
  return (
    <ol className={styles.ranked}>
      {categories.map((c) => (
        <li key={c.category} className={`${styles.rankRow} ${styles.shareRow}`}>
          <span className={styles.rankName}>{categoryLabel(c.category)}</span>
          <span className={styles.rankValue}>{formatPercent(c.share)}</span>
          <span className={`${styles.rankTrack} ${styles.full}`} aria-hidden>
            <span className={styles.rankBar} style={{ width: `${(c.revenue / max) * 100}%` }} />
          </span>
          <span className={`${styles.rankMeta} ${styles.full}`}>{formatKrw(c.revenue)}</span>
        </li>
      ))}
    </ol>
  );
}

export function TopSellers({ sellers }: { sellers: TopSeller[] }) {
  if (sellers.length === 0) return <EmptyState title="이 기간에 팔린 상품이 없어요." />;
  const max = Math.max(...sellers.map((s) => s.revenue), 1);
  return (
    <ol className={styles.ranked}>
      {sellers.map((seller, i) => (
        <li key={seller.productKey} className={styles.rankRow}>
          <span className={styles.rankNo} aria-hidden>
            {i + 1}
          </span>
          {seller.listingId ? (
            <Link href={`/smart-store/listings/${seller.listingId}`} className={styles.rankName}>
              <span className={styles.visuallyHiddenInline}>{i + 1}위 </span>
              {seller.productName}
            </Link>
          ) : (
            <span className={styles.rankName}>{seller.productName}</span>
          )}
          <span className={styles.rankValue}>{formatKrw(seller.revenue)}</span>
          <span className={styles.rankTrack} aria-hidden>
            <span className={styles.rankBar} style={{ width: `${(seller.revenue / max) * 100}%` }} />
          </span>
          <span className={styles.rankMeta}>
            {categoryLabel(seller.category)} · {formatNumber(seller.units)}개 판매 · 남는 돈 {formatKrw(seller.profit)}
          </span>
        </li>
      ))}
    </ol>
  );
}
