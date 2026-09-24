"use client";

import clsx from "clsx";
import { Trash2, WandSparkles } from "lucide-react";
import { removeListing, rewriteListingCopy } from "../../server/actions";
import { ActionButton } from "../ui/ActionButton";
import ui from "../ui/ui.module.css";
import { ListingStatusToggle } from "./ListingStatusToggle";
import styles from "./listings.module.css";

export function ListingActions({
  id,
  status,
  writer,
}: {
  id: string;
  status: "selling" | "paused";
  writer: "claude" | "template";
}) {
  return (
    <div className={styles.sideActions}>
      <ListingStatusToggle id={id} status={status} />
      <ActionButton
        action={rewriteListingCopy}
        input={{ id }}
        className={ui.btn}
        confirm={{
          title: "상품명과 상세설명을 다시 쓸까요?",
          text: `${writer === "claude" ? "Claude가" : "기본 템플릿으로"} 상품명·상세설명·키워드·해시태그를 새로 써요. 지금 내용은 덮어써져요. 가격은 그대로예요.`,
          confirmLabel: "다시 쓰기",
        }}
      >
        <WandSparkles size={16} strokeWidth={2} aria-hidden />
        AI로 다시 쓰기
      </ActionButton>
      <ActionButton
        action={removeListing}
        input={{ id }}
        className={clsx(ui.btn, ui.btnDanger)}
        confirm={{
          title: "이 상품을 삭제할까요?",
          text: "등록 상품에서 사라지고 되돌릴 수 없어요. 이미 들어온 주문 기록은 남아요.",
          confirmLabel: "삭제",
          danger: true,
        }}
      >
        <Trash2 size={16} strokeWidth={2} aria-hidden />
        삭제
      </ActionButton>
    </div>
  );
}
