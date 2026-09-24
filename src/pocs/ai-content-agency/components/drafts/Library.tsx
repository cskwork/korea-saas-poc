import Form from "next/form";
import { Search } from "lucide-react";
import Link from "next/link";
import { formatNumber, formatRelative } from "@/core/format";
import type { DraftSource } from "../../db/schema";
import { CONTENT_KINDS, KIND_LABEL, countCharacters, excerpt, type ContentKind } from "../../domain/content";
import { orderCode } from "../../domain/pipeline";
import { countOpenChecks } from "../../domain/templates";
import type { DraftSort } from "../../server/store/drafts";
import { buttonClass } from "../ui/buttons";
import { Empty } from "../ui/PageHeader";
import { SourceTag } from "../ui/Tags";
import ui from "../ui/ui.module.css";
import styles from "./drafts.module.css";

const SORT_LABEL: Record<DraftSort, string> = { recent: "최근 수정순", oldest: "오래된 순", longest: "긴 원고순" };

export function LibraryFilters({ q, kind, sort }: { q: string; kind?: ContentKind; sort: DraftSort }) {
  return (
    <Form action="/ai-content-agency/drafts" className={styles.libraryFilters} role="search">
      <div className={`${ui.field} ${styles.search}`}>
        <label htmlFor="draft-q" className={ui.label}>
          제목·본문·고객 찾기
        </label>
        <input id="draft-q" name="q" type="search" defaultValue={q} placeholder="예: 소금빵" className={ui.input} />
      </div>
      <div className={ui.field}>
        <label htmlFor="draft-kind" className={ui.label}>
          유형
        </label>
        <select id="draft-kind" name="kind" defaultValue={kind ?? ""} className={ui.select}>
          <option value="">전체</option>
          {CONTENT_KINDS.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className={ui.field}>
        <label htmlFor="draft-sort" className={ui.label}>
          정렬
        </label>
        <select id="draft-sort" name="sort" defaultValue={sort} className={ui.select}>
          {(Object.keys(SORT_LABEL) as DraftSort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonClass("secondary")}>
        <Search size={16} aria-hidden="true" />
        찾기
      </button>
    </Form>
  );
}

interface LibraryDraft {
  id: string;
  kind: ContentKind;
  title: string;
  body: string;
  source: DraftSource;
  currentVersion: number;
  updatedAt: Date;
  orderId: string | null;
  orderNumber: number | null;
  clientName: string | null;
}

export function DraftList({ drafts, filtered }: { drafts: LibraryDraft[]; filtered: boolean }) {
  if (drafts.length === 0) {
    return filtered ? (
      <Empty title="찾는 원고가 없어요.">
        <Link href="/ai-content-agency/drafts">필터 지우기</Link>
      </Empty>
    ) : (
      <Empty title="원고함이 비어 있어요.">
        <p>시안을 쓰면 버전 기록과 함께 여기에 쌓여요.</p>
        <Link href="/ai-content-agency/write" className={buttonClass("primary")}>
          첫 시안 쓰기
        </Link>
      </Empty>
    );
  }
  return (
    <ul className={styles.list} role="list">
      {drafts.map((draft) => {
        const checks = countOpenChecks(draft.body);
        return (
          <li key={draft.id} className={styles.row}>
            <span className={styles.swatch} data-kind={draft.kind} aria-hidden="true" />
            <Link href={`/ai-content-agency/drafts/${draft.id}`} className={styles.rowTitle}>
              {draft.title}
            </Link>
            <span className={styles.rowTime}>{formatRelative(draft.updatedAt)}</span>
            <span className={styles.rowExcerpt}>{excerpt(draft.body, 110)}</span>
            <span className={styles.rowMeta}>
              <span>{KIND_LABEL[draft.kind]}</span>
              {draft.orderId && draft.orderNumber !== null ? (
                <span>
                  {orderCode(draft.orderNumber)} {draft.clientName}
                </span>
              ) : (
                <span>의뢰 없음</span>
              )}
              <SourceTag source={draft.source} />
              <span>v{draft.currentVersion}</span>
              <span>{formatNumber(countCharacters(draft.body).withSpaces)}자</span>
              {checks > 0 ? <span className={styles.checksBadge}>확인 필요 {checks}곳</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
