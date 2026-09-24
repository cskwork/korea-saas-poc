import clsx from "clsx";
import { formatNumber, formatPercent } from "@/core/format";
import { formatFeeRate } from "../../domain/categories";
import type { MarginBreakdown } from "../../domain/margin";
import styles from "./receipt.module.css";

/** Itemised margin: the price minus cost, the Naver fee and shipping, as receipt lines. */
export function MarginReceipt({
  margin,
  priceLabel = "판매가",
  className,
}: {
  margin: MarginBreakdown;
  priceLabel?: string;
  className?: string;
}) {
  const loss = margin.profit < 0;
  if (margin.price <= 0) {
    return <p className={clsx(styles.empty, className)}>판매가를 넣으면 수수료와 남는 돈을 항목별로 계산해요.</p>;
  }
  return (
    <dl className={clsx(styles.receipt, className)}>
      <div className={styles.line}>
        <dt>{priceLabel}</dt>
        <dd>{formatNumber(margin.price)}원</dd>
      </div>
      <div className={styles.line}>
        <dt>매입가</dt>
        <dd>−{formatNumber(margin.cost)}원</dd>
      </div>
      <div className={styles.line}>
        <dt>네이버 수수료 {formatFeeRate(margin.feeRateBp)}</dt>
        <dd>−{formatNumber(margin.fee)}원</dd>
      </div>
      <div className={styles.line}>
        <dt>배송비</dt>
        <dd>{margin.shipping > 0 ? `−${formatNumber(margin.shipping)}원` : "도매처 무료"}</dd>
      </div>
      <div className={clsx(styles.line, styles.total, loss && styles.loss)}>
        <dt>{loss ? "손해" : "남는 돈"}</dt>
        <dd>
          {loss ? "−" : ""}
          {formatNumber(Math.abs(margin.profit))}원{" "}
          <span className={styles.rate}>({formatPercent(margin.marginRate)})</span>
        </dd>
      </div>
    </dl>
  );
}
