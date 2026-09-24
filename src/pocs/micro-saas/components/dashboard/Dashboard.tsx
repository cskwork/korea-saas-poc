import type { getDashboard } from "../../server/queries";
import { formatDayLabel, formatMinute } from "../../domain/time";
import { NewBookingButton } from "../booking/NewBooking";
import { BookingList, DayBook } from "../daybook/DayBook";
import { EmptyState } from "../world/EmptyState";
import ui from "../world/ui.module.css";
import { Tally } from "./Tally";
import { WeekChart } from "./WeekChart";
import styles from "./dashboard.module.css";

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

/** Today first: the ledger date and tally, today's day-book, then decisions and the week. */
export function Dashboard({ data }: { data: DashboardData }) {
  const { clock, shop, tally, next, lines, pending, pendingTotal, week, closedToday } = data;
  const hasBookings = lines.some((l) => l.kind === "booking");
  const todaysPending = tally.pending;

  return (
    <>
      <div className={styles.ledgerHead}>
        <div className={styles.ledgerDate}>
          <p className={styles.ledgerYear}>{clock.date.slice(0, 4)}년</p>
          <p className={styles.ledgerDay}>{formatDayLabel(clock.date)}</p>
          <p className={styles.shopLine}>
            {shop.name} 예약장 <span className={ui.tag}>샘플 데이터</span>
          </p>
        </div>
        <Tally tally={tally} label="오늘 예약 현황" />
      </div>

      <div className={styles.grid}>
        <section className={ui.sheet} aria-labelledby="today-book">
          <div className={ui.sheetHead}>
            <h2 id="today-book">오늘의 예약</h2>
            <p className={ui.sheetNote}>
              {next ? (
                <>
                  다음 손님{" "}
                  <strong>
                    {formatMinute(next.startMinute)} {next.customerName}
                  </strong>{" "}
                  · {next.serviceName}
                </>
              ) : (
                "남은 예약이 없어요"
              )}
              {todaysPending > 0 ? (
                <>
                  <span className={ui.sep} aria-hidden="true">
                    /
                  </span>
                  확정 대기 <strong>{todaysPending}건</strong>
                </>
              ) : null}
            </p>
          </div>
          {hasBookings ? (
            <DayBook date={clock.date} today={clock.date} lines={lines} />
          ) : (
            <EmptyState
              title={closedToday ? "오늘은 휴무일이에요" : "오늘 예약이 없어요"}
              action={<NewBookingButton />}
            >
              {closedToday
                ? "휴무 요일은 매장 설정에서 바꿀 수 있어요. 급한 예약은 직접 적어 둘 수 있어요."
                : "새 예약을 적거나 고객 예약 페이지 링크를 손님께 보내 보세요."}
            </EmptyState>
          )}
        </section>

        <div className={styles.side}>
          <section className={ui.sheet} aria-labelledby="pending-book">
            <div className={ui.sheetHead}>
              <h2 id="pending-book">결재 대기</h2>
              <p className={ui.sheetNote}>
                {pendingTotal > 0 ? `${pendingTotal}건 · 가까운 순` : "모두 결재함"}
              </p>
            </div>
            {pending.length > 0 ? (
              <>
                <BookingList rows={pending} clock={clock} />
                {pendingTotal > pending.length ? (
                  <p className={styles.more}>외 {pendingTotal - pending.length}건은 예약 관리에서 날짜별로 볼 수 있어요.</p>
                ) : null}
              </>
            ) : (
              <p className={ui.emptyLine}>도장을 기다리는 예약이 없어요.</p>
            )}
          </section>

          <section className={ui.sheet} aria-labelledby="week-chart">
            <div className={ui.sheetHead}>
              <h2 id="week-chart">이번 주 예약</h2>
              <p className={ui.sheetNote}>취소 제외 · 월–일</p>
            </div>
            <WeekChart week={week} />
          </section>
        </div>
      </div>
    </>
  );
}
