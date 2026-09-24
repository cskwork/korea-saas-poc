"use client";

import { useActionState, useId, useState } from "react";
import clsx from "clsx";
import { LoaderCircle, Truck } from "lucide-react";
import { idleState, type ActionState } from "@/core/actions";
import { COURIERS, sampleTrackingNumber } from "../../domain/orders";
import { shipOrder } from "../../server/actions";
import { useToast } from "../ui/Toast";
import ui from "../ui/ui.module.css";
import styles from "./orders.module.css";

/** 발주확인 → 배송중: the courier and tracking number the wholesaler sent back. */
export function ShipForm({ orderId }: { orderId: string }) {
  const toast = useToast();
  const [state, submit, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await shipOrder(previous, formData);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const [tracking, setTracking] = useState("");
  const id = useId();
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const message =
    state.status === "error" ? (errors.trackingNumber?.[0] ?? errors.courier?.[0] ?? state.message) : null;

  return (
    <form action={submit} className={styles.ship} noValidate>
      <input type="hidden" name="id" value={orderId} />
      <label className={ui.visuallyHidden} htmlFor={`${id}-courier`}>
        택배사
      </label>
      <select
        id={`${id}-courier`}
        name="courier"
        className={clsx(ui.select, styles.shipCourier)}
        defaultValue={COURIERS[0]}
      >
        {COURIERS.map((courier) => (
          <option key={courier}>{courier}</option>
        ))}
      </select>
      <label className={ui.visuallyHidden} htmlFor={`${id}-tracking`}>
        송장번호
      </label>
      <input
        id={`${id}-tracking`}
        name="trackingNumber"
        className={clsx(ui.input, styles.shipTracking)}
        inputMode="numeric"
        autoComplete="off"
        placeholder="송장번호 10~14자리"
        value={tracking}
        onChange={(event) => setTracking(event.target.value)}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : undefined}
      />
      <button
        type="button"
        className={clsx(ui.btn, ui.btnGhost, ui.btnSm)}
        onClick={() => setTracking(sampleTrackingNumber(Math.random()))}
      >
        샘플 번호
      </button>
      <button
        type="submit"
        className={clsx(ui.btn, ui.btnPop, ui.btnSm)}
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? (
          <LoaderCircle size={14} className={ui.spin} aria-hidden />
        ) : (
          <Truck size={14} strokeWidth={2} aria-hidden />
        )}
        발송 처리
      </button>
      {message ? (
        <p className={clsx(ui.error, styles.shipError)} id={`${id}-error`} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
