"use client";

import { useActionState, useId, useRef } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { formatNumber } from "@/core/format";
import { createServiceAction, deleteServiceAction, updateServiceAction } from "../../server/actions";
import { ConfirmButton } from "../world/Dialog";
import { errorProps, fieldError, submitKeepingValues } from "../world/forms";
import { Icon } from "../world/Icon";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";
import styles from "./settings.module.css";

export interface ServiceValues {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

/** The service list the booking page offers: each row is its own small form. */
export function ServicesEditor({ services }: { services: ServiceValues[] }) {
  return (
    <div className={styles.services}>
      <div className={styles.serviceLegend} aria-hidden="true">
        <span>서비스</span>
        <span>소요(분)</span>
        <span>가격(원)</span>
      </div>
      {services.length === 0 ? <p className={ui.emptyLine}>아직 서비스가 없어요. 아래에서 추가해 주세요.</p> : null}
      <ul className={styles.serviceList}>
        {services.map((s) => (
          <li key={`${s.id}|${s.name}|${s.durationMinutes}|${s.price}|${s.active}`}>
            <ServiceRow service={s} />
          </li>
        ))}
      </ul>
      <NewServiceRow />
    </div>
  );
}

function Cells({ state, values, id }: { state: ActionState<unknown>; values?: ServiceValues; id: string }) {
  return (
    <>
      <label className={styles.cell}>
        <span className={ui.visuallyHidden}>서비스 이름</span>
        <input
          name="name"
          defaultValue={values?.name}
          placeholder="서비스 이름"
          maxLength={20}
          required
          {...errorProps(state, "name", `${id}-name`)}
        />
      </label>
      <label className={styles.cell}>
        <span className={ui.visuallyHidden}>소요 시간(분)</span>
        <input
          name="durationMinutes"
          type="number"
          inputMode="numeric"
          min={10}
          max={480}
          step={10}
          defaultValue={values?.durationMinutes}
          placeholder="30"
          required
          {...errorProps(state, "durationMinutes", `${id}-durationMinutes`)}
        />
      </label>
      <label className={styles.cell}>
        <span className={ui.visuallyHidden}>가격(원)</span>
        <input
          name="price"
          inputMode="numeric"
          defaultValue={values ? formatNumber(values.price) : undefined}
          placeholder="15,000"
          required
          {...errorProps(state, "price", `${id}-price`)}
        />
      </label>
    </>
  );
}

function Errors({ state, id }: { state: ActionState<unknown>; id: string }) {
  if (state.status !== "error") return null;
  const fields = ["name", "durationMinutes", "price"] as const;
  const shown = fields.filter((f) => fieldError(state, f));
  return (
    <div className={styles.rowErrors}>
      {shown.map((f) => (
        <p key={f} id={`${id}-${f}-error`} className={ui.fieldError}>
          {fieldError(state, f)}
        </p>
      ))}
      {shown.length === 0 ? <p className={ui.fieldError}>{state.message}</p> : null}
    </div>
  );
}

function ServiceRow({ service }: { service: ServiceValues }) {
  const id = useId();
  const toast = useToast();
  const [state, dispatch, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await updateServiceAction(previous, data);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  return (
    <form action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={`${styles.serviceRow}${service.active ? "" : ` ${styles.paused}`}`} noValidate>
      <input type="hidden" name="id" value={service.id} />
      <Cells state={state} values={service} id={id} />
      <div className={styles.rowTools}>
        <label className={ui.check}>
          <input type="checkbox" name="active" defaultChecked={service.active} />
          예약 페이지에 표시
        </label>
        <button type="submit" className={`${ui.btn} ${ui.line} ${ui.small}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장 중…" : "저장"}
        </button>
        <ConfirmButton
          label=""
          ariaLabel={`${service.name} 서비스 삭제`}
          icon="trash"
          className={ui.iconBtn}
          title={`‘${service.name}’ 서비스를 지울까요?`}
          body={<p>지난 예약에 적힌 서비스 이름과 가격은 그대로 남아요. 잠시 쉬려면 지우지 말고 ‘예약 페이지에 표시’를 끄세요.</p>}
          confirmLabel="서비스 삭제"
          run={() => deleteServiceAction({ id: service.id })}
        />
      </div>
      <Errors state={state} id={id} />
    </form>
  );
}

function NewServiceRow() {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [state, dispatch, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await createServiceAction(previous, data);
    if (result.status === "success") form.current?.reset();
    return result;
  }, idleState);
  return (
    <form ref={form} action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={`${styles.serviceRow} ${styles.newRow}`} noValidate>
      <Cells state={state} id={id} />
      <div className={styles.rowTools}>
        <button type="submit" className={`${ui.btn} ${ui.ink} ${ui.small}`} disabled={pending} aria-busy={pending}>
          <Icon name="plus" />
          <span>{pending ? "추가하는 중…" : "서비스 추가"}</span>
        </button>
      </div>
      <Errors state={state} id={id} />
      {state.status === "success" ? (
        <p className={ui.formOk} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
