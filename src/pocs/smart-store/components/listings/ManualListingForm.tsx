"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { LoaderCircle, WandSparkles } from "lucide-react";
import { idleState } from "@/core/actions";
import { CATALOG_CATEGORIES, CATEGORY_INFO, formatFeeRate, isCategory, type Category } from "../../domain/categories";
import { createManualListing } from "../../server/actions";
import { InputField, SelectField } from "../ui/Field";
import { HangTag } from "../ui/HangTag";
import { MarginReceipt } from "../ui/MarginReceipt";
import { Notice } from "../ui/Notice";
import { Slip } from "../ui/Slip";
import ui from "../ui/ui.module.css";
import styles from "./listings.module.css";
import { usePriceDraft } from "./usePriceDraft";

/** A product that is not in the catalogue: the seller types it in, AI writes the copy on submit. */
export function ManualListingForm({ writer }: { writer: "claude" | "template" }) {
  const [state, submit, pending] = useActionState(createManualListing, idleState);
  const [category, setCategory] = useState<Category>("living");
  const [name, setName] = useState("");
  const draft = usePriceDraft({ price: 0, cost: 0, shipping: 3000 }, category);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={submit} className={styles.editor} noValidate>
      <Slip title="상품 정보" titleId="manual-title">
        <div className={styles.fields}>
          <InputField
            id="manual-name"
            name="originalName"
            label="도매처 상품명"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 원목 스탠드 거울 대형"
            maxLength={100}
            required
            errors={errors.originalName}
            hint="도매처에 올라온 이름 그대로 넣으면 AI가 검색용 상품명으로 다듬어요."
          />
          <SelectField
            id="manual-category"
            name="category"
            label="카테고리"
            value={category}
            onChange={(event) => isCategory(event.target.value) && setCategory(event.target.value)}
            errors={errors.category}
          >
            {[...CATALOG_CATEGORIES, "etc" as const].map((c) => (
              <option key={c} value={c}>
                {CATEGORY_INFO[c].feeLabel} (수수료 {formatFeeRate(CATEGORY_INFO[c].feeRateBp)})
              </option>
            ))}
          </SelectField>
          <div className={styles.priceFields}>
            <InputField
              id="manual-price"
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
              id="manual-cost"
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
              id="manual-shipping"
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
          {state.status === "error" ? <Notice tone="error">{state.message}</Notice> : null}
          <div className={styles.saveBar}>
            <button
              type="submit"
              className={clsx(ui.btn, ui.btnPop)}
              disabled={pending}
              aria-busy={pending || undefined}
            >
              {pending ? (
                <LoaderCircle size={16} className={ui.spin} aria-hidden />
              ) : (
                <WandSparkles size={16} strokeWidth={2} aria-hidden />
              )}
              {pending ? "상품명·설명 쓰는 중…" : "AI로 쓰고 판매 시작"}
            </button>
            <p className={ui.muted}>
              {writer === "claude"
                ? "Claude가 상품명·상세설명·키워드·해시태그를 써요."
                : "AI 키가 없어 기본 템플릿으로 상품명·상세설명·키워드를 채워요."}
            </p>
          </div>
        </div>
      </Slip>
      <div className={styles.editorSide}>
        <Slip title="남는 돈 미리보기" titleId="manual-preview">
          <div className={styles.fields}>
            <div className={styles.tagStage}>
              <HangTag margin={draft.margin} size="lg" animate={draft.touched} />
            </div>
            <MarginReceipt margin={draft.margin} />
          </div>
        </Slip>
      </div>
    </form>
  );
}
