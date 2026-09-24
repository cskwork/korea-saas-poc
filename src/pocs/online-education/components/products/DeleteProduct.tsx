"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "../../server/actions";
import { ConfirmButton } from "../ui/form";
import ui from "../ui/ui.module.css";
import styles from "./products.module.css";

export function DeleteProduct({ id }: { id: string }) {
  return (
    <section className={clsx(ui.dangerZone, styles.danger)} aria-label="상품 삭제">
      <div>
        <h2 className={ui.sectionTitle}>상품 삭제</h2>
        <p>스쿨에서 사라지고 목록에서도 지워져요. 지금까지의 판매 기록은 수익 분석에 남아요.</p>
      </div>
      <ConfirmButton
        run={() => deleteProductAction({ id })}
        label="상품 삭제"
        confirmLabel="영구 삭제"
        prompt="되돌릴 수 없어요."
        icon={<Trash2 size={15} aria-hidden />}
        className={clsx(ui.button, ui.danger)}
      />
    </section>
  );
}
