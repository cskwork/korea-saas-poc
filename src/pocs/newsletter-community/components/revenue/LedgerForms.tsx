"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { seoulDateKey } from "@/core/format";
import { SPONSORSHIP_STATUS_LABEL, SPONSORSHIP_STATUSES, type SponsorshipStatus } from "../../domain/revenue";
import {
  addMembershipSale,
  addSponsorship,
  changeSponsorshipStatus,
  removeMembershipSale,
  removeSponsorship,
} from "../../server/actions";
import { buttonClass } from "../ui/button";
import { ConfirmAction } from "../ui/ConfirmAction";
import { SelectField, TextField } from "../ui/fields";
import { FormMessage } from "../ui/FormMessage";
import { useToast } from "../ui/Toaster";
import { useFormSubmit } from "../ui/useFormSubmit";
import ui from "../ui/ui.module.css";
import styles from "./revenue.module.css";

function Disclosure({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={buttonClass(open ? "secondary" : "primary", "sm")}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Plus size={15} aria-hidden />
        {open ? "닫기" : label}
      </button>
      {open && children}
    </div>
  );
}

export function AddSponsorshipForm() {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(addSponsorship, {
    resetOnSuccess: true,
    toast: true,
  });
  return (
    <Disclosure label="광고 계약 적기" id="add-sponsorship">
      <form ref={formRef} action={action} onSubmit={onSubmit} id="add-sponsorship" className={styles.form} aria-label="광고 계약 적기">
        <TextField label="광고주" name="sponsorName" required maxLength={40} error={fieldError("sponsorName")} />
        <TextField label="광고 문구" name="message" required maxLength={120} error={fieldError("message")} className={styles.wide} />
        <TextField label="금액(원)" name="amount" type="number" inputMode="numeric" min={100} step={100} required error={fieldError("amount")} />
        <TextField label="게재일" name="runOn" type="date" required defaultValue={seoulDateKey()} error={fieldError("runOn")} />
        <SelectField label="상태" name="status" defaultValue="proposed" error={fieldError("status")}>
          {SPONSORSHIP_STATUSES.map((status) => (
            <option key={status} value={status}>
              {SPONSORSHIP_STATUS_LABEL[status]}
            </option>
          ))}
        </SelectField>
        <div className={styles.formActions}>
          <button type="submit" className={buttonClass("primary")} disabled={pending}>
            {pending ? "적는 중…" : "장부에 적기"}
          </button>
          <FormMessage state={state} showSuccess={false} />
        </div>
      </form>
    </Disclosure>
  );
}

export function AddMembershipSaleForm() {
  const { state, pending, formRef, onSubmit, action, fieldError } = useFormSubmit(addMembershipSale, {
    resetOnSuccess: true,
    toast: true,
  });
  return (
    <Disclosure label="멤버십 매출 적기" id="add-membership">
      <form ref={formRef} action={action} onSubmit={onSubmit} id="add-membership" className={styles.form} aria-label="멤버십 매출 적기">
        <TextField label="항목" name="item" required maxLength={40} placeholder="오프라인 모임 참가비" error={fieldError("item")} />
        <TextField label="구매자" name="buyerName" required maxLength={40} error={fieldError("buyerName")} />
        <TextField label="금액(원)" name="amount" type="number" inputMode="numeric" min={100} step={100} required error={fieldError("amount")} />
        <TextField label="날짜" name="soldOn" type="date" required defaultValue={seoulDateKey()} error={fieldError("soldOn")} />
        <div className={styles.formActions}>
          <button type="submit" className={buttonClass("primary")} disabled={pending}>
            {pending ? "적는 중…" : "장부에 적기"}
          </button>
          <FormMessage state={state} showSuccess={false} />
        </div>
      </form>
    </Disclosure>
  );
}

export function SponsorshipStatusSelect({ id, status, sponsor }: { id: string; status: SponsorshipStatus; sponsor: string }) {
  const [value, setValue] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const { report } = useToast();
  return (
    <select
      className={`${ui.select} ${styles.statusSelect}`}
      value={value}
      aria-label={`${sponsor} 광고 상태`}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value as SponsorshipStatus;
        startTransition(async () => {
          setValue(next);
          report(await changeSponsorshipStatus({ id, status: next }));
        });
      }}
    >
      {SPONSORSHIP_STATUSES.map((option) => (
        <option key={option} value={option}>
          {SPONSORSHIP_STATUS_LABEL[option]}
        </option>
      ))}
    </select>
  );
}

export function DeleteSponsorshipButton({ id, sponsor }: { id: string; sponsor: string }) {
  return (
    <ConfirmAction
      variant="quiet"
      label={`${sponsor} 광고 계약 지우기`}
      title={`${sponsor} 광고 계약을 지울까요?`}
      description="장부와 월별 수입에서 빠지고, 실려 있던 호에서도 광고가 내려가요."
      confirmLabel="계약 지우기"
      run={() => removeSponsorship({ id })}
    >
      <Trash2 size={14} aria-hidden />
    </ConfirmAction>
  );
}

export function DeleteMembershipSaleButton({ id, item }: { id: string; item: string }) {
  return (
    <ConfirmAction
      variant="quiet"
      label={`${item} 매출 지우기`}
      title="이 매출을 지울까요?"
      description={`‘${item}’ 매출이 장부와 월별 수입에서 빠져요.`}
      confirmLabel="매출 지우기"
      run={() => removeMembershipSale({ id })}
    >
      <Trash2 size={14} aria-hidden />
    </ConfirmAction>
  );
}
