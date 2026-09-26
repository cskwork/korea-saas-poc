import { daysBetween } from "./dates";

/** The order pipeline: 접수 → 작성중 → 검수 → 납품완료. */
export const ORDER_STATUSES = ["received", "writing", "review", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "접수",
  writing: "작성중",
  review: "검수",
  delivered: "납품완료",
};

export const STATUS_HINT: Record<OrderStatus, string> = {
  received: "들어온 의뢰서, 아직 시안 전",
  writing: "시안을 쓰고 다듬는 중",
  review: "에디터 검수를 기다리는 원고",
  delivered: "고객에게 넘긴 원고",
};

/** Label of the button that moves an order out of each status. */
export const ADVANCE_LABEL: Record<Exclude<OrderStatus, "delivered">, string> = {
  received: "작성 시작",
  writing: "검수 요청",
  review: "납품하기",
};

export const RETREAT_LABEL: Record<Exclude<OrderStatus, "received">, string> = {
  writing: "접수로 되돌리기",
  review: "작성중으로 되돌리기",
  delivered: "검수로 되돌리기",
};

export function statusIndex(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status);
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  return ORDER_STATUSES[statusIndex(status) + 1] ?? null;
}

export function previousStatus(status: OrderStatus): OrderStatus | null {
  const index = statusIndex(status);
  return index > 0 ? ORDER_STATUSES[index - 1] : null;
}

/** Orders move one step at a time, forward or back. */
export function canMove(from: OrderStatus, to: OrderStatus): boolean {
  return Math.abs(statusIndex(to) - statusIndex(from)) === 1;
}

export type DueTone = "late" | "today" | "soon" | "normal" | "done";

export interface DueState {
  /** Days until the due date (negative when late). */
  daysLeft: number;
  /** "D-3", "D-day", "2일 지연", "납품" */
  label: string;
  tone: DueTone;
}

/**
 * Where an order stands against its due date. Delivered orders are judged by the
 * day they were delivered: on time or how many days late.
 */
export function dueState(input: {
  dueDate: string;
  today: string;
  status: OrderStatus;
  deliveredOn?: string | null;
}): DueState {
  if (input.status === "delivered") {
    const lateBy = input.deliveredOn ? daysBetween(input.dueDate, input.deliveredOn) : 0;
    return {
      daysLeft: -lateBy,
      label: lateBy > 0 ? `${lateBy}일 늦게 납품` : "기한 내 납품",
      tone: "done",
    };
  }
  const daysLeft = daysBetween(input.today, input.dueDate);
  if (daysLeft < 0) return { daysLeft, label: `${-daysLeft}일 지연`, tone: "late" };
  if (daysLeft === 0) return { daysLeft, label: "D-day", tone: "today" };
  return { daysLeft, label: `D-${daysLeft}`, tone: daysLeft <= 2 ? "soon" : "normal" };
}

/** "#007" */
export function orderCode(number: number): string {
  return `#${String(number).padStart(3, "0")}`;
}
