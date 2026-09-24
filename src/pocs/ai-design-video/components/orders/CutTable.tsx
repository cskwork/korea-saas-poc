import Link from "next/link";
import { Sparkles } from "lucide-react";
import { formatKrw } from "@/core/format";
import { ORDER_TYPE_INFO, STATUS_INFO } from "../../domain/catalog";
import { orderTotal } from "../../domain/pricing";
import type { OrderSummary } from "../../server/order-data";
import { Frame } from "../frame/Frame";
import { DueMark, RevisionTally, StatusMark } from "../marks";
import { paths } from "../paths";
import styles from "./cut-table.module.css";

interface CutTableProps {
  orders: readonly OrderSummary[];
  today: string;
  /** Accessible name of the list. */
  label: string;
}

/**
 * Orders as the rows of a 콘티 sheet: CUT | 화면 | 내용 | 진행 | 마감.
 * The cut number is the row's place in this sheet's order.
 */
export function CutTable({ orders, today, label }: CutTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.head} aria-hidden="true">
        <span>CUT</span>
        <span>화면</span>
        <span>내용</span>
        <span>진행</span>
        <span className={styles.headDue}>마감</span>
      </div>
      <ol className={styles.rows} aria-label={label} role="list">
        {orders.map((order, index) => {
          const info = ORDER_TYPE_INFO[order.type];
          const delivered = order.status === "delivered";
          return (
            <li key={order.id} className={styles.row} data-status={order.status}>
              <span className={styles.cut} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className={styles.frameCell}>
                <Frame type={order.type} medium={STATUS_INFO[order.status].medium} height={84} maxWidth={148} />
                <span className={styles.aspect}>{info.frame.aspect}</span>
              </div>
              <div className={styles.content}>
                <Link href={paths.order(order.id)} className={styles.title}>
                  {order.title}
                </Link>
                <p className={styles.meta}>
                  <span>{order.clientName}</span>
                  <span>{info.short}</span>
                  <span className={styles.package}>
                    {order.plan === "subscription" ? `${order.packageName} 구독` : order.packageName}
                  </span>
                  <span className={styles.code}>{order.code}</span>
                </p>
                {order.brief && <p className={styles.snippet}>{order.brief}</p>}
              </div>
              <div className={styles.progress}>
                <StatusMark status={order.status} />
                <RevisionTally limit={order.revisionLimit} used={order.revisionsUsed} />
                {order.hasBrief ? (
                  <span className={styles.brief}>
                    <Sparkles size={13} aria-hidden="true" />
                    콘티 있음
                  </span>
                ) : (
                  !delivered && <span className={styles.briefMissing}>콘티 없음</span>
                )}
              </div>
              <div className={styles.due}>
                <DueMark dueDate={order.dueDate} today={today} done={delivered} />
                <span className={styles.price}>
                  {formatKrw(orderTotal(order))}
                  {order.rush && <span className={styles.rush}>긴급</span>}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
