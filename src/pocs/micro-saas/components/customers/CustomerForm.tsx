"use client";

import { useActionState, useId, useState } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { formatPhone } from "../../domain/phone";
import { createCustomerAction, updateCustomerAction } from "../../server/actions";
import { Field } from "../world/Field";
import { errorProps, fieldError, submitKeepingValues } from "../world/forms";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";
import styles from "./customers.module.css";

interface Values {
  id?: string;
  name: string;
  phone: string;
  memo: string;
}

/** Register a customer by hand, or correct one's name, phone and memo. */
export function CustomerForm({ customer }: { customer?: Values }) {
  const id = useId();
  const toast = useToast();
  // A saved customer re-keys this form with the stored values, so success is announced as a toast.
  const [state, dispatch, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await (customer?.id ? updateCustomerAction : createCustomerAction)(previous, data);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const [phone, setPhone] = useState(customer?.phone ?? "");

  return (
    <form action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={styles.form} noValidate>
      {customer?.id ? <input type="hidden" name="id" value={customer.id} /> : null}
      <Field id={`${id}-name`} label="이름" error={fieldError(state, "name")}>
        <input
          id={`${id}-name`}
          name="name"
          defaultValue={customer?.name}
          autoComplete="off"
          required
          {...errorProps(state, "name", `${id}-name`)}
        />
      </Field>
      <Field id={`${id}-phone`} label="연락처" error={fieldError(state, "phone")}>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="010-1234-5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhone((v) => (v ? formatPhone(v) : v))}
          required
          {...errorProps(state, "phone", `${id}-phone`)}
        />
      </Field>
      <Field id={`${id}-memo`} label="메모" area error={fieldError(state, "memo")}>
        <textarea
          id={`${id}-memo`}
          name="memo"
          rows={2}
          maxLength={300}
          defaultValue={customer?.memo}
          placeholder="시술 기록, 주의할 점 (선택)"
        />
      </Field>
      <div role="status" aria-live="polite">
        {state.status === "error" && !state.fieldErrors ? <p className={ui.formError}>{state.message}</p> : null}
      </div>
      <button type="submit" className={`${ui.btn} ${ui.ink}`} disabled={pending} aria-busy={pending}>
        {pending ? "저장하는 중…" : customer?.id ? "고객 정보 저장" : "고객 등록"}
      </button>
    </form>
  );
}
