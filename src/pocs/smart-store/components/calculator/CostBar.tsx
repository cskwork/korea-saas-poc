import clsx from "clsx";
import { formatNumber, formatPercent } from "@/core/format";
import { costStructure, type MarginBreakdown } from "../../domain/margin";
import styles from "./calculator.module.css";

/**
 * Where the sale price goes: cost, fee and shipping in ink tones, what is left
 * in POP yellow (emphasis form). At a loss the costs overrun the price line.
 */
export function CostBar({ margin }: { margin: MarginBreakdown }) {
  const parts = costStructure(margin);
  const totalCosts = margin.cost + margin.fee + margin.shipping;
  const loss = margin.profit < 0;
  const priceAt = loss && totalCosts > 0 ? margin.price / totalCosts : 1;
  return (
    <figure className={styles.costFigure}>
      <figcaption className={styles.costCaption}>판매가 {formatNumber(margin.price)}원은 이렇게 나뉘어요</figcaption>
      <div
        className={styles.costBar}
        role="img"
        aria-label={parts.map((p) => `${p.label} ${formatNumber(p.amount)}원`).join(", ")}
      >
        <div className={styles.costTrack}>
          {parts
            .filter((part) => part.share > 0)
            .map((part) => (
              <span
                key={part.key}
                className={clsx(styles.costSeg, styles[`seg_${part.key}`])}
                style={{ flexGrow: part.share }}
                title={`${part.label} ${formatNumber(part.amount)}원`}
              >
                {part.share >= 0.12 ? formatPercent(part.share, 0) : null}
              </span>
            ))}
        </div>
        {loss ? <span className={styles.priceLine} style={{ left: `${priceAt * 100}%` }} aria-hidden /> : null}
      </div>
      <ul className={styles.costLegend}>
        {parts.map((part) => (
          <li key={part.key}>
            <span className={clsx(styles.swatch, styles[`seg_${part.key}`])} aria-hidden />
            {part.label}
            <strong className={clsx(part.key === "profit" && part.amount < 0 && styles.lossText)}>
              {part.amount < 0 ? "−" : ""}
              {formatNumber(Math.abs(part.amount))}원
            </strong>
          </li>
        ))}
      </ul>
      {loss ? (
        <p className={styles.lossNote}>
          비용이 판매가를 {formatNumber(-margin.profit)}원 넘어요. 빨간 선이 판매가 위치예요.
        </p>
      ) : null}
    </figure>
  );
}
