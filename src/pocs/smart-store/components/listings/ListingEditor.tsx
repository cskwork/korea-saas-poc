"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { LoaderCircle, Save } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import type { Category } from "../../domain/categories";
import { TITLE_MAX_LENGTH } from "../../domain/listing-copy";
import { saveListing } from "../../server/actions";
import { InputField, TextAreaField } from "../ui/Field";
import { HangTag } from "../ui/HangTag";
import { MarginReceipt } from "../ui/MarginReceipt";
import { Notice } from "../ui/Notice";
import { Slip } from "../ui/Slip";
import { useToast } from "../ui/Toast";
import ui from "../ui/ui.module.css";
import styles from "./listings.module.css";
import { usePriceDraft } from "./usePriceDraft";

export interface EditableListing {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  hashtags: string[];
  category: Category;
  price: number;
  cost: number;
  shippingCost: number;
}

/**
 * Copy and price editor. The hang tag re-inks live while the price, cost or
 * shipping is typed and turns red at break-even (the 흑자·적자 가격표).
 * Remounted (keyed) by the page whenever the listing changes on the server.
 */
export function ListingEditor({ listing }: { listing: EditableListing }) {
  const toast = useToast();
  // Toast from inside the action: a successful save re-keys (remounts) this editor.
  const [state, submit, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await saveListing(previous, formData);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [keywords, setKeywords] = useState(listing.keywords.join(", "));
  const [hashtags, setHashtags] = useState(listing.hashtags.join(" "));
  const draft = usePriceDraft(
    { price: listing.price, cost: listing.cost, shipping: listing.shippingCost },
    listing.category,
  );
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const saveButton = (extra?: string) => (
    <button
      type="submit"
      className={clsx(ui.btn, ui.btnPop, extra)}
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <LoaderCircle size={16} className={ui.spin} aria-hidden />
      ) : (
        <Save size={16} strokeWidth={2} aria-hidden />
      )}
      {pending ? "저장 중…" : "변경사항 저장"}
    </button>
  );

  return (
    <form action={submit} className={styles.editor} noValidate>
      <input type="hidden" name="id" value={listing.id} />
      <Slip title="상품명과 상세설명" titleId="copy-title">
        <div className={styles.fields}>
          <InputField
            id="listing-title"
            name="title"
            label="상품명"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={TITLE_MAX_LENGTH}
            required
            errors={errors.title}
            hint={
              <span className={clsx(styles.counter, title.length >= TITLE_MAX_LENGTH && styles.counterOver)}>
                {title.length}/{TITLE_MAX_LENGTH}자 · 핵심 키워드를 앞에, 홍보 문구와 같은 단어 반복 없이
              </span>
            }
          />
          <TextAreaField
            id="listing-description"
            name="description"
            label="상세설명"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={16}
            required
            errors={errors.description}
            hint="[도매처 상세페이지에서 확인해 입력] 표시는 도매처 정보로 채워 주세요."
          />
          <InputField
            id="listing-keywords"
            name="keywords"
            label="검색 키워드"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            hint="쉼표로 구분, 최대 10개"
            errors={errors.keywords}
          />
          <InputField
            id="listing-hashtags"
            name="hashtags"
            label="해시태그"
            value={hashtags}
            onChange={(event) => setHashtags(event.target.value)}
            hint="띄어쓰기로 구분, 최대 10개"
            errors={errors.hashtags}
          />
          <div className={clsx(styles.saveBar, styles.mobileOnly)}>{saveButton()}</div>
        </div>
      </Slip>

      <div className={styles.editorSide}>
        <Slip title="가격과 남는 돈" titleId="price-title">
          <div className={styles.fields}>
            <div className={styles.tagStage}>
              <HangTag margin={draft.margin} size="lg" animate={draft.touched} />
            </div>
            <div className={styles.priceFields}>
              <InputField
                id="listing-price"
                name="price"
                label="판매가"
                type="number"
                min={100}
                step={10}
                numeric
                value={draft.values.price}
                onChange={(event) => draft.set("price")(event.target.value)}
                errors={errors.price}
              />
              <InputField
                id="listing-cost"
                name="cost"
                label="매입가"
                type="number"
                min={0}
                step={10}
                numeric
                value={draft.values.cost}
                onChange={(event) => draft.set("cost")(event.target.value)}
                errors={errors.cost}
              />
              <InputField
                id="listing-shipping"
                name="shippingCost"
                label="배송비"
                type="number"
                min={0}
                step={10}
                numeric
                value={draft.values.shipping}
                onChange={(event) => draft.set("shipping")(event.target.value)}
                errors={errors.shippingCost}
              />
            </div>
            <MarginReceipt margin={draft.margin} />
            {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
            <div className={styles.saveBar}>{saveButton(ui.btnBlock)}</div>
          </div>
        </Slip>
      </div>
    </form>
  );
}
