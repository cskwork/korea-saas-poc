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
import Link from "next/link";
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

  // In the demo the operator opens this page from the order; a real client would get the link.
  const preview = (
    <p className={styles.previewNote}>
      <span>고객에게 보내는 화면이에요.</span>
      <Link href={`/ai-content-agency/orders/${order.id}`}>작업실의 의뢰 {orderCode(order.number)}로 돌아가기</Link>
    </p>
  );

  if (order.status !== "delivered" || !draft) {
    return (
      <div className={styles.delivery}>
        {preview}
        <Empty title="아직 납품 전이에요.">
          <p>에디터 검수가 끝나면 이 주소에서 원고를 받아 볼 수 있어요.</p>
        </Empty>
      </div>
    );
  }

  const count = countCharacters(draft.body);
  return (
    <article className={styles.delivery}>
      {preview}
      <header className={styles.deliveryHead}>
        <h1 className={ui.pageTitle}>납품서</h1>
        <p className={styles.deliverySender}>
          {order.clientName} 담당자님, 의뢰하신 {KIND_LABEL[order.kind]} 원고를 글품 에디터가 검수해 보내 드려요.
        </p>
        <p className={styles.deliveryFacts}>
          <SampleMark />
          <span>의뢰 {orderCode(order.number)}</span>
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
        에디터 검수를 거친 v{draft.currentVersion} 원고예요. 고칠 곳이 있으면 담당 에디터에게 알려 주세요.
      </p>
    </article>
  );
}
