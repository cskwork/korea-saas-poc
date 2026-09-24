"use client";

import type { Product } from "../../db/schema";
import { PRODUCT_TYPES } from "../../domain/catalog";
import { createProductAction, updateProductAction } from "../../server/actions";
import { FieldMessage, fieldAttrs, FormNotice, SubmitButton, useFormAction } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./products.module.css";

type Defaults = Pick<Product, "title" | "type" | "description" | "price">;

export function ProductForm({ productId, defaults }: { productId?: string; defaults: Defaults }) {
  const { state, pending, formProps } = useFormAction(productId ? updateProductAction : createProductAction);
  const id = (name: string) => `product-${name}`;
  return (
    <form {...formProps} className={ui.form} noValidate>
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}
      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("title")}>
          상품명
        </label>
        <input
          className={ui.input}
          {...fieldAttrs(state, "title", id("title"))}
          defaultValue={defaults.title}
          maxLength={80}
          placeholder="예: 개발자 이력서 노션 템플릿"
        />
        <FieldMessage state={state} name="title" id={id("title")} />
      </div>
      <fieldset className={styles.fieldset}>
        <legend className={ui.label}>유형</legend>
        <div className={ui.choices}>
          {PRODUCT_TYPES.map((type) => (
            <label key={type.value} className={ui.choice}>
              <input type="radio" name="type" value={type.value} defaultChecked={defaults.type === type.value} />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
        <FieldMessage state={state} name="type" id={id("type")} />
      </fieldset>
      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("description")}>
          상품 설명
        </label>
        <textarea
          className={ui.textarea}
          {...fieldAttrs(state, "description", id("description"))}
          defaultValue={defaults.description}
          rows={3}
          maxLength={400}
          placeholder="무엇이 들어 있고, 누구에게 쓸모 있는지 적어 주세요."
        />
        <FieldMessage state={state} name="description" id={id("description")} />
      </div>
      <div className={ui.field}>
        <label className={ui.label} htmlFor={id("price")}>
          가격 (원)
        </label>
        <input
          className={ui.input}
          {...fieldAttrs(state, "price", id("price"))}
          defaultValue={defaults.price || ""}
          inputMode="numeric"
          placeholder="15000"
        />
        <FieldMessage state={state} name="price" id={id("price")} />
      </div>
      <FormNotice state={state} />
      <div className={ui.formActions}>
        <SubmitButton pending={pending} pendingLabel={productId ? "저장하는 중" : "등록하는 중"}>
          {productId ? "상품 정보 저장" : "상품 등록"}
        </SubmitButton>
      </div>
    </form>
  );
}
