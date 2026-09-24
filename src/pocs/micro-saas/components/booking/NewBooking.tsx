"use client";

import { createContext, useActionState, useCallback, useContext, useId, useState, type ReactNode } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { formatPhone } from "../../domain/phone";
import { createBookingAction, deleteBookingAction } from "../../server/actions";
import { Dialog, useDialog } from "../world/Dialog";
import { Field } from "../world/Field";
import { Icon } from "../world/Icon";
import { errorProps, fieldError, submitKeepingValues } from "../world/forms";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";
import { SlipWhen, type SlipHours, type SlipService } from "./SlipFields";
import styles from "./slip.module.css";

export interface SlipPrefill {
  date?: string;
  time?: string;
  customerName?: string;
  customerPhone?: string;
}

const OpenSlip = createContext<(prefill?: SlipPrefill) => void>(() => {});

/** Opens the new-booking slip from anywhere in the console, optionally prefilled. */
export function useNewBooking() {
  return useContext(OpenSlip);
}

export function NewBookingProvider({
  services,
  hours,
  today,
  children,
}: {
  services: SlipService[];
  hours: SlipHours;
  today: string;
  children: ReactNode;
}) {
  const dialog = useDialog();
  const [slip, setSlip] = useState<{ key: number; prefill: SlipPrefill }>({ key: 0, prefill: {} });
  const open = useCallback(
    (prefill: SlipPrefill = {}) => {
      setSlip((current) => ({ key: current.key + 1, prefill }));
      dialog.open();
    },
    [dialog],
  );

  return (
    <OpenSlip.Provider value={open}>
      {children}
      <Dialog dialogRef={dialog.ref} title="새 예약 적기">
        {slip.key > 0 ? (
          <NewBookingForm
            key={slip.key}
            services={services.filter((s) => s.active)}
            hours={hours}
            prefill={{ date: today, ...slip.prefill }}
            onSaved={dialog.close}
          />
        ) : null}
      </Dialog>
    </OpenSlip.Provider>
  );
}

export function NewBookingButton({ compact = false }: { compact?: boolean }) {
  const open = useNewBooking();
  return (
    <button type="button" className={`${ui.btn} ${ui.ink}${compact ? ` ${styles.compactNew}` : ""}`} onClick={() => open()}>
      <Icon name="plus" />
      <span>새 예약</span>
    </button>
  );
}

function NewBookingForm({
  services,
  hours,
  prefill,
  onSaved,
}: {
  services: SlipService[];
  hours: SlipHours;
  prefill: SlipPrefill & { date: string };
  onSaved: () => void;
}) {
  const id = useId();
  const toast = useToast();
  const [state, dispatch, pending] = useActionState(
    async (previous: ActionState<{ id: string }>, data: FormData) => {
      const result = await createBookingAction(previous, data);
      if (result.status === "success" && result.data) {
        const bookingId = result.data.id;
        onSaved();
        toast(result.message ?? "예약을 적었어요.", {
          actionLabel: "되돌리기",
          onAction: async () => {
            const undone = await deleteBookingAction({ id: bookingId });
            toast(undone.status === "error" ? undone.message : "예약 추가를 되돌렸어요.", {
              tone: undone.status === "error" ? "error" : "info",
            });
          },
        });
      }
      return result;
    },
    idleState,
  );
  const [phone, setPhone] = useState(prefill.customerPhone ?? "");

  if (services.length === 0) {
    return <p className={ui.hint}>예약을 받으려면 먼저 매장 설정에서 서비스를 추가해 주세요.</p>;
  }

  return (
    <form action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={styles.form} noValidate>
      <Field id={`${id}-name`} label="고객명" error={fieldError(state, "customerName")}>
        <input
          id={`${id}-name`}
          name="customerName"
          autoComplete="off"
          placeholder="홍길동"
          defaultValue={prefill.customerName}
          required
          autoFocus
          {...errorProps(state, "customerName", `${id}-name`)}
        />
      </Field>
      <Field id={`${id}-phone`} label="연락처" error={fieldError(state, "customerPhone")}>
        <input
          id={`${id}-phone`}
          name="customerPhone"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="010-1234-5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhone((v) => (v ? formatPhone(v) : v))}
          required
          {...errorProps(state, "customerPhone", `${id}-phone`)}
        />
      </Field>
      <SlipWhen
        state={state}
        services={services}
        hours={hours}
        initial={{ date: prefill.date, time: prefill.time ?? "", serviceId: services[0]?.id ?? "" }}
      />
      <fieldset className={styles.statusSet}>
        <legend className={ui.visuallyHidden}>상태</legend>
        <div className={ui.segmented}>
          <label className={ui.segment}>
            <input type="radio" name="status" value="confirmed" defaultChecked />
            확정으로 적기
          </label>
          <label className={ui.segment}>
            <input type="radio" name="status" value="pending" />
            대기로 적기
          </label>
        </div>
      </fieldset>
      <Field id={`${id}-memo`} label="메모" area error={fieldError(state, "memo")}>
        <textarea id={`${id}-memo`} name="memo" rows={2} placeholder="특이사항 (선택)" maxLength={200} />
      </Field>
      {state.status === "error" && !state.fieldErrors ? (
        <p className={ui.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className={`${ui.btn} ${ui.ink} ${ui.block} ${ui.large}`} disabled={pending} aria-busy={pending}>
        {pending ? "적는 중…" : "예약 저장"}
      </button>
    </form>
  );
}
