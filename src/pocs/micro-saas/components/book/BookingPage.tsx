import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { formatWon } from "@/core/format";
import type { BookingRow } from "../../server/store/bookings";
import type { getBookingPage } from "../../server/queries";
import { WEEKDAY_LABELS, formatClosedWeekdays, formatDayLabel, formatMinute, weekdayOf } from "../../domain/time";
import { Icon } from "../world/Icon";
import { RoundSeal } from "../world/Stamp";
import { ToastProvider } from "../world/Toast";
import ui from "../world/ui.module.css";
import world from "../world/world.module.css";
import { CopyLinkButton, GuestForm, StepTitle } from "./BookClient";
import styles from "./book.module.css";

type PageData = Awaited<ReturnType<typeof getBookingPage>>;

const STEPS = ["서비스", "날짜·시간", "예약자 정보"] as const;

const slipHref = (params: { service?: string; date?: string; time?: number }) => {
  const search = new URLSearchParams();
  if (params.service) search.set("service", params.service);
  if (params.date) search.set("date", params.date);
  if (params.time !== undefined) search.set("time", String(params.time));
  const query = search.toString();
  return `/micro-saas/book${query ? `?${query}` : ""}`;
};

/**
 * The shop's public booking page: an illustrated shop plate and a three-part booking slip
 * that only offers slots the shop's hours, seats and existing bookings allow.
 */
