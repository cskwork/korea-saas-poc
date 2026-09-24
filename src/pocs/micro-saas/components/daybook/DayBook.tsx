import type { DayBookLine } from "../../domain/daybook";
import { isPast, type Clock } from "../../domain/time";
import type { BookingRow } from "../../server/store/bookings";
import { BookingLine } from "./BookingLine";
import { FreeLine } from "./FreeLine";
import styles from "./daybook.module.css";

/** The ruled day-book: time down the page, names across, the 결재 box at the right edge. */
export function DayBook({ date, today, lines }: { date: string; today: string; lines: DayBookLine<BookingRow>[] }) {
  return (
    <>
      <div className={styles.legend} aria-hidden="true">
        <span>시간</span>
        <span>손님 · 서비스</span>
        <span>결재</span>
      </div>
      <ol className={styles.book}>
        {lines.map((line) =>
          line.kind === "booking" ? (
            <BookingLine key={line.booking.id} booking={line.booking} past={line.past} today={today} />
          ) : line.kind === "free" ? (
            <FreeLine key={`f${line.minute}`} date={date} minute={line.minute} past={line.past} />
          ) : (
            <FreeLine
              key={`r${line.minute}`}
              date={date}
              minute={line.minute}
              lastMinute={line.lastMinute}
              count={line.count}
              past={line.past}
            />
          ),
        )}
      </ol>
    </>
  );
}

/** A compact book of bookings across days (the 결재 대기 list). */
export function BookingList({ rows, clock }: { rows: BookingRow[]; clock: Clock }) {
  return (
    <ol className={`${styles.book} ${styles.compact}`}>
      {rows.map((row) => (
        <BookingLine
          key={row.id}
          booking={row}
          past={isPast(row.date, row.startMinute, clock)}
          today={clock.date}
          showDate
        />
      ))}
    </ol>
  );
}
