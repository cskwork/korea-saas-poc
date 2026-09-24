import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { formatCompact, formatDate, formatKrw, formatPercent } from "@/core/format";
import { ORDER_TYPE_INFO } from "../../domain/catalog";
import type { getDashboard } from "../../server/queries";
import { Frame } from "../frame/Frame";
import { GoalMeter } from "../GoalMeter";
import { CutTable } from "../orders/CutTable";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import styles from "./dashboard.module.css";

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export function Dashboard({ data }: { data: DashboardData }) {
  const { today, counts, openOrders, progress, recentDeliveries, deliveredThisMonth } = data;
  const needsBrief = openOrders.filter((o) => !o.hasBrief).slice(0, 5);
  const overdue = openOrders.filter((o) => o.dueDate < today).length;
  const monthName = `${Number(today.slice(5, 7))}월`;

  return (
    <>
      <SheetHeader
        title="오늘의 콘티"
        lead={
          overdue > 0
            ? `마감이 지난 컷이 ${overdue}개 있어요. 마감이 가까운 순서로 정리했어요.`
            : "진행 중인 주문을 마감이 가까운 순서로 정리했어요."
        }
      >
        <HeaderCell
          label="오늘"
          value={formatDate(`${today}T12:00:00+09:00`, { month: "numeric", day: "numeric", weekday: "short" })}
          sub={`${today.slice(0, 4)}년 ${monthName} 콘티`}
        />
        <HeaderCell label="S#1 의뢰접수" value={`${counts.received}컷`} href={`${paths.orders}?status=received`} />
        <HeaderCell label="S#2 시안작업" value={`${counts.drafting}컷`} href={`${paths.orders}?status=drafting`} />
        <HeaderCell
          label="S#3 수정요청"
          value={`${counts.revision}컷`}
          href={`${paths.orders}?status=revision`}
          tone={counts.revision > 0 ? "alert" : undefined}
        />
        <HeaderCell
          label={`S#4 ${monthName} 납품`}
          value={`${deliveredThisMonth}컷`}
          href={`${paths.orders}?status=delivered`}
        />
        <HeaderCell
          wide
          label={`${monthName} 납품액 · 목표 ${formatCompact(progress.goal)}원`}
          value={formatKrw(progress.achieved)}
          sub={
            <>
              {formatPercent(progress.ratio)} 달성
              {progress.remaining > 0
                ? ` · 남은 ${progress.daysLeft}일 동안 하루 ${formatCompact(progress.perDayNeeded)}원`
                : " · 목표 달성"}
              <GoalMeter progress={progress} today={today} />
            </>
          }
        />
      </SheetHeader>

      <section className={styles.section} aria-labelledby="open-cuts">
        <div className={styles.sectionHead}>
          <h2 id="open-cuts" className={styles.sectionTitle}>
            진행 중인 컷 <span className={styles.count}>{openOrders.length}</span>
          </h2>
          <Link href={paths.orders} className={ui.quiet}>
            전체 주문 보기 <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        {openOrders.length > 0 ? (
          <CutTable orders={openOrders} today={today} label="진행 중인 주문" />
        ) : (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>진행 중인 주문이 없어요</p>
            <p className={ui.emptyText}>
              새 주문을 접수하면 여기에 마감 순서대로 컷이 쌓여요. 가격표에서 패키지를 골라 바로 접수할 수도 있어요.
            </p>
            <Link href={paths.newOrder} className={ui.button}>
              새 주문 접수
            </Link>
          </div>
        )}
      </section>

      <div className={styles.columns}>
        <section className={styles.section} aria-labelledby="needs-brief">
          <div className={styles.sectionHead}>
            <h2 id="needs-brief" className={styles.sectionTitle}>
              콘티가 필요한 주문 <span className={styles.count}>{openOrders.filter((o) => !o.hasBrief).length}</span>
            </h2>
          </div>
          {needsBrief.length > 0 ? (
            <ul role="list" className={styles.list}>
              {needsBrief.map((order) => (
                <li key={order.id} className={styles.listRow}>
                  <div className={styles.listText}>
                    <span className={styles.listTitle}>{order.title}</span>
                    <span className={styles.listMeta}>
                      {order.clientName} · {ORDER_TYPE_INFO[order.type].short}
                    </span>
                  </div>
                  <Link
                    href={`${paths.order(order.id)}#brief`}
                    className={[ui.button, ui.secondary, ui.small].join(" ")}
                  >
                    <Sparkles size={15} aria-hidden="true" />
                    콘티 만들기
                    <span className={ui.srOnly}>: {order.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={ui.hint}>진행 중인 모든 주문에 콘티가 있어요.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="ok-cuts">
          <div className={styles.sectionHead}>
            <h2 id="ok-cuts" className={styles.sectionTitle}>
              최근 납품
            </h2>
            <Link href={paths.revenue} className={ui.quiet}>
              수익 분석 <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {recentDeliveries.length > 0 ? (
            <ul role="list" className={styles.list}>
              {recentDeliveries.map((delivery) => (
                <li key={delivery.id} className={styles.listRow}>
                  <Frame type={delivery.type} medium="ink" height={36} maxWidth={56} />
                  <div className={styles.listText}>
                    <Link href={paths.order(delivery.id)} className={styles.listTitle}>
                      {delivery.title}
                    </Link>
                    <span className={styles.listMeta}>
                      {delivery.clientName} ·{" "}
                      {formatDate(`${delivery.deliveredOn}T12:00:00+09:00`, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <span className={styles.amount}>{formatKrw(delivery.total)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={ui.hint}>이번 달과 지난달에 납품한 주문이 아직 없어요.</p>
          )}
        </section>
      </div>
    </>
  );
}