export function BookingPage({
  data,
  receipt,
  requestedTime,
  moved,
}: {
  data: PageData;
  receipt?: BookingRow;
  requestedTime?: string;
  moved: boolean;
}) {
  const { shop, services, service, strip, date, availability, slot, clock, lastDay } = data;
  const step = receipt ? 4 : !service ? 1 : slot ? 3 : 2;
  const slotGone = step === 2 && requestedTime !== undefined;

  return (
    <ToastProvider>
      <a className={world.skipLink} href="#slip">
        예약 양식으로 건너뛰기
      </a>
      <div className={styles.frame}>
        <p className={styles.demoStrip}>
          <span>손님에게 보이는 예약 페이지예요 (데모).</span>
          <Link href="/micro-saas">사장님 화면으로</Link>
        </p>
        <main className={styles.booking}>
          <header className={styles.shop}>
            <Image
              className={styles.art}
              src="/micro-saas/salon-1400.webp"
              width={1400}
              height={933}
              sizes="(min-width: 700px) 640px, 100vw"
              alt="작은 동네 미용실 내부 일러스트: 거울 앞 의자 하나, 제품 선반, 화분, 카운터 위에 펼친 예약장과 도장, 붉은 인주"
              loading="eager"
              fetchPriority="high"
            />
            <div className={styles.shopBody}>
              <h1 className={styles.shopName}>
                {shop.name} <span className={ui.tag}>샘플 매장</span>
              </h1>
              <p className={styles.line}>
                <Icon name="pin" />
                {shop.address}
              </p>
              <p className={styles.line}>
                <Icon name="phone" />
                <a href={`tel:${shop.phone.replaceAll("-", "")}`}>{shop.phone}</a>
              </p>
              <p className={styles.line}>
                <Icon name="clock" />
                {formatMinute(shop.openMinute)}–{formatMinute(shop.closeMinute)} · {formatClosedWeekdays(shop.closedWeekdays)}
              </p>
              <CopyLinkButton />
            </div>
          </header>

          <div className={styles.slip} id="slip">
            <ol className={styles.steps} aria-label="예약 단계">
              {STEPS.map((name, i) => {
                const n = i + 1;
                const state = n < step ? styles.done : n === step ? styles.current : "";
                return (
                  <li key={name} className={`${styles.step} ${state}`} aria-current={n === step ? "step" : undefined}>
                    <span className={styles.stepNo}>{n < step ? <Icon name="check" /> : n}</span>
                    <span className={styles.stepName}>{name}</span>
                  </li>
                );
              })}
            </ol>

            {receipt ? (
              <Receipt booking={receipt} />
            ) : step === 1 ? (
              <div className={styles.panel}>
                <StepTitle focus={moved}>서비스 선택</StepTitle>
                {services.length === 0 ? (
                  <p className={ui.emptyLine}>지금은 온라인 예약을 받는 서비스가 없어요. 매장으로 전화해 주세요.</p>
                ) : (
                  <ul className={styles.services}>
                    {services.map((s) => (
                      <li key={s.id}>
                        <Link className={styles.service} href={slipHref({ service: s.id })} scroll={false}>
                          <span className={styles.serviceName}>{s.name}</span>
                          <span className={styles.serviceDur}>{s.durationMinutes}분 소요</span>
                          <span className={styles.servicePrice}>{formatWon(s.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : step === 2 && service ? (
              <div className={styles.panel}>
                <StepTitle focus={moved}>날짜 및 시간 선택</StepTitle>
                <p className={styles.summary}>
                  {service.name} · {service.durationMinutes}분 · {formatWon(service.price)}{" "}
                  <Link href={slipHref({})} scroll={false}>
                    서비스 바꾸기
                  </Link>
                </p>
                <ul className={styles.dates} aria-label="날짜">
                  {strip.map((d) => {
                    const wd = weekdayOf(d.date);
                    const label = d.closed ? "휴무" : d.open > 0 ? `${d.open}칸` : "마감";
                    return (
                      <li key={d.date}>
                        <Link
                          href={slipHref({ service: service.id, date: d.date })}
                          scroll={false}
                          className={`${styles.date}${d.date === date ? ` ${styles.dateOn}` : ""}${
                            d.closed || d.open === 0 ? ` ${styles.dateOff}` : ""
                          }${wd === 0 ? ` ${styles.sun}` : wd === 6 ? ` ${styles.sat}` : ""}`}
                          aria-current={d.date === date ? "date" : undefined}
                          aria-label={`${formatDayLabel(d.date)}, ${d.closed ? "휴무" : d.open > 0 ? `예약 가능 ${d.open}개` : "마감"}`}
                        >
                          <span className={styles.dateDow}>{d.date === clock.date ? "오늘" : WEEKDAY_LABELS[wd]}</span>
                          <span className={styles.dateNo}>{Number(d.date.slice(8))}</span>
                          <span className={styles.dateLeft}>{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Form action="/micro-saas/book" scroll={false} className={styles.otherDate}>
                  <input type="hidden" name="service" value={service.id} />
                  <label className={`${ui.field} ${styles.dateField}`} htmlFor="other-date">
                    <span className={ui.fieldLabel}>다른 날짜</span>
                    <input id="other-date" type="date" name="date" min={clock.date} max={lastDay} defaultValue={date} required />
                  </label>
                  <button type="submit" className={`${ui.btn} ${ui.line}`}>
                    보기
                  </button>
                </Form>

                {slotGone ? (
                  <p className={ui.warn} role="alert">
                    고르신 시간은 방금 마감되었어요. 다른 시간을 골라 주세요.
                  </p>
                ) : null}

                {date && availability ? (
                  <>
                    <p className={ui.hint} aria-live="polite">
                      {availability.closedDay
                        ? `${formatDayLabel(date)}은 휴무일이에요. 다른 날짜를 골라 주세요.`
                        : availability.openCount > 0
                          ? `${formatDayLabel(date)} · 예약 가능 ${availability.openCount}개 시간`
                          : `${formatDayLabel(date)}은 예약 가능한 시간이 없어요. 다른 날짜를 골라 주세요.`}
                    </p>
                    {availability.closedDay ? null : (
                      <ul className={styles.slots} aria-label="예약 가능 시간">
                        {availability.slots.map((s) => (
                          <li key={s.minute}>
                            {s.state === "open" ? (
                              <Link className={styles.slot} href={slipHref({ service: service.id, date, time: s.minute })} scroll={false}>
                                {formatMinute(s.minute)}
                              </Link>
                            ) : (
                              <span
                                className={`${styles.slot} ${styles.slotOff}`}
                                aria-label={`${formatMinute(s.minute)} ${
                                  s.state === "past" ? "지난 시간" : s.state === "full" ? "예약 마감" : "영업 종료 전에 끝나지 않음"
                                }`}
                              >
                                {formatMinute(s.minute)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className={ui.hint}>앞으로 2주 동안 빈 시간이 없어요. 다른 날짜를 골라 주세요.</p>
                )}
                <Link className={`${ui.btn} ${ui.line} ${ui.block}`} href={slipHref({})} scroll={false}>
                  <Icon name="left" />
                  <span>이전</span>
                </Link>
              </div>
            ) : service && date && slot ? (
              <div className={styles.panel}>
                <StepTitle focus={moved}>예약자 정보</StepTitle>
                <dl className={`${ui.formRows} ${styles.summaryBox}`}>
                  <div>
                    <dt>서비스</dt>
                    <dd>
                      {service.name} ({formatWon(service.price)})
                    </dd>
                  </div>
                  <div>
                    <dt>일시</dt>
                    <dd>
                      {formatDayLabel(date)} {formatMinute(slot.minute)}~{formatMinute(slot.minute + service.durationMinutes)}
                    </dd>
                  </div>
                </dl>
                <GuestForm
                  serviceId={service.id}
                  date={date}
                  time={formatMinute(slot.minute)}
                  retryHref={slipHref({ service: service.id, date })}
                />
                <Link className={`${ui.btn} ${ui.line} ${ui.block}`} href={slipHref({ service: service.id, date })} scroll={false}>
                  <Icon name="left" />
                  <span>이전</span>
                </Link>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

/** The stamped receipt: the booking is in the shop's book as 대기 until the owner stamps it. */
function Receipt({ booking }: { booking: BookingRow }) {
  return (
    <div className={`${styles.panel} ${styles.receipt}`}>
      <RoundSeal text="접수" className={styles.receiptSeal} fresh />
      <StepTitle focus>예약이 접수되었어요</StepTitle>
      <p className={ui.hint}>매장에서 확정하면 알림톡으로 알려드려요. (데모에서는 알림톡이 발송되지 않아요.)</p>
      <dl className={`${ui.formRows} ${styles.receiptRows}`}>
        <div>
          <dt>서비스</dt>
          <dd>{booking.serviceName}</dd>
        </div>
        <div>
          <dt>일시</dt>
          <dd>
            {formatDayLabel(booking.date)} {formatMinute(booking.startMinute)}
          </dd>
        </div>
        <div>
          <dt>예약자</dt>
          <dd>{booking.customerName}</dd>
        </div>
        <div>
          <dt>상태</dt>
          <dd>{booking.status === "pending" ? "매장 확인 중 (대기)" : booking.status === "confirmed" ? "확정" : "취소됨"}</dd>
        </div>
      </dl>
      <Link className={`${ui.btn} ${ui.ink} ${ui.block}`} href="/micro-saas/book">
        새 예약하기
      </Link>
      <Link className={`${ui.btn} ${ui.line} ${ui.block}`} href="/micro-saas">
        사장님 화면에서 도장 찍기 (데모)
      </Link>
    </div>
  );
}
