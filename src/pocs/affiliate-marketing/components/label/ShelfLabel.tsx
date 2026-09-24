import Link from "next/link";
import clsx from "clsx";
import { formatNumber, formatPercent } from "@/core/format";
import { CATEGORIES } from "../../domain/catalog";
import { Sticker, Won, ui } from "../ui/primitives";
import { ScanCopy } from "./ScanCopy";
import styles from "./label.module.css";

export interface ShelfLabelData {
  id: string;
  code: string;
  productName: string;
  programName: string | null;
  category: string;
  clicks: number;
  conversions: number;
  revenue: number;
  cvr: number;
  epc: number;
  status?: "active" | "paused" | "expired";
}

/**
 * A link as a shelf-edge price label: the price is what the link earned, the
 * 단위가격 box is earnings per click, and the barcode copies the short link.
 */
export function ShelfLabel({
  data,
  url,
  rank,
  promo,
  hero,
  fresh,
  priceCaption = "수익",
}: {
  data: ShelfLabelData;
  url: string;
  rank?: number;
  promo?: boolean;
  hero?: boolean;
  /** Just created: plays the clip-on motion once. */
  fresh?: boolean;
  priceCaption?: string;
}) {
  const muted = data.status === "expired" || data.status === "paused";
  return (
    <article className={clsx(styles.label, promo && styles.promo, muted && styles.muted, hero && styles.hero, rank && styles.ranked, fresh && styles.fresh)} aria-label={`${data.productName} 가격표`}>
      {rank ? (
        <span className={styles.rank}>
          <Sticker label={`${rank}위`}>{rank}위</Sticker>
        </span>
      ) : null}
      <div className={styles.labelTop}>
        <span className={styles.labelProgram}>{data.programName ?? "프로그램 미지정"}</span>
        <span>{(CATEGORIES as readonly string[]).includes(data.category) ? data.category : "기타"}</span>
      </div>
      {hero ? (
        <p className={styles.name}>{data.productName}</p>
      ) : (
        <Link href={`/affiliate-marketing/links/${data.id}`} className={styles.name}>
          {data.productName}
        </Link>
      )}
      <div className={styles.priceRow}>
        <span className={styles.unitBox}>
          클릭당
          <span className={styles.unitValue}>{formatNumber(Math.round(data.epc))}원</span>
        </span>
        <span className={styles.price}>
          <span className={ui.srOnly}>{priceCaption} </span>
          <Won value={data.revenue} size={hero ? "lg" : "md"} />
        </span>
      </div>
      <p className={styles.facts}>
        <span>
          클릭 <b>{formatNumber(data.clicks)}</b>
        </span>
        <span>
          판매 <b>{formatNumber(data.conversions)}</b>
        </span>
        <span>
          전환 <b>{formatPercent(data.cvr)}</b>
        </span>
      </p>
      <ScanCopy code={data.code} url={url} />
    </article>
  );
}

export function Rail({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className={styles.rail}>
      <div className={styles.railTrack} role="list" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

export function RailItem({ children }: { children: React.ReactNode }) {
  return <div role="listitem">{children}</div>;
}
