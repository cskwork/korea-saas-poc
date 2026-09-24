import Link from "next/link";
import { formatWon } from "@/core/format";
import type { getBookingDetail } from "../../server/queries";
import { SOURCE_LABEL } from "../../domain/status";
import { formatLongDayLabel, formatMinute } from "../../domain/time";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import { EditBookingForm } from "./EditBookingForm";
import { StampPanel } from "./StampPanel";
import styles from "./detail.module.css";

type Detail = Awaited<ReturnType<typeof getBookingDetail>>;

/** One booking as its own slip: the record, the 결재란, and the form to move or correct it. */
export function BookingDetail({ data }: { data: Detail }) {
  const { booking, shop, services } = data;
  const notice = booking.status === "cancelled" ? "cancel" : "confirm";

  return (
    <div className={styles.page}>
      <Link href={`/micro-saas/calendar?date=${booking.date}`} className={styles.back}>
        <Icon name="left" />
        <span>{formatLongDayLabel(booking.date)} 예약장으로</span>
      </Link>

      <section className={`${ui.sheet} ${styles.slip}`} aria-labelledby="slip-title">
        <div className={ui.sheetHead}>
          <h2 id="slip-title">
            {booking.customerName}님 · {formatMinute(booking.startMinute)} {booking.serviceName}
          </h2>
          <p className={ui.sheetNote}>{SOURCE_LABEL[booking.source]}</p>
        </div>
        <div className={styles.slipBody}>
          <dl className={ui.formRows}>
            <div>
              <dt>고객</dt>
              <dd>
                <Link href={`/micro-saas/customers/${booking.customerId}`}>{booking.customerName}</Link>
              </dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>
                <a href={`tel:${booking.customerPhone.replaceAll("-", "")}`}>{booking.customerPhone}</a>
              </dd>
            </div>
            <div>
              <dt>일시</dt>
              <dd>
                {formatLongDayLabel(booking.date)} {formatMinute(booking.startMinute)}~
                {formatMinute(booking.startMinute + booking.durationMinutes)}
              </dd>
            </div>
            <div>
              <dt>서비스</dt>
              <dd>
                {booking.serviceName} · {booking.durationMinutes}분
                {booking.serviceId ? null : <span className={styles.muted}> (지금은 없는 서비스)</span>}
              </dd>
            </div>
            <div>
              <dt>금액</dt>
              <dd>{formatWon(booking.price)}</dd>
            </div>
            <div>
              <dt>메모</dt>
              <dd>{booking.memo || <span className={styles.muted}>없음</span>}</dd>
            </div>
          </dl>
          <StampPanel booking={booking} />
        </div>
        <p className={styles.links}>
          <Link href={`/micro-saas/notifications?type=${notice}&booking=${booking.id}`}>이 예약으로 알림톡 미리보기</Link>
        </p>
      </section>

      <section className={ui.sheet} aria-labelledby="edit-title">
        <div className={ui.sheetHead}>
          <h2 id="edit-title">예약 옮기기 · 고치기</h2>
          <p className={ui.sheetNote}>
            영업 {formatMinute(shop.openMinute)}–{formatMinute(shop.closeMinute)} · 좌석 {shop.seats}개
          </p>
        </div>
        <div className={styles.editBody}>
          <EditBookingForm
            booking={booking}
            services={services}
            hours={{ openMinute: shop.openMinute, closeMinute: shop.closeMinute }}
          />
        </div>
      </section>
    </div>
  );
}
