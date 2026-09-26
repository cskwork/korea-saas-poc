import Link from "next/link";
import { formatDate } from "@/core/format";
import type { PortfolioRow } from "../../db/schema";
import { CONTENT_KINDS, INDUSTRIES, KIND_LABEL, type ContentKind } from "../../domain/content";
import { BannerProof } from "../proof/BannerProof";
import { Empty } from "../ui/PageHeader";
import { KindTag, SampleMark } from "../ui/Tags";
import { CaseActions } from "./CaseActions";
import styles from "./portfolio.module.css";

function href(industry?: string, kind?: ContentKind): string {
  const params = new URLSearchParams();
  if (industry) params.set("industry", industry);
  if (kind) params.set("kind", kind);
  const query = params.toString();
  return `/ai-content-agency/portfolio${query ? `?${query}` : ""}`;
}

/** Industry and kind filters as links: the URL is the filter. */
export function CaseFilters({
  industry,
  kind,
  counts,
  total,
}: {
  industry?: string;
  kind?: ContentKind;
  counts: Map<string, number>;
  total: number;
}) {
  return (
    <nav className={styles.filters} aria-label="사례 필터">
      <span className={styles.filterLabel}>업종</span>
      <ul className={styles.chips} role="list">
        <li>
          <Link href={href(undefined, kind)} className={styles.chip} aria-current={!industry ? "true" : undefined}>
            전체 <span>{total}</span>
          </Link>
        </li>
        {INDUSTRIES.filter((i) => counts.has(i) || i === industry).map((i) => (
          <li key={i}>
            <Link href={href(i, kind)} className={styles.chip} aria-current={industry === i ? "true" : undefined}>
              {i} <span>{counts.get(i) ?? 0}</span>
            </Link>
          </li>
        ))}
      </ul>
      <span className={styles.filterLabel}>유형</span>
      <ul className={styles.chips} role="list">
        <li>
          <Link href={href(industry, undefined)} className={styles.chip} aria-current={!kind ? "true" : undefined}>
            모든 유형
          </Link>
        </li>
        {CONTENT_KINDS.map((k) => (
          <li key={k}>
            <Link href={href(industry, k)} className={styles.chip} aria-current={kind === k ? "true" : undefined}>
              {KIND_LABEL[k]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CaseBoard({ items, filtered }: { items: PortfolioRow[]; filtered: boolean }) {
  if (items.length === 0) {
    return filtered ? (
      <Empty title="이 조건에 맞는 사례가 아직 없어요.">
        <Link href="/ai-content-agency/portfolio">모든 사례 보기</Link>
      </Empty>
    ) : (
      <Empty title="올린 사례가 없어요.">
        <p>납품을 마친 의뢰의 상세 페이지에서 사례로 올릴 수 있어요.</p>
      </Empty>
    );
  }
  return (
    <ul className={styles.wall} role="list">
      {items.map((item) => (
        <li key={item.id} className={styles.case} data-kind={item.kind}>
          <BannerProof title={item.title} kind={item.kind} byline={item.clientLabel} size="compact" />
          <div className={styles.caseMeta}>
            <KindTag kind={item.kind} short />
            <span>{item.industry}</span>
            {item.isSample ? <SampleMark /> : null}
          </div>
          <p className={styles.caseSummary}>{item.summary}</p>
          <blockquote className={styles.excerpt}>{item.excerpt}</blockquote>
          <div className={styles.caseFoot}>
            <span>
              {formatDate(item.publishedAt, { year: "numeric", month: "long" })} 게시
              {item.draftId ? (
                <>
                  {" · "}
                  <Link href={`/ai-content-agency/drafts/${item.draftId}`}>원고 보기</Link>
                </>
              ) : item.isSample ? (
                " · 샘플 사례라 원문은 없어요"
              ) : null}
            </span>
            <CaseActions caseId={item.id} title={item.title} summary={item.summary} />
          </div>
        </li>
      ))}
    </ul>
  );
}
