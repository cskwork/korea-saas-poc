import { FileText } from "lucide-react";
import { formatCompact, formatTime, formatWon } from "@/core/format";
import type { WeekTimetable as WeekData } from "../../domain/week";
import ui from "../ui/ui.module.css";
import styles from "./timetable.module.css";

/**
 * This week's sales as a semester timetable: 월–일 columns, hour rows (Seoul),
 * one block per payment. Courses are filled in their colour, products outlined.
 */
export function WeekTimetable({ week }: { week: WeekData }) {
  const hours = Array.from({ length: week.lastHour - week.firstHour }, (_, i) => week.firstHour + i);
  const cellAt = new Map(week.cells.map((cell) => [`${cell.dayIndex}:${cell.hour}`, cell]));

  return (
    <div className={styles.weekFrame}>
      <table className={styles.week}>
        <caption className={ui.srOnly}>
          {week.label} 결제 시간표: 결제 {week.count}건, {formatWon(week.total)}
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.gutterHead}>
              <span className={ui.srOnly}>시각</span>
            </th>
            {week.days.map((day) => (
              <th key={day.key} scope="col" className={styles.dayHead} data-today={day.isToday || undefined}>
                <span className={styles.dayName}>{day.weekday}</span>
                <span className={styles.dayDate}>{day.date}</span>
                <span className={styles.dayTotal}>{day.total > 0 ? formatCompact(day.total) : day.isFuture ? "" : "–"}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <th scope="row" className={styles.hour}>
                {hour}
              </th>
              {week.days.map((day, dayIndex) => {
                const cell = cellAt.get(`${dayIndex}:${hour}`);
                const now = week.nowMarker;
                const nowOffset = now && now.dayIndex === dayIndex && Math.floor(now.hour) === hour ? now.hour - hour : null;
                return (
                  <td key={day.key} className={styles.slot} data-today={day.isToday || undefined} data-future={day.isFuture || undefined}>
                    {cell ? (
                      <ul role="list" className={styles.lanes} data-lanes={cell.items.length}>
                        {cell.items.map((item) => (
                          <li
                            key={item.id}
                            className={styles.payBlock}
                            data-kind={item.kind}
                            data-color={item.color ?? undefined}
                            title={`${formatTime(item.paidAt)} ${item.itemTitle} ${formatWon(item.amount)}`}
                          >
                            {item.kind === "product" ? <FileText size={11} aria-hidden className={styles.payIcon} /> : null}
                            <span className={styles.payTitle}>{item.itemTitle}</span>
                            <span className={styles.payAmount}>{formatCompact(item.amount)}</span>
                            <span className={ui.srOnly}>
                              {day.weekday}요일 {formatTime(item.paidAt)}, {item.kind === "course" ? "강의" : "디지털 상품"} {item.itemTitle},{" "}
                              {formatWon(item.amount)}
                            </span>
                          </li>
                        ))}
                        {cell.overflow > 0 ? <li className={styles.overflow}>+{cell.overflow}</li> : null}
                      </ul>
                    ) : null}
                    {nowOffset !== null ? (
                      <span
                        className={styles.now}
                        style={{ top: `${nowOffset * 100}%` }}
                        aria-label="지금"
                        role="img"
                      />
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
