import Link from "next/link";
import { ArrowRight, ExternalLink, ImagePlus, Pencil } from "lucide-react";
import { formatDate, formatKrw, formatRelative, formatTime } from "@/core/format";
import { subjectOf } from "../../domain/brief";
import { ORDER_TYPE_INFO, PLAN_LABEL, STATUS_INFO } from "../../domain/catalog";
import { orderTotal } from "../../domain/pricing";
import type { OrderDetail as OrderDetailData } from "../../server/order-data";
import { DueMark, RevisionTally, StatusMark } from "../marks";
import { paths } from "../paths";
import { HeaderCell, SheetHeader } from "../SheetHeader";
import ui from "../ui.module.css";
import { BriefPanel } from "./BriefPanel";
import { DeleteOrderButton } from "./DeleteOrderButton";
import { OrderStage } from "./OrderStage";
import styles from "./order-detail.module.css";

const isUrl = (text: string) => /^https?:\/\/\S+$/i.test(text);

export function OrderDetail({
  detail,
  today,
  justCreated,
}: {
  detail: OrderDetailData;
  today: string;
  justCreated: boolean;
}) {
  const { order, revisions, events, briefs, portfolioItemId } = detail;
  const info = ORDER_TYPE_INFO[order.type];
  const latest = briefs[0];
  const headline = latest?.copyLines[0] ?? subjectOf(order.title);

  return (
    <>
      <SheetHeader
        title={order.title}
        lead={
          <>
            {order.clientName} · {info.label} · <span className={styles.code}>{order.code}</span>
          </>
        }
        actions={
          <>
            <Link href={paths.editOrder(order.id)} className={[ui.button, ui.secondary, ui.small].join(" ")}>
              <Pencil size={15} aria-hidden="true" />
              주문 수정
            </Link>
            <DeleteOrderButton orderId={order.id} title={order.title} />
          </>
        }
      >
        <HeaderCell
          label="단계"
          value={<StatusMark status={order.status} />}
          sub={STATUS_INFO[order.status].hint}
          wide
        />
        <HeaderCell
          label="마감"
          value={<DueMark dueDate={order.dueDate} today={today} done={order.status === "delivered"} align="start" />}
        />
        <HeaderCell
          label="금액"
          value={formatKrw(orderTotal(order))}
          sub={
            order.extraFees > 0
              ? `기본 ${formatKrw(order.price)} + 추가 수정 ${formatKrw(order.extraFees)}`
              : `${order.quantity}${order.plan === "subscription" ? "개월" : "건"}${order.rush ? " · 긴급 +50%" : ""}`
          }
        />
        <HeaderCell
          label="패키지"
          value={<span className={styles.textValue}>{order.packageName}</span>}
          sub={PLAN_LABEL[order.plan]}
        />
        <HeaderCell label="수정" value={<RevisionTally limit={order.revisionLimit} used={order.revisionsUsed} />} />
      </SheetHeader>

      {justCreated && (
        <p className={[ui.notice, ui.noticeSuccess, styles.flash].join(" ")} role="status">
          주문을 접수했어요. 다음 순서는 아래 ‘AI 콘티 만들기’로 작업 방향을 잡는 거예요.
        </p>
      )}

      <OrderStage
        orderId={order.id}
        type={order.type}
        status={order.status}
        headline={headline}
        price={order.price}
        revisionLimit={order.revisionLimit}
        revisionsUsed={order.revisionsUsed}
      >
        <div className={styles.history}>
          <h2 className={[styles.blockTitle, styles.spaced].join(" ")}>진행 기록</h2>
          <ol role="list" className={styles.events}>
            {[...events].reverse().map((event) => (
              <li key={event.id} className={styles.event}>
                <time
                  className={styles.eventTime}
                  dateTime={event.createdAt.toISOString()}
                  title={formatRelative(event.createdAt)}
                >
                  {formatDate(event.createdAt, { month: "numeric", day: "numeric" })} {formatTime(event.createdAt)}
                </time>
                <span className={styles.eventText}>
                  <span className={styles.eventMove}>
                    {event.fromStatus && (
                      <>
                        {STATUS_INFO[event.fromStatus].label}
                        <ArrowRight size={13} aria-label="에서" />
                      </>
                    )}
                    <strong>{STATUS_INFO[event.toStatus].label}</strong>
                  </span>
                  {event.note && <span className={styles.eventNote}>{event.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </OrderStage>

      <div className={styles.columns}>
        <section className={styles.block} aria-labelledby="order-brief">
          <h2 id="order-brief" className={styles.blockTitle}>
            의뢰 내용
          </h2>
          <dl className={styles.facts}>
            <div>
              <dt>요청 사항</dt>
              <dd className={styles.briefText}>{order.brief || "적어 둔 요청 사항이 없어요."}</dd>
            </div>
            <div>
              <dt>레퍼런스</dt>
              <dd>
                {order.referenceLinks.length > 0 ? (
                  <ul role="list" className={styles.refs}>
                    {order.referenceLinks.map((ref) => (
                      <li key={ref}>
                        {isUrl(ref) ? (
                          <a href={ref} target="_blank" rel="noopener noreferrer nofollow">
                            {ref}
                            <ExternalLink size={13} aria-label="새 창" />
                          </a>
                        ) : (
                          ref
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "없음"
                )}
              </dd>
            </div>
            <div>
              <dt>고객 연락처</dt>
              <dd>{order.clientContact || "없음"}</dd>
            </div>
            <div>
              <dt>AI 도구</dt>
              <dd>{order.tools.length > 0 ? order.tools.join(", ") : "정하지 않음"}</dd>
            </div>
            <div>
              <dt>납품 규격</dt>
              <dd>
                {info.frame.aspect} · {info.frame.size}
              </dd>
            </div>
          </dl>
          {order.status === "delivered" && (
            <div className={styles.publish}>
              {portfolioItemId ? (
                <Link href={paths.portfolioItem(portfolioItemId)} className={ui.quiet}>
                  포트폴리오에 올린 작업 보기
                </Link>
              ) : (
                <Link
                  href={`${paths.newPortfolio}?order=${order.id}`}
                  className={[ui.button, ui.secondary, ui.small].join(" ")}
                >
                  <ImagePlus size={15} aria-hidden="true" />
                  포트폴리오에 올리기
                </Link>
              )}
            </div>
          )}
        </section>

        <section className={styles.block} aria-labelledby="order-revisions">
          <h2 id="order-revisions" className={styles.blockTitle}>
            수정 기록
          </h2>
          {revisions.length > 0 ? (
            <ol role="list" className={styles.rounds}>
              {revisions.map((round) => {
                const extra = round.extraFee > 0;
                return (
                  <li key={round.id} className={styles.round} data-extra={extra || undefined}>
                    <p className={styles.roundHead}>
                      <span className={styles.roundNo}>수정 {round.round}차</span>
                      {extra && <span className={styles.roundExtra}>추가 {formatKrw(round.extraFee)}</span>}
                      <span className={styles.roundState}>{round.resolvedAt ? "반영 시작" : "반영 대기"}</span>
                    </p>
                    <p className={styles.roundNote}>{round.note}</p>
                    <p className={styles.roundDate}>
                      {formatDate(round.requestedAt, { month: "long", day: "numeric" })} 요청
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className={ui.hint}>
              아직 수정 요청이 없어요.{" "}
              {order.revisionLimit === null
                ? "이 주문은 수정 횟수 제한이 없어요."
                : `포함된 수정은 ${order.revisionLimit}회예요.`}
            </p>
          )}
        </section>
      </div>

      <BriefPanel
        orderId={order.id}
        type={order.type}
        briefs={briefs.map((b) => ({
          id: b.id,
          source: b.source,
          concepts: b.concepts,
          copyLines: b.copyLines,
          storyboard: b.storyboard,
          createdAt: b.createdAt,
        }))}
      />
    </>
  );
}
