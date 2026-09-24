"use client";

import { useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { CATEGORIES, LINK_STATUSES, LINK_STATUS_LABEL } from "../../domain/catalog";
import { Field, formStyles } from "../ui/Field";
import { ui } from "../ui/primitives";
import styles from "./links.module.css";

export interface LinkFilterValues {
  q: string;
  programId: string;
  status: string;
  category: string;
  sort: string;
}

const SORT_LABEL: Record<string, string> = {
  revenue: "수익 높은 순",
  clicks: "클릭 많은 순",
  cvr: "전환율 높은 순",
  epc: "클릭당 수익 순",
  newest: "최근 등록 순",
  name: "이름 순",
};

/** GET form: works without JavaScript; with it, selects apply immediately and search applies on Enter. */
export function LinkFilters({ values, programs }: { values: LinkFilterValues; programs: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value && !(key === "sort" && value === "revenue")) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <form
      ref={formRef}
      method="get"
      className={styles.filters}
      role="search"
      aria-label="링크 찾기"
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
      onChange={(event) => {
        if ((event.target as HTMLElement).tagName === "SELECT") apply(event.currentTarget);
      }}
    >
      <div className={styles.search}>
        <Field label="검색">
          <input name="q" type="search" defaultValue={values.q} placeholder="상품명, 코드, 메모" autoComplete="off" />
        </Field>
        <Search aria-hidden />
      </div>
      <Field label="프로그램">
        <select name="programId" defaultValue={values.programId}>
          <option value="">전체</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="상태">
        <select name="status" defaultValue={values.status}>
          <option value="">전체</option>
          {LINK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LINK_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="카테고리">
        <select name="category" defaultValue={values.category}>
          <option value="">전체</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="정렬">
        <select name="sort" defaultValue={values.sort || "revenue"}>
          {Object.entries(SORT_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <div className={formStyles.actions}>
        <button type="submit" className={ui.base}>
          {pending ? <LoaderCircle aria-hidden className={ui.spin} /> : <Search aria-hidden />}
          찾기
        </button>
      </div>
    </form>
  );
}
