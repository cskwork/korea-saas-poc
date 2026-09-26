import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, seoulDateKey } from "@/core/format";
import { DeliverPanel } from "@/pocs/ai-content-agency/components/orders/DeliverPanel";
import { DraftLines } from "@/pocs/ai-content-agency/components/orders/DraftLines";
import { Grommets } from "@/pocs/ai-content-agency/components/shell/Grommets";
import { EventLog } from "@/pocs/ai-content-agency/components/orders/EventLog";
import { MoveButton } from "@/pocs/ai-content-agency/components/orders/MoveButton";
import { DeleteOrder, DraftFromOrder } from "@/pocs/ai-content-agency/components/orders/OrderActions";
import { OrderBriefPanel } from "@/pocs/ai-content-agency/components/orders/OrderBriefPanel";
import { PublishCase } from "@/pocs/ai-content-agency/components/orders/PublishCase";
import { StageSteps } from "@/pocs/ai-content-agency/components/orders/StageSteps";
import styles from "@/pocs/ai-content-agency/components/orders/orders.module.css";
import { buttonClass } from "@/pocs/ai-content-agency/components/ui/buttons";
import { DueSticker } from "@/pocs/ai-content-agency/components/ui/DueSticker";
import { KindTag } from "@/pocs/ai-content-agency/components/ui/Tags";
import { BackLink } from "@/pocs/ai-content-agency/components/ui/BackLink";
import ui from "@/pocs/ai-content-agency/components/ui/ui.module.css";
import { CONTENT_KINDS, KIND_LABEL } from "@/pocs/ai-content-agency/domain/content";
import { PLANS } from "@/pocs/ai-content-agency/domain/plans";
import { josa } from "@/pocs/ai-content-agency/domain/korean";
import {
  ADVANCE_LABEL,
  RETREAT_LABEL,
  nextStatus,
  orderCode,
  previousStatus,
} from "@/pocs/ai-content-agency/domain/pipeline";
import { getOrder } from "@/pocs/ai-content-agency/server/queries";

/** "AI로 시안 쓰기" runs here. */
export const maxDuration = 60;

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const detail = await getOrder((await params).id);
  if (!detail) return { title: "의뢰를 찾을 수 없어요" };
  const { order } = detail;
  return {
    title: `${orderCode(order.number)} ${order.topic}`,
    description: `${order.clientName}의 ${KIND_LABEL[order.kind]} 의뢰: 진행 단계, 시안, 납품 기록.`,
  };
}

export default async function OrderPage({ params }: { params: Params }) {
  const detail = await getOrder((await params).id);
  if (!detail) notFound();
  const { order, events, drafts, publishedCase, plan, today } = detail;
  // A request keeps its own kind even if the plan no longer takes it; switching needs a plan that does.
  const allowedKinds = CONTENT_KINDS.filter((k) => k === order.kind || PLANS[plan].kinds.includes(k));
  const next = nextStatus(order.status);
  const previous = previousStatus(order.status);
  const deliveredDraft = drafts.find((d) => d.id === order.deliveredDraftId);

  return (
    <>
      <BackLink href={"/ai-content-agency/orders"}>의뢰 게시대</BackLink>
      <div className={styles.sheetHead} data-stage={order.status}>
        <Grommets className={styles.sheetGrommets} />
        <div className={styles.sheetTitleRow}>
          <h1 className={ui.pageTitle}>{order.topic}</h1>
          <DueSticker
            dueDate={order.dueDate}
            today={today}
            status={order.status}
            deliveredOn={order.deliveredAt ? seoulDateKey(order.deliveredAt) : null}
          />
        </div>
        <div className={styles.sheetMeta}>
          <span>{orderCode(order.number)}</span>
          <KindTag kind={order.kind} />
          <span>
            {order.clientName} · {order.industry}
          </span>
          <span>접수 {formatDate(order.createdAt, { month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <StageSteps status={order.status} events={events} />

      <div className={styles.sheet}>
        <div>
          <OrderBriefPanel
            orderId={order.id}
            allowedKinds={allowedKinds}
            order={{
              clientName: order.clientName,
              industry: order.industry,
              contactName: order.contactName,
              contactEmail: order.contactEmail,
              kind: order.kind,
              topic: order.topic,
              brief: order.brief,
              keywords: order.keywords,
              tone: order.tone,
              length: order.length,
              dueDate: order.dueDate,
            }}
          />
          <section className={styles.panel} aria-labelledby="log-title">
            <h2 id="log-title" className={styles.panelTitle}>
              진행 기록
            </h2>
            <EventLog events={events} />
          </section>
        </div>

        <div className={styles.sheetSide}>
          <section className={styles.panel} aria-labelledby="progress-title">
            <div className={styles.panelHead}>
              <h2 id="progress-title" className={styles.panelTitle}>
                시안과 진행
              </h2>
            </div>
            {order.status !== "delivered" ? <DraftFromOrder orderId={order.id} hasDrafts={drafts.length > 0} /> : null}
            {order.status === "review" ? (
              <DeliverPanel orderId={order.id} drafts={drafts} />
            ) : (
              <DraftLines drafts={drafts} deliveredDraftId={order.deliveredDraftId} />
            )}
            <div className={styles.actionsRow}>
              {next && order.status !== "review" && order.status !== "delivered" ? (
                <MoveButton
                  orderId={order.id}
                  to={next}
                  label={order.status === "received" ? "시안 없이 작성중으로" : ADVANCE_LABEL[order.status]}
                  size="regular"
                  // Writing a draft already starts the order; once there are drafts, 검수 요청 is the next step.
                  variant={order.status === "received" ? "quiet" : drafts.length > 0 ? "primary" : "secondary"}
                />
              ) : null}
              {previous && order.status !== "received" ? (
                <MoveButton orderId={order.id} to={previous} label={RETREAT_LABEL[order.status]} back size="regular" />
              ) : null}
            </div>
          </section>

          {order.status === "delivered" && deliveredDraft ? (
            <section className={styles.panel} aria-labelledby="delivery-title">
              <div className={styles.panelHead}>
                <h2 id="delivery-title" className={styles.panelTitle}>
                  납품
                </h2>
                <Link
                  href={`/ai-content-agency/orders/${order.id}/delivery`}
                  className={buttonClass("secondary", "small")}
                >
                  <FileCheck2 size={14} aria-hidden="true" />
                  고객용 납품서
                </Link>
              </div>
              <p>
                {order.deliveredAt ? `${formatDate(order.deliveredAt, { month: "long", day: "numeric" })}에 ` : ""}「
                <Link href={`/ai-content-agency/drafts/${deliveredDraft.id}`}>{deliveredDraft.title}</Link>」{" "}
                {josa(`v${deliveredDraft.currentVersion}`, "을/를")} 넘겼어요.
              </p>
              {publishedCase ? (
                <p>
                  사례 게시판에 <Link href="/ai-content-agency/portfolio">「{publishedCase.title}」</Link>로 올라가
                  있어요.
                </p>
              ) : (
                <PublishCase
                  orderId={order.id}
                  defaultTitle={order.topic.slice(0, 60)}
                  defaultSummary={`${order.clientName}의 ${KIND_LABEL[order.kind]}를 AI 시안과 에디터 검수로 납품했어요.`}
                />
              )}
            </section>
          ) : null}

        </div>
      </div>
      <div className={styles.dangerZone}>
        <span>의뢰를 지우면 진행 기록도 함께 사라져요.</span>
        <DeleteOrder orderId={order.id} />
      </div>
    </>
  );
}
