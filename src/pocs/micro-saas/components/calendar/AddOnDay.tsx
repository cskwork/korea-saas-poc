"use client";

import { formatDayLabel } from "../../domain/time";
import { useNewBooking } from "../booking/NewBooking";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import styles from "./calendar.module.css";

export function AddOnDay({ date }: { date: string }) {
  const open = useNewBooking();
  return (
    <div className={styles.addRow}>
      <button type="button" className={`${ui.btn} ${ui.line} ${ui.block}`} onClick={() => open({ date })}>
        <Icon name="plus" />
        <span>{formatDayLabel(date)}에 예약 적기</span>
      </button>
    </div>
  );
}
