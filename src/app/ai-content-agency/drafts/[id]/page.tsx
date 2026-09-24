import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatTime } from "@/core/format";
import { CharCount } from "@/pocs/ai-content-agency/components/drafts/CharCount";
import { DraftBody } from "@/pocs/ai-content-agency/components/drafts/DraftBody";
import { DeleteDraft, LinkOrder, RestoreVersion } from "@/pocs/ai-content-agency/components/drafts/DraftSideActions";
import { DraftWorkbench } from "@/pocs/ai-content-agency/components/drafts/DraftWorkbench";
import { VersionList } from "@/pocs/ai-content-agency/components/drafts/VersionList";
import styles from "@/pocs/ai-content-agency/components/drafts/drafts.module.css";
import { BannerProof } from "@/pocs/ai-content-agency/components/proof/BannerProof";
import { KindTag, SOURCE_LABEL, SourceTag } from "@/pocs/ai-content-agency/components/ui/Tags";
import { BackLink } from "@/pocs/ai-content-agency/components/ui/BackLink";
import { KIND_LABEL } from "@/pocs/ai-content-agency/domain/content";
import { josa } from "@/pocs/ai-content-agency/domain/korean";
import { orderCode } from "@/pocs/ai-content-agency/domain/pipeline";
import { getDraft } from "@/pocs/ai-content-agency/server/queries";

/** "다시 쓰기" runs here. */
export const maxDuration = 60;

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const detail = await getDraft((await params).id);
  if (!detail) return { title: "원고를 찾을 수 없어요" };
  return {
    title: detail.draft.title.length > 40 ? `${detail.draft.title.slice(0, 39)}…` : detail.draft.title,
    description: `${KIND_LABEL[detail.draft.kind]} 원고 v${detail.draft.currentVersion}: 본문, 글자수, 버전 기록.`,
  };
}

export default async function DraftPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [detail, query] = await Promise.all([getDraft((await params).id), searchParams]);
  if (!detail) notFound();
  const { draft, versions, order, openOrders } = detail;
  const requested = Number(query.v);
  const preview = versions.find((v) => v.version === requested && v.version !== draft.currentVersion) ?? null;
  const shown = preview ?? { title: draft.title, body: draft.body, version: draft.currentVersion };
  const meta = (
    <div className={styles.meta}>
      <KindTag kind={draft.kind} />
      <span>주제: {draft.topic}</span>
      {order ? (
        <Link href={`/ai-content-agency/orders/${order.id}`}>
          {orderCode(order.number)} {order.clientName}
        </Link>
      ) : null}
      <SourceTag source={draft.source} />
      <span>
        v{draft.currentVersion} · {formatDate(draft.updatedAt, { month: "long", day: "numeric" })}{" "}
        {formatTime(draft.updatedAt)} 수정
      </span>
    </div>
  );
  const byline = `${order ? order.clientName : "의뢰 없이 쓴 원고"} · ${KIND_LABEL[draft.kind]} 시안 v${shown.version}`;

  return (
    <>
      <BackLink href={"/ai-content-agency/drafts"}>원고함</BackLink>
      <div className={styles.workspace}>
        <div>
          {preview ? (
            <>
              <div className={styles.previewBar} role="status">
                <span>
                  예전 버전 {josa(`v${preview.version}`, "을/를")} 보는 중 ·{" "}
                  {preview.note || SOURCE_LABEL[preview.source]}
                </span>
                <span className={styles.formActions}>
                  <RestoreVersion draftId={draft.id} version={preview.version} />
                  <Link href={`/ai-content-agency/drafts/${draft.id}`}>지금 버전으로</Link>
                </span>
              </div>
              <BannerProof
                title={preview.title}
                kind={draft.kind}
                keywords={draft.keywords}
                byline={byline}
                headingLevel={1}
              />
              {meta}
              <div className={`${styles.document} ${styles.previewDocument}`}>
                <DraftBody body={preview.body} />
              </div>
            </>
          ) : (
            <DraftWorkbench
              meta={meta}
              fresh={query.fresh === "1"}
              draft={{
                id: draft.id,
                kind: draft.kind,
                title: draft.title,
                body: draft.body,
                keywords: draft.keywords,
                tone: draft.tone,
                length: draft.length,
                version: draft.currentVersion,
                source: draft.source,
                byline,
              }}
            />
          )}
        </div>

        <aside className={styles.side} aria-label="원고 정보">
          <section className={styles.sidePanel} aria-labelledby="count-title">
            <h2 id="count-title" className={styles.sideTitle}>
              글자수{preview ? ` (v${preview.version})` : ""}
            </h2>
            <CharCount body={shown.body} kind={draft.kind} length={draft.length} />
          </section>
          <section className={styles.sidePanel} aria-labelledby="versions-title">
            <h2 id="versions-title" className={styles.sideTitle}>
              버전 기록 {versions.length}개
            </h2>
            <VersionList
              draftId={draft.id}
              versions={versions}
              current={draft.currentVersion}
              viewing={shown.version}
            />
          </section>
          <section className={styles.sidePanel} aria-labelledby="link-title">
            <h2 id="link-title" className={styles.sideTitle}>
              의뢰
            </h2>
            <LinkOrder
              draftId={draft.id}
              orderId={draft.orderId}
              orders={openOrders}
              linked={
                order ? { id: order.id, number: order.number, clientName: order.clientName, topic: order.topic } : null
              }
            />
          </section>
          <DeleteDraft draftId={draft.id} />
        </aside>
      </div>
    </>
  );
}
