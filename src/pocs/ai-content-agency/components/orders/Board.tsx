import Link from "next/link";
import { ORDER_STATUSES, STATUS_HINT, STATUS_LABEL, statusIndex, type OrderStatus } from "../../domain/pipeline";
import type { OrderListItem } from "../../server/store/orders";
import { Grommets } from "../shell/Grommets";
import { Empty } from "../ui/PageHeader";
import { OrderBanner } from "./OrderBanner";
import styles from "./orders.module.css";

const DELIVERED_SHOWN = 6;

const EMPTY: Record<OrderStatus, string> = {
  received: "새 의뢰서가 들어오면 여기에 걸려요.",
  writing: "작성 중인 의뢰가 없어요. 접수된 의뢰에서 시안을 써 보세요.",
  review: "검수를 기다리는 원고가 없어요.",
  delivered: "아직 납품한 의뢰가 없어요.",
};

/** The stand, tier by tier: 접수 → 작성중 → 검수 → 납품완료. */
export function Board({
  orders,
  today,
  showAllDelivered,
  filtered,
}: {
  orders: OrderListItem[];
  today: string;
  showAllDelivered: boolean;
  /** A search or kind filter is on: empty tiers fold away instead of explaining an empty pipeline. */
  filtered: boolean;
}) {
  if (filtered && orders.length === 0) {
    return (
      <Empty title="조건에 맞는 의뢰가 없어요.">
        <p>상호나 주제의 일부만 적어도 찾을 수 있어요.</p>
        <Link href="/ai-content-agency/orders">필터 지우고 모두 보기</Link>
      </Empty>
    );
  }
  return (
    <div className={styles.stand}>
      <Grommets />
      {ORDER_STATUSES.map((status) => {
        let items = orders.filter((o) => o.status === status);
        if (filtered && items.length === 0) return null;
        if (status === "delivered") {
          items = items.sort((a, b) => (b.deliveredAt?.getTime() ?? 0) - (a.deliveredAt?.getTime() ?? 0));
        }
        const shown = status === "delivered" && !showAllDelivered ? items.slice(0, DELIVERED_SHOWN) : items;
        return (
          <section key={status} id={`tier-${status}`} className={styles.tier} aria-labelledby={`tier-${status}-name`}>
            <div className={styles.plate}>
              <h2 id={`tier-${status}-name`} className={styles.plateName}>
                {STATUS_LABEL[status]}
                <span className={styles.plateCount}>{items.length}건</span>
              </h2>
              <p className={styles.plateHint}>{STATUS_HINT[status]}</p>
              <span className={styles.plateStage} aria-hidden="true">
                {ORDER_STATUSES.map((s) => (
                  <i key={s} data-on={statusIndex(s) <= statusIndex(status)} />
                ))}
              </span>
            </div>
            {shown.length === 0 ? (
              <p className={styles.tierEmpty}>{EMPTY[status]}</p>
            ) : (
              <ul className={styles.hung} role="list">
                {shown.map((order) => (
                  <li key={order.id}>
                    <OrderBanner order={order} today={today} />
                  </li>
                ))}
              </ul>
            )}
            {shown.length < items.length ? (
              <p className={styles.tierMore}>
                <Link href="/ai-content-agency/orders?all=1#tier-delivered" scroll={false}>납품완료 {items.length}건 모두 보기</Link>
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
