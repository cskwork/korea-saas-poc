import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate, formatNumber } from "@/core/format";
import { DraftBody } from "@/pocs/ai-content-agency/components/drafts/DraftBody";
import drafts from "@/pocs/ai-content-agency/components/drafts/drafts.module.css";
import { PrintButton } from "@/pocs/ai-content-agency/components/orders/PrintButton";
import styles from "@/pocs/ai-content-agency/components/orders/orders.module.css";
import { BannerProof } from "@/pocs/ai-content-agency/components/proof/BannerProof";
import { CopyButton } from "@/pocs/ai-content-agency/components/ui/CopyButton";
import { Empty } from "@/pocs/ai-content-agency/components/ui/PageHeader";
import { SampleMark } from "@/pocs/ai-content-agency/components/ui/Tags";
import { BackLink } from "@/pocs/ai-content-agency/components/ui/BackLink";
import ui from "@/pocs/ai-content-agency/components/ui/ui.module.css";
import { KIND_LABEL, composeCopy, countCharacters } from "@/pocs/ai-content-agency/domain/content";
import { longDate } from "@/pocs/ai-content-agency/domain/dates";
import { orderCode } from "@/pocs/ai-content-agency/domain/pipeline";
import { getOrder } from "@/pocs/ai-content-agency/server/queries";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const detail = await getOrder((await params).id);
  if (!detail) return { title: "납품서를 찾을 수 없어요" };
  return {
    title: `납품서 ${orderCode(detail.order.number)}`,
    description: `${detail.order.clientName}에 납품한 ${KIND_LABEL[detail.order.kind]} 원고.`,
    robots: { index: false },
  };
}

/** What the client receives: the delivered copy, ready to paste or print. */
export default async function DeliveryPage({ params }: { params: Params }) {
  const detail = await getOrder((await params).id);
  if (!detail) notFound();
  const { order, drafts: orderDrafts } = detail;
  const draft = orderDrafts.find((d) => d.id === order.deliveredDraftId);

  if (order.status !== "delivered" || !draft) {
    return (
      <div className={styles.delivery}>
        <BackLink href={`/ai-content-agency/orders/${order.id}`}>의뢰로 돌아가기</BackLink>
        <Empty title="아직 납품 전이에요.">
          <p>검수 단계에서 원고를 골라 납품하면 고객용 납품서가 만들어져요.</p>
        </Empty>
      </div>
    );
  }

  const count = countCharacters(draft.body);
  return (
    <article className={styles.delivery}>
      <BackLink href={`/ai-content-agency/orders/${order.id}`}>의뢰로 돌아가기</BackLink>
      <header className={styles.deliveryHead}>
        <h1 className={ui.pageTitle}>납품서</h1>
        <p className={styles.deliveryFacts}>
          <strong>{order.clientName} 담당자님께</strong>
          <SampleMark />
          <span>의뢰 {orderCode(order.number)}</span>
          <span>{KIND_LABEL[order.kind]}</span>
          <span>마감 {longDate(order.dueDate)}</span>
          {order.deliveredAt ? <span>납품 {formatDate(order.deliveredAt, { dateStyle: "long" })}</span> : null}
          <span>
            {formatNumber(count.withSpaces)}자 · 원고지 {formatNumber(count.manuscriptPages, 1)}매
          </span>
        </p>
      </header>
      <BannerProof
        title={draft.title}
        kind={order.kind}
        keywords={order.keywords}
        byline={`${order.clientName} · ${KIND_LABEL[order.kind]}`}
        size="compact"
      />
      <div className={styles.deliveryActions}>
        <CopyButton text={composeCopy(draft.title, draft.body)} label="전체 복사" variant="primary" />
        <CopyButton text={draft.title} label="제목만 복사" />
        <CopyButton text={draft.body} label="본문만 복사" />
        <PrintButton />
      </div>
      <div className={drafts.document}>
        <DraftBody body={draft.body} />
      </div>
      <p className={ui.hint}>
        글품 샘플 작업실에서 만든 예시 납품서예요. 원고는 에디터 검수를 거친 v{draft.currentVersion}입니다.
      </p>
    </article>
  );
}
