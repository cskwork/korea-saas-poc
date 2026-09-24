"use client";

import { useActionState, useId, useState } from "react";
import { idleState, type ActionState } from "@/core/actions";
import { formatPhone } from "../../domain/phone";
import { WEEKDAY_LABELS, formatMinute } from "../../domain/time";
import { updateShopAction } from "../../server/actions";
import { Field } from "../world/Field";
import { errorProps, fieldError, submitKeepingValues } from "../world/forms";
import { useToast } from "../world/Toast";
import ui from "../world/ui.module.css";
import styles from "./settings.module.css";

export interface ShopValues {
  name: string;
  category: string;
  ownerName: string;
  phone: string;
  address: string;
  openMinute: number;
  closeMinute: number;
  seats: number;
  closedWeekdays: number[];
  cancelPolicy: string;
}

const HOURS = Array.from({ length: 48 }, (_, i) => i * 30);
/** Monday first, like a shop's week. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

/** Shop details and opening hours: the booking slots are derived from these. */
export function ShopForm({ shop }: { shop: ShopValues }) {
  const id = useId();
  const toast = useToast();
  // Saving re-keys this form with the stored values, so success is announced as a toast.
  const [state, dispatch, pending] = useActionState(async (previous: ActionState, data: FormData) => {
    const result = await updateShopAction(previous, data);
    if (result.status === "success" && result.message) toast(result.message);
    return result;
  }, idleState);
  const [phone, setPhone] = useState(shop.phone);

  return (
    <form action={dispatch} onSubmit={submitKeepingValues(dispatch)} className={styles.form} noValidate>
      <Field id={`${id}-name`} label="상호" error={fieldError(state, "name")}>
        <input id={`${id}-name`} name="name" defaultValue={shop.name} required {...errorProps(state, "name", `${id}-name`)} />
      </Field>
      <div className={ui.pair}>
        <Field id={`${id}-category`} label="업종" stack error={fieldError(state, "category")}>
          <input
            id={`${id}-category`}
            name="category"
            defaultValue={shop.category}
            placeholder="미용실, 네일샵…"
            required
            {...errorProps(state, "category", `${id}-category`)}
          />
        </Field>
        <Field id={`${id}-owner`} label="대표자" stack error={fieldError(state, "ownerName")}>
          <input
            id={`${id}-owner`}
            name="ownerName"
            defaultValue={shop.ownerName}
            required
            {...errorProps(state, "ownerName", `${id}-owner`)}
          />
        </Field>
      </div>
      <Field id={`${id}-phone`} label="전화" error={fieldError(state, "phone")}>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setPhone((v) => (v ? formatPhone(v) : v))}
          required
          {...errorProps(state, "phone", `${id}-phone`)}
        />
      </Field>
      <Field id={`${id}-address`} label="주소" error={fieldError(state, "address")}>
        <input
          id={`${id}-address`}
          name="address"
          defaultValue={shop.address}
          required
          {...errorProps(state, "address", `${id}-address`)}
        />
      </Field>

      <h3 className={ui.subHead}>영업 시간</h3>
      <div className={ui.pair}>
        <Field id={`${id}-open`} label="여는 시간" stack error={fieldError(state, "openTime")}>
          <select id={`${id}-open`} name="openTime" defaultValue={formatMinute(shop.openMinute)} {...errorProps(state, "openTime", `${id}-open`)}>
            {HOURS.map((m) => (
              <option key={m} value={formatMinute(m)}>
                {formatMinute(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${id}-close`} label="닫는 시간" stack error={fieldError(state, "closeTime")}>
          <select id={`${id}-close`} name="closeTime" defaultValue={formatMinute(shop.closeMinute)} {...errorProps(state, "closeTime", `${id}-close`)}>
            {HOURS.map((m) => (
              <option key={m} value={formatMinute(m)}>
                {formatMinute(m)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field id={`${id}-seats`} label="좌석 수" error={fieldError(state, "seats")}>
        <input
          id={`${id}-seats`}
          name="seats"
          type="number"
          inputMode="numeric"
          min={1}
          max={20}
          defaultValue={shop.seats}
          aria-describedby={`${id}-seats-hint`}
          {...errorProps(state, "seats", `${id}-seats`)}
        />
      </Field>
      <p id={`${id}-seats-hint`} className={ui.hint}>
        같은 시간에 받을 수 있는 예약 수예요. 의자나 베드 수만큼 적어 주세요.
      </p>
      <fieldset className={styles.weekdays}>
        <legend className={styles.legend}>휴무 요일</legend>
        <div className={ui.segmented}>
          {WEEK.map((day) => (
            <label key={day} className={`${ui.segment}${day === 0 ? ` ${styles.sun}` : day === 6 ? ` ${styles.sat}` : ""}`}>
              <input type="checkbox" name="closedWeekdays" value={day} defaultChecked={shop.closedWeekdays.includes(day)} />
              {WEEKDAY_LABELS[day]}
            </label>
          ))}
        </div>
        {fieldError(state, "closedWeekdays") ? <p className={ui.fieldError}>{fieldError(state, "closedWeekdays")}</p> : null}
      </fieldset>
      <Field id={`${id}-policy`} label="취소 규정" area error={fieldError(state, "cancelPolicy")}>
        <textarea
          id={`${id}-policy`}
          name="cancelPolicy"
          rows={2}
          maxLength={80}
          defaultValue={shop.cancelPolicy}
          placeholder="예: 변경·취소는 방문 1시간 전까지 가능합니다."
        />
      </Field>
      <p className={ui.hint}>취소 규정은 예약 확인 알림톡의 마지막 줄로 들어가요.</p>

      <div role="status" aria-live="polite">
        {state.status === "error" && !state.fieldErrors ? <p className={ui.formError}>{state.message}</p> : null}
        {state.status === "error" && state.fieldErrors ? <p className={ui.formError}>빨간 칸을 확인해 주세요.</p> : null}
      </div>
      <button type="submit" className={`${ui.btn} ${ui.ink}`} disabled={pending} aria-busy={pending}>
        {pending ? "저장하는 중…" : "매장 정보 저장"}
      </button>
    </form>
  );
}
