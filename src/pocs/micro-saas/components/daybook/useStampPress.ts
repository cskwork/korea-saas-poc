"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { BookingStatus } from "../../db/schema";
import { setBookingStatusAction } from "../../server/actions";
import { useToast } from "../world/Toast";

/**
 * Pressing a status stamp: the seal lands at once (optimistic), the server records it, and the
 * toast offers 되돌리기, which restores the status the booking had before.
 */
export function useStampPress(booking: { id: string; status: BookingStatus }) {
  const toast = useToast();
  const [status, setStatus] = useOptimistic(booking.status);
  const [pressed, setPressed] = useState<BookingStatus | null>(null);
  const [busy, startTransition] = useTransition();

  const press = (next: BookingStatus) =>
    startTransition(async () => {
      setStatus(next);
      setPressed(next);
      const result = await setBookingStatusAction({ id: booking.id, status: next });
      if (result.status !== "success") {
        setPressed(null);
        toast(result.status === "error" ? result.message : "도장을 찍지 못했어요.", { tone: "error" });
        return;
      }
      const previous = result.data?.previous ?? booking.status;
      toast(result.message ?? "상태를 바꿨어요.", {
        actionLabel: "되돌리기",
        onAction: async () => {
          const undone = await setBookingStatusAction({ id: booking.id, status: previous });
          toast(undone.status === "error" ? undone.message : "되돌렸어요.", {
            tone: undone.status === "error" ? "error" : "info",
          });
        },
      });
    });

  /** Play the press only for the seal this owner just pressed. */
  return { status, busy, press, fresh: pressed === status };
}
