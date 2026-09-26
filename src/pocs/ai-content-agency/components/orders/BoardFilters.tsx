import Form from "next/form";
import { Search } from "lucide-react";
import Link from "next/link";
import { CONTENT_KINDS, KIND_LABEL, type ContentKind } from "../../domain/content";
import { buttonClass } from "../ui/buttons";
import ui from "../ui/ui.module.css";
import styles from "./orders.module.css";

/** Search and kind filter as a plain GET form: the URL holds the filter. */
export function BoardFilters({ q, kind, total }: { q: string; kind?: ContentKind; total: number }) {
  const filtered = Boolean(q || kind);
  return (
    <Form action="/ai-content-agency/orders" className={styles.filters} role="search">
      <div className={`${ui.field} ${styles.search}`}>
        <label htmlFor="order-q" className={ui.label}>
          고객·주제 찾기
        </label>
        <input id="order-q" name="q" type="search" defaultValue={q} placeholder="예: 밀과결, 선크림" className={ui.input} />
      </div>
      <div className={ui.field}>
        <label htmlFor="order-kind" className={ui.label}>
          유형
        </label>
        <select id="order-kind" name="kind" defaultValue={kind ?? ""} className={ui.select}>
          <option value="">전체</option>
          {CONTENT_KINDS.map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={buttonClass("secondary")}>
        <Search size={16} aria-hidden="true" />
        찾기
      </button>
      {/* With no match the board itself says so; this line only counts real results. */}
      {filtered && total > 0 ? (
        <p className={styles.filterNote} role="status">
          {total}건 찾았어요 · <Link href="/ai-content-agency/orders">필터 지우기</Link>
        </p>
      ) : null}
    </Form>
  );
}
