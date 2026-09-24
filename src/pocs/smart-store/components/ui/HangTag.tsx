import clsx from "clsx";
import { formatNumber, formatPercent } from "@/core/format";
import { MARGIN_TONE_LABEL, marginTone, type MarginBreakdown } from "../../domain/margin";
import styles from "./tag.module.css";

interface HangTagProps {
  margin: Pick<MarginBreakdown, "price" | "profit" | "marginRate">;
  /** Caption above the price, e.g. "권장 판매가". */
  caption?: string;
  size?: "md" | "lg";
  /** Re-ink the numbers when they change (live editors only; never on page load). */
  animate?: boolean;
  tilt?: boolean;
  className?: string;
}

/**
 * The POP hang tag: fluorescent card, marker-lettered price and what the seller
 * keeps after cost, the Naver fee and shipping. 흑자 in black ink, 적자 in red.
 */
export function HangTag({ margin, caption = "판매가", size = "md", animate, tilt, className }: HangTagProps) {
  if (margin.price <= 0) {
    return (
      <div className={clsx(styles.wrap, tilt && styles.tilt, className)}>
        <div className={clsx(styles.tag, styles[size], styles.blank)}>
          <span className={styles.caption}>{caption}</span>
          <span className={styles.blankText}>판매가를 넣으면 남는 돈을 여기에 적어 드려요.</span>
        </div>
      </div>
    );
  }
  const tone = marginTone(margin);
  const loss = tone === "loss";
  const ink = animate ? styles.ink : undefined;
  return (
    <div className={clsx(styles.wrap, tilt && styles.tilt, className)}>
      <div className={clsx(styles.tag, styles[size], loss && styles.lossTag)}>
        <span className={styles.caption}>{caption}</span>
        <span className={styles.price}>
          <span key={margin.price} className={ink}>
            {formatNumber(margin.price)}
          </span>
          <span className={styles.won}>원</span>
        </span>
        <span className={styles.rule} aria-hidden />
        <span className={styles.keepLabel}>{loss ? "팔 때마다 손해" : "남는 돈"}</span>
        <span className={styles.keep}>
          <span key={margin.profit} className={ink}>
            {margin.profit > 0 ? "+" : margin.profit < 0 ? "−" : ""}
            {formatNumber(Math.abs(margin.profit))}
          </span>
          <span className={styles.keepUnit}>원</span>
        </span>
        <span className={styles.rate}>
          마진 {formatPercent(margin.marginRate)}
          {size === "lg" ? <span className={styles.tone}>{MARGIN_TONE_LABEL[tone]}</span> : null}
        </span>
      </div>
    </div>
  );
}

/** Inline margin label for dense rows: a small tag with what the seller keeps. */
export function MarginChip({ margin }: { margin: Pick<MarginBreakdown, "profit" | "marginRate"> }) {
  const loss = margin.profit <= 0;
  return (
    <span className={clsx(styles.chip, loss && styles.chipLoss)}>
      <span className={styles.chipKeep}>
        {margin.profit > 0 ? "+" : margin.profit < 0 ? "−" : ""}
        {formatNumber(Math.abs(margin.profit))}
      </span>
      <span className={styles.chipRate}>{formatPercent(margin.marginRate)}</span>
    </span>
  );
}
