"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import { formatRelative } from "@/core/format";
import { SUBSCRIBER_SOURCE_LABEL, TIER_LABEL, TIERS, type SubscriberStatus, type Tier } from "../../domain/tiers";
import { changeSubscriberPlan, editSubscriber, removeSubscriber } from "../../server/actions";
import { shortDate } from "../format";
import { buttonClass } from "../ui/button";
import { ConfirmAction } from "../ui/ConfirmAction";
import { SelectField, TextField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useToast } from "../ui/Toaster";
import { useFormSubmit } from "../ui/useFormSubmit";
import ui from "../ui/ui.module.css";
import styles from "./subscribers.module.css";

export interface SubscriberRowData {
  id: string;
  name: string;
  email: string;
  tier: Tier;
  status: SubscriberStatus;
  source: keyof typeof SUBSCRIBER_SOURCE_LABEL;
  joinedOn: string;
  lastOpenedAt: Date | string | null;
}

/** One person on the list: tier changes apply at once (optimistically), edits open inline, deletion asks first. */
export function SubscriberRow({ row }: { row: SubscriberRowData }) {
  const [editing, setEditing] = useState(false);
  const [view, patch] = useOptimistic(row, (current, change: Partial<SubscriberRowData>) => ({ ...current, ...change }));
  const [pending, startTransition] = useTransition();
  const { report } = useToast();

  const change = (next: { tier?: Tier; status?: SubscriberStatus }) =>
    startTransition(async () => {
      patch(next);
      report(await changeSubscriberPlan({ id: row.id, ...next }));
    });

  const active = view.status === "active";
  return (
    <>
      <tr className={clsx(!active && styles.inactive)} aria-busy={pending || undefined}>
        <th scope="row" className={styles.nameCell}>
          <span className={styles.name}>{view.name}</span>
          <span className={styles.source}>{SUBSCRIBER_SOURCE_LABEL[view.source]}</span>
        </th>
        <td className={styles.email} data-label="이메일">
          {view.email}
        </td>
        <td data-label="등급">
          <select
            className={clsx(ui.select, styles.tierSelect)}
            value={view.tier}
            onChange={(event) => change({ tier: event.target.value as Tier })}
            aria-label={`${view.name}님 등급`}
            disabled={pending}
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {TIER_LABEL[tier]}
              </option>
            ))}
          </select>
        </td>
        <td data-label="상태">
          <span className={clsx(ui.tag, active ? ui.tagSolid : ui.tagDashed)}>{active ? "구독 중" : "해지"}</span>
        </td>
        <td data-label="가입" className={styles.date}>
          {shortDate(view.joinedOn)}
        </td>
        <td data-label="최근 열람" className={styles.date}>
          {view.lastOpenedAt ? formatRelative(view.lastOpenedAt) : "—"}
        </td>
        <td className={styles.rowActions}>
          <button
            type="button"
            className={buttonClass("quiet", "sm")}
            aria-expanded={editing}
            aria-controls={`edit-${row.id}`}
            onClick={() => setEditing((open) => !open)}
          >
            <Pencil size={14} aria-hidden />
            고치기
          </button>
          <button
            type="button"
            className={buttonClass("quiet", "sm")}
            onClick={() => change({ status: active ? "unsubscribed" : "active" })}
            disabled={pending}
          >
            {active ? "해지" : "재개"}
          </button>
          <ConfirmAction
            variant="quiet"
            label={`${view.name}님 지우기`}
            title={`${view.name}님을 명부에서 지울까요?`}
            description="발송 기록의 이메일은 남지만 이름과 등급, 좋아요는 지워져요. 구독만 멈추려면 ‘해지’를 쓰세요."
            confirmLabel="명부에서 지우기"
            run={() => removeSubscriber({ id: row.id })}
          >
            <Trash2 size={14} aria-hidden />
          </ConfirmAction>
        </td>
      </tr>
      {editing && (
        <tr className={styles.editRow} id={`edit-${row.id}`}>
          <td colSpan={7}>
            <EditSubscriberForm row={row} onDone={() => setEditing(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

function EditSubscriberForm({ row, onDone }: { row: SubscriberRowData; onDone: () => void }) {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(editSubscriber, { toast: true });
  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);
  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.editForm} aria-label={`${row.name}님 정보 고치기`}>
      <input type="hidden" name="id" value={row.id} />
      <TextField label="이름" name="name" defaultValue={row.name} required maxLength={40} error={fieldError("name")} />
      <TextField label="이메일" name="email" type="email" defaultValue={row.email} required error={fieldError("email")} />
      <SelectField label="등급" name="tier" defaultValue={row.tier}>
        {TIERS.map((tier) => (
          <option key={tier} value={tier}>
            {TIER_LABEL[tier]}
          </option>
        ))}
      </SelectField>
      <SelectField label="상태" name="status" defaultValue={row.status}>
        <option value="active">구독 중</option>
        <option value="unsubscribed">해지</option>
      </SelectField>
      <div className={styles.editActions}>
        <button type="submit" className={buttonClass("primary", "sm")} disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </button>
        <button type="button" className={buttonClass("secondary", "sm")} onClick={onDone}>
          닫기
        </button>
      </div>
      <FormMessage state={state} showSuccess={false} />
    </form>
  );
}
