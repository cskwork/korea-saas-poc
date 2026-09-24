"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Field } from "../ui/Field";
import { ui } from "../ui/primitives";
import styles from "./conversions.module.css";

/** Month and program pickers (GET form; applies on change when JavaScript is on). */
export function ConversionFilters({
  months,
  programs,
  month,
  programId,
  status,
  linkId,
}: {
  months: string[];
  programs: { id: string; name: string }[];
  month: string;
  programId: string;
  status: string;
  linkId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value && !(key === "month" && value === months[0])) params.set(key, value);
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <form
      method="get"
      className={styles.toolbarFields}
      onChange={(event) => apply(event.currentTarget)}
      onSubmit={(event) => {
        event.preventDefault();
        apply(event.currentTarget);
      }}
    >
      {status ? <input type="hidden" name="status" value={status} /> : null}
      {linkId ? <input type="hidden" name="linkId" value={linkId} /> : null}
      <Field label="월">
        <select name="month" defaultValue={month}>
          {months.map((m) => (
            <option key={m} value={m}>
              {m.slice(0, 4)}년 {Number(m.slice(5, 7))}월
            </option>
          ))}
        </select>
      </Field>
      <Field label="프로그램">
        <select name="programId" defaultValue={programId}>
          <option value="">전체</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
      <noscript>
        <button type="submit" className={ui.base}>
          적용
        </button>
      </noscript>
      {pending ? <LoaderCircle aria-label="불러오는 중" className={ui.spin} width={18} height={18} /> : null}
    </form>
  );
}
