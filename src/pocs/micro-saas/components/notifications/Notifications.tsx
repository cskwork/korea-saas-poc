import Link from "next/link";
import type { getNotificationPreview } from "../../server/queries";
import { NOTICE_LABEL, NOTICE_TYPES } from "../../domain/notifications";
import { STATUS_LABEL } from "../../domain/status";
import { formatMinute, relativeDayLabel } from "../../domain/time";
import ui from "../world/ui.module.css";
import { BookingPicker } from "./BookingPicker";
import { KakaoPreview } from "./KakaoPreview";
import styles from "./notifications.module.css";

type Data = Awaited<ReturnType<typeof getNotificationPreview>>;

/** Pick a notice and a real upcoming booking; the phone shows the 알림톡 as the customer would get it. */
export function Notifications({ data }: { data: Data }) {
  const { type, candidates, booking, message, shop, clock } = data;
  const withBooking = (t: string) => `/micro-saas/notifications?type=${t}${booking ? `&booking=${booking.id}` : ""}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.side}>
        <nav className={ui.segmented} aria-label="알림 종류">
          {NOTICE_TYPES.map((t) => (
            <Link key={t} href={withBooking(t)} className={ui.segment} aria-current={t === type ? "page" : undefined} scroll={false}>
              {NOTICE_LABEL[t]}
            </Link>
          ))}
        </nav>

        {candidates.length > 0 ? (
          <BookingPicker
            type={type}
            selected={booking?.id}
            options={candidates.map((c) => ({
              id: c.id,
              label: `${relativeDayLabel(c.date, clock.date)} ${formatMinute(c.startMinute)} ${c.customerName} · ${c.serviceName} (${STATUS_LABEL[c.status]})`,
            }))}
          />
        ) : null}

        <p className={styles.source}>
          {booking ? (
            <>
              <strong>
                {relativeDayLabel(booking.date, clock.date)} {formatMinute(booking.startMinute)} {booking.customerName}
              </strong>
              님 예약으로 채운 미리보기예요.{" "}
              <Link href={`/micro-saas/bookings/${booking.id}`}>예약 보기</Link>
            </>
          ) : (
            "앞으로 30일 안에 예정된 예약이 없어 미리보기를 채울 수 없어요. 예약이 생기면 그 내용으로 채워져요."
          )}
        </p>
        <p className={styles.disclaimer}>
          미리보기 화면이에요. 이 데모에서는 알림톡이 실제로 발송되지 않아요. 확인 안내의 마지막 줄은{" "}
          <Link href="/micro-saas/settings">매장 설정</Link>의 취소 규정 문구로 바뀌어요.
        </p>
      </div>

      <KakaoPreview shopName={shop.name} message={message} sentAt={formatMinute(clock.minute)} />
    </div>
  );
}
