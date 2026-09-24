import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatKrw, formatNumber, formatRelative } from "@/core/format";
import type { OrderEntry } from "../../server/data/orders";
import { ConfirmOrderButton } from "../orders/ConfirmOrderButton";
import { EmptyState } from "../ui/EmptyState";
import { MarginChip } from "../ui/HangTag";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import styles from "./overview.module.css";

const DAY = 86_400_000;

/** New orders waiting for 발주 확인, oldest first, each confirmable in place. */
export function WaitingOrders({ orders, total, now }: { orders: OrderEntry[]; total: number; now: Date }) {
  return (
    <Slip
      title="발주 기다리는 주문"
      titleId="waiting-title"
      meta={total > orders.length ? `오래된 순 ${orders.length}건 / 전체 ${total}건` : "오래된 순"}
      flush
    >
      {orders.length === 0 ? (
        <EmptyState title="밀린 발주가 없어요.">
          새 주문이 들어오면 여기에 오래된 순서로 쌓여요. 주문 화면에서 테스트 주문을 넣어 흐름을 확인해 볼 수 있어요.
        </EmptyState>
      ) : (
        <ol className={styles.queue}>
          {orders.map((order) => {
            const late = now.getTime() - order.orderedAt.getTime() > DAY;
            return (
              <li key={order.id} className={styles.queueRow}>
                <div className={styles.queueMain}>
                  <p className={styles.queueMeta}>
                    <span className={ui.num}>{order.orderNo}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={order.orderedAt.toISOString()} className={late ? styles.late : undefined}>
                      {formatRelative(order.orderedAt, now)} 주문{late ? " · 하루 넘게 대기" : ""}
                    </time>
                  </p>
                  <p className={styles.queueName}>
                    <span className={styles.queueMark}>{order.productName}</span>
                  </p>
                  <p className={styles.queueWho}>
                    {order.customerName} · {order.region} · {formatNumber(order.quantity)}개
                  </p>
                </div>
                <div className={styles.queueMoney}>
                  <span className={styles.queueTotal}>{formatKrw(order.amounts.revenue)}</span>
                  <MarginChip
                    margin={{ profit: order.amounts.profit, marginRate: order.amounts.profit / order.amounts.revenue }}
                  />
                </div>
                <div className={styles.queueAction}>
                  <ConfirmOrderButton orderId={order.id} small />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className={styles.slipFoot}>
        <Link href="/smart-store/orders?status=new" className={styles.footLink}>
          신규주문 모두 보기 <ArrowRight size={14} strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </Slip>
  );
}
