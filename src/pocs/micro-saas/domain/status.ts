import type { BookingSource, BookingStatus } from "../db/schema";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "확정",
  pending: "대기",
  cancelled: "취소",
};

export const SOURCE_LABEL: Record<BookingSource, string> = {
  owner: "직접 입력",
  online: "온라인 예약",
};

/** Toast copy after a stamp: "14:00 김미영님 예약을 확정했어요". */
export const STATUS_VERB: Record<BookingStatus, string> = {
  confirmed: "확정했어요",
  pending: "대기로 돌렸어요",
  cancelled: "취소했어요",
};

/**
 * Stamps the owner can press on a booking. A pending booking waits for 확정 or 취소;
 * a confirmed one can still be cancelled; a cancelled one can be reopened as 대기.
 */
export function nextStamps(status: BookingStatus): BookingStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["cancelled"];
    case "cancelled":
      return ["pending"];
  }
}

/** Deterministic tilt (degrees, −range…range) so a stamp lands the same way on every render. */
export function stampTilt(id: string, range = 9): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return (Math.abs(hash) % (range * 2 + 1)) - range;
}
