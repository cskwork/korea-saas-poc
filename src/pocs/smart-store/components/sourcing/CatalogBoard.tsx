import Link from "next/link";
import clsx from "clsx";
import { formatNumber } from "@/core/format";
import { SUPPLIER_LABEL, categoryLabel, formatFeeRate } from "../../domain/categories";
import type { CatalogEntry } from "../../server/data/catalog";
import { ListItemButton } from "../listings/ListItemButton";
import { MarginChip } from "../ui/HangTag";
import { StatusChip } from "../ui/StatusChip";
import ui from "../ui/ui.module.css";
import styles from "./sourcing.module.css";

/** The wholesale price board (시세표): one row per item, margin after fee and shipping on the right. */
export function CatalogBoard({ entries }: { entries: CatalogEntry[] }) {
  return (
    <div className={clsx(ui.slip, styles.board)}>
      <table className={styles.table}>
        <caption className={ui.visuallyHidden}>도매 상품과 권장 판매가 기준 마진</caption>
        <thead>
          <tr>
            <th scope="col">상품</th>
            <th scope="col" className={styles.num}>
              매입가
            </th>
            <th scope="col" className={styles.num}>
              배송비
            </th>
            <th scope="col" className={styles.num}>
              권장 판매가
            </th>
            <th scope="col" className={styles.num}>
              수수료
            </th>
            <th scope="col">남는 돈 · 마진율</th>
            <th scope="col">
              <span className={ui.visuallyHidden}>등록</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <th scope="row" className={styles.product}>
                <Link href={`/smart-store/sourcing/${entry.id}`} className={styles.productName}>
                  {entry.name}
                </Link>
                <span className={styles.productMeta}>
                  {SUPPLIER_LABEL[entry.supplier]} · {categoryLabel(entry.category)} ·{" "}
                  <span className={ui.num}>{entry.code}</span> · 재고 {formatNumber(entry.stock)}
                </span>
              </th>
              <td className={styles.num} data-label="매입가">
                {formatNumber(entry.wholesalePrice)}
              </td>
              <td className={styles.num} data-label="배송비">
                {entry.shippingCost ? formatNumber(entry.shippingCost) : "무료"}
              </td>
              <td className={clsx(styles.num, styles.strong)} data-label="권장 판매가">
                {formatNumber(entry.suggestedPrice)}
              </td>
              <td className={styles.num} data-label="수수료">
                {formatNumber(entry.margin.fee)}
                <span className={styles.feeRate}>{formatFeeRate(entry.margin.feeRateBp)}</span>
              </td>
              <td className={styles.margin} data-label="남는 돈">
                <MarginChip margin={entry.margin} />
              </td>
              <td className={styles.action}>
                {entry.listing ? (
                  <Link href={`/smart-store/listings/${entry.listing.id}`} className={clsx(ui.btn, ui.btnSm)}>
                    <StatusChip kind={entry.listing.status} />
                    등록 상품 보기
                  </Link>
                ) : (
                  <ListItemButton catalogItemId={entry.id} label="AI로 등록" quiet />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
