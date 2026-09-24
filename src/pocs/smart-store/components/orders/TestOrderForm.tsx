"use client";

import { useActionState } from "react";
import clsx from "clsx";
import { LoaderCircle, Plus } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import { formatNumber } from "@/core/format";
import { placeTestOrder } from "../../server/actions";
import { SelectField } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { useToast } from "../ui/Toast";
import ui from "../ui/ui.module.css";
import styles from "./orders.module.css";

/** Places a sample order on a selling listing, the way a buyer would. */
export function TestOrderForm({ listings }: { listings: { id: string; title: string; price: number }[] }) {
  const toast = useToast();
  const [state, submit, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await placeTestOrder(previous, formData);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  if (listings.length === 0) {
    return (
      <Notice tone="info">
        판매중인 상품이 없어서 테스트 주문을 넣을 수 없어요. 등록 상품에서 판매를 재개해 주세요.
      </Notice>
    );
  }

  return (
    <form action={submit} className={styles.testForm} noValidate>
      <SelectField
        id="test-listing"
        name="listingId"
        label="상품"
        className={styles.testProduct}
        errors={errors.listingId}
        defaultValue={listings[0].id}
      >
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.title} · {formatNumber(listing.price)}원
          </option>
        ))}
      </SelectField>
      <SelectField id="test-quantity" name="quantity" label="수량" errors={errors.quantity} defaultValue="1">
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}개
          </option>
        ))}
      </SelectField>
      <button type="submit" className={clsx(ui.btn, ui.btnPop)} disabled={pending} aria-busy={pending || undefined}>
        {pending ? (
          <LoaderCircle size={16} className={ui.spin} aria-hidden />
        ) : (
          <Plus size={16} strokeWidth={2} aria-hidden />
        )}
        테스트 주문 넣기
      </button>
      {state.status === "error" && !Object.keys(errors).length ? <Notice tone="error">{state.message}</Notice> : null}
    </form>
  );
}
