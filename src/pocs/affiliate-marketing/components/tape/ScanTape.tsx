import Link from "next/link";
import clsx from "clsx";
import { formatMonthDay, formatTime, seoulDateKey } from "@/core/format";
import { CHANNEL_LABEL, DEVICE_LABEL } from "../../domain/catalog";
import { shortDayLabel } from "../../domain/dates";
import type { RecentClick } from "../../server/stats";
import styles from "./tape.module.css";

/** The latest clicks printed like a POS scan log. */
export function ScanTape({
  clicks,
  head,
  showProduct = true,
  showDate = false,
  empty,
}: {
  clicks: RecentClick[];
  head?: React.ReactNode;
  showProduct?: boolean;
  showDate?: boolean;
  empty: string;
}) {
  return (
    <div className={clsx(styles.tape, showDate && styles.tapeWide)}>
      {head ? <p className={styles.tapeHead}>{head}</p> : null}
      {clicks.length > 0 ? (
        <ol className={styles.tapeList} role="list">
          {clicks.map((click) => (
            <li key={click.id} className={styles.tapeRow}>
              <time className={styles.tapeTime} dateTime={click.clickedAt.toISOString()} title={formatMonthDay(click.clickedAt)}>
                {showDate ? `${shortDayLabel(seoulDateKey(click.clickedAt))} ` : ""}
                {formatTime(click.clickedAt)}
              </time>
              {showProduct ? (
                <Link href={`/affiliate-marketing/links/${click.linkId}`} className={styles.tapeProduct}>
                  {click.productName}
                </Link>
              ) : (
                <span className={styles.tapeProduct}>{click.referrerHost ?? "리퍼러 없음"}</span>
              )}
              <span className={styles.tapeChannel}>
                {CHANNEL_LABEL[click.channel]} · {DEVICE_LABEL[click.device]}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.tapeEmpty}>{empty}</p>
      )}
    </div>
  );
}
