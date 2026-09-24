/** Price rules from the studio's order notes (주문 안내사항). */

/** Rush work (within 24 hours) costs 50% more. */
export const RUSH_SURCHARGE = 0.5;

/** Quotes are rounded to the nearest 1,000 won. */
export function quotePrice(input: { unitPrice: number; quantity: number; rush: boolean }): number {
  const base = input.unitPrice * Math.max(input.quantity, 1);
  const total = input.rush ? base * (1 + RUSH_SURCHARGE) : base;
  return Math.round(total / 1000) * 1000;
}

/** What the order is worth in revenue: agreed price plus billed extra revisions. */
export function orderTotal(order: { price: number; extraFees: number }): number {
  return order.price + order.extraFees;
}

export const ORDER_NOTES = [
  "모든 작업물은 상업적으로 사용할 수 있어요.",
  "포함된 수정 횟수를 넘기면 회당 추가 비용이 생겨요.",
  "24시간 안에 받아야 하는 긴급 작업은 50%가 추가돼요.",
  "구독은 매월 자동 갱신되고, 쓰지 않은 작업량은 다음 달로 넘어가지 않아요.",
  "원본 파일(PSD, AI, 프로젝트 파일)은 요청하시면 함께 드려요.",
] as const;
