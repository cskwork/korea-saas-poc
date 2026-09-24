"use client";

import { deleteCustomerAction } from "../../server/actions";
import { useNewBooking } from "../booking/NewBooking";
import { ConfirmButton } from "../world/Dialog";
import { Icon } from "../world/Icon";
import ui from "../world/ui.module.css";
import styles from "./customers.module.css";

/** Book this customer again, or remove them (and their history) after a confirmation. */
export function CustomerActions({
  customer,
  bookings,
}: {
  customer: { id: string; name: string; phone: string };
  bookings: number;
}) {
  const open = useNewBooking();
  return (
    <div className={styles.detailActions}>
      <button
        type="button"
        className={`${ui.btn} ${ui.ink}`}
        onClick={() => open({ customerName: customer.name, customerPhone: customer.phone })}
      >
        <Icon name="plus" />
        <span>이 고객 예약 적기</span>
      </button>
      <ConfirmButton
        label="고객 삭제"
        icon="trash"
        className={`${ui.btn} ${ui.text}`}
        title={`${customer.name}님을 고객 목록에서 지울까요?`}
        body={
          <p>
            {bookings > 0 ? (
              <>
                이 고객의 예약 기록 <strong>{bookings}건</strong>도 함께 지워지고 되살릴 수 없어요.
              </>
            ) : (
              "지운 고객은 되살릴 수 없어요."
            )}
          </p>
        }
        confirmLabel="고객 삭제"
        run={() => deleteCustomerAction({ id: customer.id })}
      />
    </div>
  );
}
