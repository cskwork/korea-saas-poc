"use client";

import { useActionState, useId } from "react";
import { idleState } from "@/core/actions";
import { formatMinute } from "../../domain/time";
import { deleteBookingAction, updateBookingAction } from "../../server/actions";
import type { BookingRow } from "../../server/store/bookings";
import { ConfirmButton } from "../world/Dialog";
import { Field } from "../world/Field";
import { fieldError, submitKeepingValues } from "../world/forms";
import ui from "../world/ui.module.css";
import { SlipWhen, type SlipHours, type SlipService } from "./SlipFields";
import styles from "./detail.module.css";

/** Move a booking or change its service and memo; the booked price stays unless the service changes. */
export function EditBookingForm({
  booking,
  services,
  hours,
}: {
  booking: BookingRow;
  services: SlipService[];
  hours: SlipHours;
}) {
  const id = useId();
  const [state, dispatch, pending] = useActionState(updateBookingAction, idleState);

  return (
    <form action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={styles.form} noValidate>
      <input type="hidden" name="id" value={booking.id} />
      <SlipWhen
        state={state}
        services={services}
        hours={hours}
        initial={{ date: booking.date, time: formatMinute(booking.startMinute), serviceId: "" }}
        booked={{ id: booking.id, serviceId: booking.serviceId, serviceName: booking.serviceName }}
      />
      <Field id={`${id}-memo`} label="메모" area error={fieldError(state, "memo")}>
        <textarea id={`${id}-memo`} name="memo" rows={2} defaultValue={booking.memo} maxLength={200} placeholder="특이사항 (선택)" />
      </Field>
      <div role="status" aria-live="polite">
        {state.status === "error" && !state.fieldErrors ? <p className={ui.formError}>{state.message}</p> : null}
        {state.status === "success" ? <p className={ui.formOk}>{state.message}</p> : null}
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={`${ui.btn} ${ui.ink}`} disabled={pending} aria-busy={pending}>
          {pending ? "저장하는 중…" : "변경 저장"}
        </button>
        <ConfirmButton
          label="예약 기록 삭제"
          icon="trash"
          className={`${ui.btn} ${ui.text}`}
          title="이 예약 기록을 지울까요?"
          body={
            <>
              <p>잘못 적은 예약일 때만 지워 주세요. 지운 기록은 되살릴 수 없어요.</p>
              <p>손님이 오지 않거나 약속을 바꾼 경우에는 지우지 말고 취소 도장을 찍으면 예약장에 기록이 남아요.</p>
            </>
          }
          confirmLabel="기록 삭제"
          run={() => deleteBookingAction({ id: booking.id, returnTo: `/micro-saas/calendar?date=${booking.date}` })}
        />
      </div>
    </form>
  );
}
