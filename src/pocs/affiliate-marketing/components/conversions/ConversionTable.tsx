import Link from "next/link";
import { formatDate, formatWon } from "@/core/format";
import { CHANNEL_LABEL, CONVERSION_STATUS_LABEL, type ConversionStatus } from "../../domain/catalog";
import type { ConversionRow } from "../../server/conversions";
import { Chip, ui } from "../ui/primitives";
import { ConversionActions } from "./ConversionActions";
import styles from "./conversions.module.css";

const STATUS_TONE: Record<ConversionStatus, "muted" | "ok" | "red"> = { pending: "muted", confirmed: "ok", cancelled: "red" };

function detail(row: ConversionRow): string {
  return [row.channel ? CHANNEL_LABEL[row.channel] : "채널 모름", row.note].filter(Boolean).join(" · ");
}

/** The order ledger. `showProduct` is off on a link's own page. */
export function ConversionTable({ rows, showProduct = true, caption }: { rows: ConversionRow[]; showProduct?: boolean; caption: string }) {
  return (
    <div className={styles.ledger}>
      <table className={styles.table}>
        <caption className={ui.srOnly}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.left}>
              주문일
            </th>
            <th scope="col" className={styles.left}>
              {showProduct ? "상품" : "채널 · 메모"}
            </th>
            <th scope="col">주문 금액</th>
            <th scope="col">수수료</th>
            <th scope="col" className={styles.left}>
              상태
            </th>
            <th scope="col">
              <span className={ui.srOnly}>작업</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-status={row.status}>
              <td className={styles.left}>{formatDate(`${row.orderedOn}T12:00:00+09:00`, { month: "short", day: "numeric", weekday: "short" })}</td>
              <td className={`${styles.left} ${styles.product}`}>
                {showProduct ? (
                  <>
                    <Link href={`/affiliate-marketing/links/${row.linkId}`}>{row.productName}</Link>
                    <span className={styles.sub}>
                      {row.programName ?? "프로그램 미지정"} · {detail(row)}
                    </span>
                  </>
                ) : (
                  <span className={styles.sub}>{detail(row)}</span>
                )}
              </td>
              <td className={styles.money} data-label="주문">
                {formatWon(row.orderAmountWon)}
              </td>
              <td data-label="수수료">
                <span className={`${styles.commission} ${styles.money}`}>{formatWon(row.commissionWon)}</span>
                {row.commissionOverridden ? <span className={styles.override}>직접 입력</span> : null}
              </td>
              <td className={styles.left}>
                <Chip tone={STATUS_TONE[row.status]}>{CONVERSION_STATUS_LABEL[row.status]}</Chip>
              </td>
              <td className={styles.full}>
                <ConversionActions id={row.id} status={row.status} label={`${row.productName} ${row.orderedOn}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
