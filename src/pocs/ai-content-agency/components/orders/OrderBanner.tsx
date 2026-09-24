import Link from "next/link";
import { seoulDateKey } from "@/core/format";
import { ADVANCE_LABEL, nextStatus, orderCode } from "../../domain/pipeline";
import type { OrderListItem } from "../../server/store/orders";
import { Grommets } from "../shell/Grommets";
import { DueSticker } from "../ui/DueSticker";
import { KindTag } from "../ui/Tags";
import { MoveButton } from "./MoveButton";
import styles from "./orders.module.css";

/** One order hung on the stand: topic in banner lettering, its 게시기간 sticker, the next move. */
export function OrderBanner({ order, today }: { order: OrderListItem; today: string }) {
  const next = nextStatus(order.status);
  return (
    <article className={styles.banner} data-stage={order.status} aria-labelledby={`order-${order.id}`}>
      <Grommets className={styles.grommets} />
      <div className={styles.bannerTop}>
        <div className={styles.bannerMeta}>
          <span>{orderCode(order.number)}</span>
          <KindTag kind={order.kind} short />
        </div>
        <DueSticker
          dueDate={order.dueDate}
          today={today}
          status={order.status}
          deliveredOn={order.deliveredAt ? seoulDateKey(order.deliveredAt) : null}
        />
      </div>
      <h3 id={`order-${order.id}`} className={styles.bannerTopic}>
        <Link href={`/ai-content-agency/orders/${order.id}`}>{order.topic}</Link>
      </h3>
      <p className={styles.bannerClient}>
        {order.clientName} · {order.industry}
      </p>
      <div className={styles.bannerFoot}>
        <span>{order.draftCount > 0 ? `시안 ${order.draftCount}개` : "시안 없음"}</span>
        {next && order.status !== "delivered" ? (
          <MoveButton orderId={order.id} to={next} label={ADVANCE_LABEL[order.status]} variant={order.status === "received" ? "secondary" : "primary"} />
        ) : null}
      </div>
    </article>
  );
}
