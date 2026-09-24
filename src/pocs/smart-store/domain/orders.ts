import { naverFee } from "./margin";

/**
 * SmartStore order workflow: 신규주문 → 발주확인 → 배송중 → 배송완료, or 취소
 * before the parcel leaves the wholesaler.
 */
export const ORDER_STATUSES = ["new", "confirmed", "shipping", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_FLOW = ["new", "confirmed", "shipping", "delivered"] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "신규주문",
  confirmed: "발주확인",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
};

export const COURIERS = ["CJ대한통운", "한진택배", "롯데택배", "우체국택배", "로젠택배"] as const;
export type Courier = (typeof COURIERS)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = (ORDER_FLOW as readonly OrderStatus[]).indexOf(status);
  if (index < 0 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

/** An order can be cancelled until the wholesaler has shipped it. */
export function canCancel(status: OrderStatus): boolean {
  return status === "new" || status === "confirmed";
}

/** Korean courier tracking numbers are 10–14 digits; hyphens and spaces are ignored. */
export function normalizeTrackingNumber(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "");
  return /^\d{10,14}$/.test(digits) ? digits : null;
}

/** 123456789012 → "1234-5678-9012" */
export function formatTrackingNumber(value: string): string {
  return value.replace(/(\d{4})(?=\d)/g, "$1-");
}

export interface OrderLine {
  quantity: number;
  unitPrice: number;
  unitCost: number;
  /** Shipping the seller pays per order (one parcel). */
  shippingCost: number;
  feeRateBp: number;
}

export interface OrderAmounts {
  revenue: number;
  cost: number;
  fee: number;
  shipping: number;
  profit: number;
}

export function orderAmounts(line: OrderLine): OrderAmounts {
  const revenue = line.unitPrice * line.quantity;
  const cost = line.unitCost * line.quantity;
  const fee = naverFee(revenue, line.feeRateBp);
  const shipping = line.shippingCost;
  return { revenue, cost, fee, shipping, profit: revenue - cost - fee - shipping };
}

/**
 * SmartStore-style 16-digit product order number: the Seoul order date plus
 * eight digits (`random` in [0, 1)).
 */
export function makeOrderNumber(seoulDateKey: string, random: number): string {
  const suffix = Math.floor(random * 100_000_000)
    .toString()
    .padStart(8, "0");
  return `${seoulDateKey.replaceAll("-", "")}${suffix}`;
}

/** A plausible 12-digit tracking number for sample data (`random` in [0, 1)). */
export function sampleTrackingNumber(random: number): string {
  return `6${Math.floor(random * 100_000_000_000)
    .toString()
    .padStart(11, "0")}`;
}
