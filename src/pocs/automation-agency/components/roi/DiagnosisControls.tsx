"use client";

import { useActionState, useRef } from "react";
import { idleState } from "@/core/actions";
import type { LeadStatus } from "../../db/schema";
import { LEAD_STATUS_LABEL, LEAD_STATUSES } from "../../domain/labels";
import { deleteDiagnosisAction, setDiagnosisStatusAction } from "../../server/actions";
import { ConfirmSubmit } from "../ui/ConfirmSubmit";
import ui from "../ui/ui.module.css";
import styles from "./roi.module.css";

/** Lead status that saves as soon as it changes. */
export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [state, action, pending] = useActionState(setDiagnosisStatusAction, idleState);
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={action} className={styles.statusForm}>
      <input type="hidden" name="id" value={id} />
      <label className={ui.srOnly} htmlFor={`lead-${id}`}>
        진단 상태
      </label>
      <select
        id={`lead-${id}`}
        name="status"
        defaultValue={status}
        className={`${ui.select} ${styles.statusSelect}`}
        disabled={pending}
        onChange={() => form.current?.requestSubmit()}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">변경</button>
      </noscript>
      {state.status === "error" ? (
        <span role="alert" className={ui.error}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

export function DeleteDiagnosis({ id }: { id: string }) {
  const [state, action] = useActionState(deleteDiagnosisAction, idleState);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit label="삭제" question="이 진단을 지울까요?" small />
      {state.status === "error" ? (
        <span role="alert" className={ui.error}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
