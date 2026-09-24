import Link from "next/link";
import type { getCalendar } from "../../server/queries";
import { WEEKDAY_LABELS, formatDayLabel, formatMonthLabel, monthKeyOf, shiftMonth } from "../../domain/time";
import { DayBook } from "../daybook/DayBook";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import { AddOnDay } from "./AddOnDay";
import styles from "./calendar.module.css";

type CalendarData = Awaited<ReturnType<typeof getCalendar>>;

const href = (month: string, date?: string) => `/micro-saas/calendar?month=${month}${date ? `&date=${date}` : ""}`;

/** The month as a ruled grid of days, and the chosen day's book beside it. */
export function Calendar({ data }: { data: CalendarData }) {
  const { clock, month, day, cells, lines, dayTally, dayClosed } = data;
  const hasBookings = lines.some((l) => l.kind === "booking");
  const thisMonth = monthKeyOf(clock.date);

  return (
    <div className={styles.grid}>
      <section className={ui.sheet} aria-labelledby="month-title">
        <div className={`${ui.sheetHead} ${styles.head}`}>
          <Link className={ui.iconBtn} href={href(shiftMonth(month, -1))} aria-label="이전 달" scroll={false}>
            <Icon name="left" />
          </Link>
          <h2 id="month-title" aria-live="polite">
            {formatMonthLabel(month)}
          </h2>
          <div className={styles.headEnd}>
            {month !== thisMonth ? (
              <Link className={`${ui.btn} ${ui.line} ${ui.small}`} href={href(thisMonth, clock.date)} scroll={false}>
                오늘
              </Link>
            ) : null}
            <Link className={ui.iconBtn} href={href(shiftMonth(month, 1))} aria-label="다음 달" scroll={false}>
              <Icon name="right" />
            </Link>
          </div>
        </div>
        <div className={styles.dow} aria-hidden="true">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={label} className={i === 0 ? styles.sun : i === 6 ? styles.sat : undefined}>
              {label}
            </span>
          ))}
        </div>
        <div className={styles.days}>
          {cells.map((cell) => {
            const dayNo = Number(cell.date.slice(8));
            if (!cell.inMonth) {
              return (
                <span key={cell.date} className={`${styles.day} ${styles.other}`} aria-hidden="true">
                  <span className={styles.dayNo}>{dayNo}</span>
                </span>
              );
            }
            const isToday = cell.date === clock.date;
            const classes = [
              styles.day,
              cell.weekday === 0 ? styles.sun : cell.weekday === 6 ? styles.sat : "",
              isToday ? styles.today : "",
              cell.date === day ? styles.selected : "",
              cell.closed ? styles.closed : "",
            ].join(" ");
            const label = `${formatDayLabel(cell.date)}${isToday ? ", 오늘" : ""}${cell.closed ? ", 휴무" : ""}, 예약 ${cell.active}건${
              cell.pending ? `, 대기 ${cell.pending}건` : ""
            }`;
            return (
              <Link
                key={cell.date}
                href={href(month, cell.date)}
                scroll={false}
                className={classes}
                aria-label={label}
                aria-current={cell.date === day ? "true" : undefined}
              >
                <span className={styles.dayNo}>{dayNo}</span>
                {cell.active > 0 ? <span className={styles.count}>{cell.active}건</span> : null}
                {cell.closed && cell.active === 0 ? <span className={styles.closedTag}>휴무</span> : null}
                {cell.pending > 0 ? <span className={styles.pendingMark} aria-hidden="true" /> : null}
              </Link>
            );
          })}
        </div>
        <p className={styles.legend}>
          <span className={styles.legendPending} aria-hidden="true" /> 점선 네모: 도장을 기다리는 예약이 있는 날
        </p>
      </section>

      <section className={ui.sheet} aria-labelledby="day-title">
        <div className={ui.sheetHead}>
          <h2 id="day-title">{formatDayLabel(day)} 예약</h2>
          <p className={ui.sheetNote}>
            {dayClosed ? "휴무일 · " : ""}
            {dayTally.total > 0
              ? `${dayTally.total}건 · 확정 ${dayTally.confirmed} · 대기 ${dayTally.pending} · 취소 ${dayTally.cancelled}`
              : "예약 없음"}
          </p>
        </div>
        {hasBookings || (!dayClosed && lines.length > 0) ? (
          <DayBook date={day} today={clock.date} lines={lines} />
        ) : (
          <p className={ui.emptyLine}>{dayClosed ? "휴무일이라 예약 가능한 시간이 없어요." : "이 날은 예약이 없어요."}</p>
        )}
        <AddOnDay date={day} />
      </section>
    </div>
  );
}
