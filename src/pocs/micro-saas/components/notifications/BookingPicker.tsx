"use client";

import Form from "next/form";
import type { NoticeType } from "../../domain/notifications";
import ui from "../world/ui.module.css";
import styles from "./notifications.module.css";

/** Which booking fills the preview. A plain GET form; with JS it applies as soon as the choice changes. */
export function BookingPicker({
  type,
  selected,
  options,
}: {
  type: NoticeType;
  selected?: string;
  options: { id: string; label: string }[];
}) {
  return (
    <Form action="/micro-saas/notifications" className={styles.picker} scroll={false}>
      <input type="hidden" name="type" value={type} />
      <label className={`${ui.field} ${ui.fieldStack}`} htmlFor="notice-booking">
        <span className={ui.fieldLabel}>미리볼 예약</span>
        <select
          key={selected}
          id="notice-booking"
          name="booking"
          defaultValue={selected}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <noscript>
        <button type="submit" className={`${ui.btn} ${ui.line} ${ui.small}`}>
          이 예약으로 보기
        </button>
      </noscript>
    </Form>
  );
}
