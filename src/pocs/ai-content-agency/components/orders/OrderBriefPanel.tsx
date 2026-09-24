"use client";

import { PencilLine } from "lucide-react";
import { useState } from "react";
import { CONTENT_KINDS, KIND_LABEL, LENGTH_LABEL, LENGTH_TARGET, TONE_LABEL, type ContentKind, type Length, type Tone } from "../../domain/content";
import { longDate } from "../../domain/dates";
import { updateOrderAction } from "../../server/actions";
import { buttonClass } from "../ui/buttons";
import { OrderForm, type OrderFormValues } from "./OrderForm";
import styles from "./orders.module.css";

/** What the client asked for, and the same 의뢰서 to correct it in place. */
export function OrderBriefPanel({ orderId, order }: { orderId: string; order: OrderFormValues & { kind: ContentKind; tone: Tone; length: Length } }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <OrderForm
        action={updateOrderAction}
        orderId={orderId}
        defaults={order}
        allowedKinds={CONTENT_KINDS}
        submitLabel="고친 내용 저장"
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="brief-title">
      <div className={styles.panelHead}>
        <h2 id="brief-title" className={styles.panelTitle}>
          의뢰 내용
        </h2>
        <button type="button" className={buttonClass("secondary", "small")} onClick={() => setEditing(true)}>
          <PencilLine size={14} aria-hidden="true" />
          고치기
        </button>
      </div>
      <dl className={styles.facts}>
        <dt>유형</dt>
        <dd>{KIND_LABEL[order.kind]}</dd>
        <dt>말투 · 분량</dt>
        <dd>
          {TONE_LABEL[order.tone]} · {LENGTH_LABEL[order.length]} (약 {LENGTH_TARGET[order.kind][order.length].toLocaleString("ko-KR")}자)
        </dd>
        <dt>키워드</dt>
        <dd>
          {order.keywords.length ? (
            <ul className={styles.keywords} role="list">
              {order.keywords.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          ) : (
            "없음"
          )}
        </dd>
        <dt>상세 요청</dt>
        <dd className={styles.briefText}>{order.brief || "따로 적은 요청이 없어요."}</dd>
        <dt>마감일</dt>
        <dd>{longDate(order.dueDate)}</dd>
        <dt>담당자</dt>
        <dd>
          {order.contactName || "미정"}
          {order.contactEmail ? ` · ${order.contactEmail}` : ""}
        </dd>
      </dl>
    </section>
  );
}
