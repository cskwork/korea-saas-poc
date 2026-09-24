"use client";

import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { formatWon } from "@/core/format";
import { CHANNELS, CHANNEL_LABEL, CONVERSION_STATUSES, CONVERSION_STATUS_LABEL } from "../../domain/catalog";
import { computeCommission, describeTerms, parseWon } from "../../domain/commission";
import { recordConversionAction } from "../../server/actions";
import type { LinkOption } from "../../server/links";
import { ActionNotice, SubmitButton } from "../ui/actions";
import { Field, formStyles } from "../ui/Field";
import { useActionForm } from "../ui/useActionForm";
import styles from "./conversions.module.css";

/**
 * Record an order from a program's report. The commission preview uses the same
 * pure function as the server, so what you see is what gets saved.
 */
export function ConversionForm({
  options,
  today,
  fixedLinkId,
  title = "판매 기록하기",
}: {
  options: LinkOption[];
  today: string;
  fixedLinkId?: string;
  title?: string;
}) {
  const { state, pending, onSubmit, errors } = useActionForm(recordConversionAction);
  const [linkId, setLinkId] = useState(fixedLinkId ?? options.find((o) => o.status === "active")?.id ?? options[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [override, setOverride] = useState("");
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    // A recorded order clears the amounts for the next entry (state adjusted during render).
    setSeen(state);
    if (state.status === "success") {
      setAmount("");
      setOverride("");
    }
  }
  const link = options.find((o) => o.id === linkId);
  const parsed = parseWon(amount);
  const overrideValue = override.trim() ? parseWon(override) : null;
  const preview = overrideValue ?? (link && parsed != null ? computeCommission(link, parsed) : null);

  if (options.length === 0) {
    return <p className={styles.sub}>판매를 기록하려면 먼저 링크를 등록해 주세요.</p>;
  }

  return (
    <form onSubmit={onSubmit} className={formStyles.form} noValidate>
      <h2 className={styles.formTitle}>{title}</h2>
      {fixedLinkId ? (
        <input type="hidden" name="linkId" value={fixedLinkId} />
      ) : (
        <Field label="링크" hint={link ? describeTerms(link) : undefined} error={errors.linkId}>
          <select name="linkId" value={linkId} onChange={(event) => setLinkId(event.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.productName}
                {o.status !== "active" ? " (판매 중 아님)" : ""}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className={formStyles.grid2}>
        <Field label="주문일" error={errors.orderedOn}>
          <input name="orderedOn" type="date" defaultValue={today} max={today} required />
        </Field>
        <Field label="주문 금액" unit="원" error={errors.orderAmount}>
          <input name="orderAmount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="219,000" autoComplete="off" required />
        </Field>
      </div>
      <div className={formStyles.grid2}>
        <Field label="상태" error={errors.status}>
          <select name="status" defaultValue="pending">
            {CONVERSION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONVERSION_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="유입 채널" optional error={errors.channel}>
          <select name="channel" defaultValue="">
            <option value="">모름</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABEL[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="수수료 직접 입력" optional unit="원" hint="프로그램 보고서의 수수료가 계산과 다를 때만 입력하세요." error={errors.commissionOverride}>
        <input name="commissionOverride" inputMode="numeric" value={override} onChange={(event) => setOverride(event.target.value)} autoComplete="off" />
      </Field>
      <Field label="메모" optional error={errors.note}>
        <input name="note" maxLength={120} placeholder="예: 함께 담은 상품 포함" autoComplete="off" />
      </Field>
      <p className={styles.preview} aria-live="polite">
        <span>{overrideValue != null ? "입력한 수수료" : "예상 수수료"}</span>
        <span>{preview != null ? formatWon(preview) : "금액을 입력하세요"}</span>
      </p>
      <div className={formStyles.actions}>
        <SubmitButton pending={pending} pendingLabel="기록 중…" icon={<ClipboardPlus aria-hidden />}>
          판매 기록
        </SubmitButton>
      </div>
      <ActionNotice state={state} />
    </form>
  );
}
