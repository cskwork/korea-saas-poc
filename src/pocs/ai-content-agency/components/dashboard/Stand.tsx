import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { shortDate, weekdayIndex, weekdayLabel, longDate } from "../../domain/dates";
import { STATUS_LABEL, dueState, orderCode } from "../../domain/pipeline";
import type { Timeline } from "../../domain/stats";
import type { StandOrder } from "../../server/store/dashboard";
import { Grommets } from "../shell/Grommets";
import { buttonClass } from "../ui/buttons";
import styles from "./dashboard.module.css";

const VISIBLE_ROWS = 8;

/**
 * 게시 기간: every open order hung as a banner from the day it came in to its due date,
 * over two weeks around today. Late orders overrun in red up to today.
 */
export function Stand({ timeline, today }: { timeline: Timeline<StandOrder>; today: string }) {
  const { days, todayIndex } = timeline;
  const rows = timeline.bars.slice(0, VISIBLE_ROWS);
  const more = timeline.bars.length - rows.length + timeline.hidden;

  return (
    <section className={styles.stand} aria-labelledby="stand-title">
      <Grommets />
      <div className={styles.standHead}>
        <h2 id="stand-title" className={styles.standTitle}>
          게시 기간
          <span className={styles.standRange}>
            {shortDate(days[0])} – {shortDate(days[days.length - 1])}
          </span>
        </h2>
        <ul className={styles.legend} aria-label="막대 읽는 법">
          <li>
            <span className={styles.legendKey} data-stage="received" aria-hidden="true" />
            접수 (시안 전)
          </li>
          <li>
            <span className={styles.legendKey} aria-hidden="true" />
            작성중
          </li>
          <li>
            <span className={styles.legendKey} data-stage="review" aria-hidden="true" />
            검수 대기
          </li>
          <li>
            <span className={styles.legendKey} data-stage="late" aria-hidden="true" />
            마감 지남
          </li>
        </ul>
      </div>

      {rows.length === 0 ? (
        <div className={styles.standEmpty}>
          <p>지금 걸려 있는 의뢰가 없어요. 새 의뢰서를 받으면 여기에 마감일까지 걸려요.</p>
          <Link href="/ai-content-agency/orders/new" className={buttonClass("secondary")}>
            의뢰서 쓰기
          </Link>
        </div>
      ) : (
        <ol className={styles.rows} role="list">
          <li className={`${styles.row} ${styles.dayRow}`} aria-hidden="true">
            <span className={styles.rowLabel} />
            <div className={styles.track}>
              {days.map((day, i) => (
                <span key={day} className={styles.day} data-today={i === todayIndex} data-weekend={weekdayIndex(day) >= 5}>
                  {weekdayLabel(day)}
                  <b>{Number(day.slice(8))}</b>
                </span>
              ))}
            </div>
          </li>
          {rows.map(({ order, start, end, overrunEnd, clippedStart, clippedEnd }) => {
            const due = dueState({ dueDate: order.dueDate, today, status: order.status });
            const dueBeforeWindow = order.dueDate < days[0];
            const summary = `${longDate(order.createdOn)} 접수, ${longDate(order.dueDate)} 마감, ${STATUS_LABEL[order.status]}, ${due.label}`;
            return (
              <li key={order.id} className={styles.row}>
                <Link href={`/ai-content-agency/orders/${order.id}`} className={styles.rowLabel}>
                  <span className={styles.rowMeta}>
                    {orderCode(order.number)} · {order.clientName} · {STATUS_LABEL[order.status]}
                  </span>
                  <span className={styles.rowTopic}>{order.topic}</span>
                  <span className={styles.rowDue} data-tone={due.tone}>
                    {due.label}
                  </span>
                </Link>
                <div className={styles.track} role="img" aria-label={summary}>
                  <span className={styles.todayCol} style={{ gridColumn: todayIndex + 1 }} />
                  {dueBeforeWindow ? null : (
                    <span
                      className={styles.bar}
                      data-stage={order.status}
                      data-clipped-start={clippedStart}
                      style={{ gridColumn: `${start + 1} / ${end + 2}` }}
                    >
                      {clippedStart ? <ChevronLeft size={12} aria-hidden="true" /> : null}
                      {overrunEnd === null ? due.label : "마감"}
                      {clippedEnd ? <ChevronRight size={12} aria-hidden="true" /> : null}
                    </span>
                  )}
                  {overrunEnd !== null ? (
                    <span className={styles.overrun} style={{ gridColumn: `${dueBeforeWindow ? 1 : end + 2} / ${overrunEnd + 2}` }}>
                      {due.label}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {more > 0 ? (
        <p className={styles.more}>
          <Link href="/ai-content-agency/orders">게시대에서 {more}건 더 보기</Link>
        </p>
      ) : null}
    </section>
  );
}
