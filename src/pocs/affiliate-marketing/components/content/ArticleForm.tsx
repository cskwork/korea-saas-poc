"use client";

import { useState } from "react";
import clsx from "clsx";
import { Plus, Sparkles, X } from "lucide-react";
import { ARTICLE_ITEM_LIMITS, type ArticleKind } from "../../domain/catalog";
import { generateArticleAction } from "../../server/actions";
import type { LinkOption } from "../../server/links";
import { ActionNotice, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { ui } from "../ui/primitives";
import { useActionForm } from "../ui/useActionForm";
import styles from "./content.module.css";

interface Row {
  key: number;
  linkId: string;
  name: string;
  price: string;
}

const COPY: Record<ArticleKind, { item: (n: number) => string; reason: string; reasonHint: string; titleHint: string }> = {
  comparison: { item: (n) => `제품 ${n}`, reason: "한 줄 평", reasonHint: "예: 통화 품질을 중요하게 보면 이쪽", titleHint: "예: 갤럭시 버즈3 프로 vs 에어팟 프로 2 비교" },
  ranking: { item: (n) => `${n}위`, reason: "추천 이유", reasonHint: "예: 매달 사는 소모품이라 묶음 구매가 이득", titleHint: "예: 신혼집 살림 추천 TOP 5" },
  review: { item: () => "리뷰할 제품", reason: "이런 분께 추천해요", reasonHint: "예: 출퇴근 1시간 이상 대중교통 이용자", titleHint: "예: 갤럭시 버즈3 프로 3개월 사용 후기" },
};

/** Template form: pick registered links (their tracked short links go into the draft) or type products in. */
export function ArticleForm({ kind, options }: { kind: ArticleKind; options: LinkOption[] }) {
  const limits = ARTICLE_ITEM_LIMITS[kind];
  const copy = COPY[kind];
  const active = options.filter((o) => o.status === "active");
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: limits.min === 1 && kind === "ranking" ? 3 : limits.min }, (_, i) => ({
      key: i + 1,
      linkId: active[i]?.id ?? "",
      name: "",
      price: "",
    })),
  );
  const { state, pending, onSubmit, errors } = useActionForm(generateArticleAction);

  function update(key: number, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  return (
    <form onSubmit={onSubmit} className={formStyles.form} noValidate>
      <input type="hidden" name="kind" value={kind} />
      <Field label="제목" optional hint="비워 두면 제품 이름으로 지어요." error={errors.title}>
        <input name="title" placeholder={copy.titleHint} maxLength={80} autoComplete="off" />
      </Field>
      <div className={formStyles.grid2}>
        <Field label="읽는 사람" optional error={errors.audience}>
          <input name="audience" placeholder="예: 자취 시작하는 사회초년생" maxLength={60} autoComplete="off" />
        </Field>
        <Field label="꼭 담을 내용" optional error={errors.summary}>
          <input name="summary" placeholder="예: 3개월 써 본 뒤의 솔직한 평가" maxLength={600} autoComplete="off" />
        </Field>
      </div>

      <ol className={styles.items} role="list">
        {rows.map((row, index) => {
          const option = options.find((o) => o.id === row.linkId);
          return (
            <li key={row.key} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.itemTitle}>{copy.item(index + 1)}</span>
                {rows.length > limits.min ? (
                  <button type="button" className={clsx(ui.quiet, ui.small)} onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}>
                    <X aria-hidden />
                    빼기
                  </button>
                ) : null}
              </div>
              <div className={formStyles.grid2}>
                <Field label="등록한 링크" optional hint={option ? "초안에 이 링크의 짧은 링크가 들어가요." : "고르지 않으면 링크 없이 써요."}>
                  <select name="itemLinkId" value={row.linkId} onChange={(event) => update(row.key, { linkId: event.target.value })}>
                    <option value="">링크 없이 직접 입력</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.productName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="제품명" optional={Boolean(option)}>
                  <input
                    name="itemName"
                    value={row.name}
                    onChange={(event) => update(row.key, { name: event.target.value })}
                    placeholder={option?.productName ?? "제품명"}
                    maxLength={80}
                    autoComplete="off"
                  />
                </Field>
              </div>
              <div className={formStyles.grid2}>
                <Field label="가격" optional unit="원">
                  <input
                    name="itemPrice"
                    inputMode="numeric"
                    value={row.price}
                    onChange={(event) => update(row.key, { price: event.target.value })}
                    placeholder={option?.priceWon != null ? new Intl.NumberFormat("ko-KR").format(option.priceWon) : "예: 219,000"}
                    autoComplete="off"
                  />
                </Field>
                <Field label="평점" optional hint="1~5">
                  <input name="itemRating" inputMode="decimal" placeholder="예: 4.5" autoComplete="off" />
                </Field>
              </div>
              <div className={formStyles.grid2}>
                <Field label="장점" optional hint="쉼표로 구분">
                  <input name="itemPros" placeholder="예: 가벼움, 배터리 오래감" autoComplete="off" />
                </Field>
                <Field label="단점" optional hint="쉼표로 구분">
                  <input name="itemCons" placeholder="예: 케이스가 큼" autoComplete="off" />
                </Field>
              </div>
              <Field label={copy.reason} optional>
                <input name="itemReason" placeholder={copy.reasonHint} maxLength={300} autoComplete="off" />
              </Field>
            </li>
          );
        })}
      </ol>
      {errors.itemName || errors.itemPrice || errors.itemRating || errors.itemLinkId ? (
        <p className={styles.groupError} role="alert">
          {(errors.itemName ?? errors.itemPrice ?? errors.itemRating ?? errors.itemLinkId)?.[0]}
        </p>
      ) : null}
      <div className={formStyles.actions}>
        {rows.length < limits.max ? (
          <button type="button" className={ui.base} onClick={() => setRows((current) => [...current, { key: Math.max(0, ...current.map((r) => r.key)) + 1, linkId: "", name: "", price: "" }])}>
            <Plus aria-hidden />
            제품 추가 ({rows.length}/{limits.max})
          </button>
        ) : null}
        <SubmitButton pending={pending} pendingLabel="초안 쓰는 중… 최대 1분" icon={<Sparkles aria-hidden />}>
          초안 만들기
        </SubmitButton>
      </div>
      <ActionNotice state={state} />
    </form>
  );
}
