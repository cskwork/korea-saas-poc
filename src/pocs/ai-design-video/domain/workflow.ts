import type { OrderStatus } from "./catalog";

/**
 * The production workflow: 의뢰접수 → 시안작업 ⇄ 수정요청 → 납품완료.
 *
 * A client's change request moves a draft into 수정요청 and uses one revision
 * round; starting the rework moves it back to 시안작업. Rounds beyond the
 * package's allowance are allowed only as a billed extra.
 */

export type TransitionKind = "start" | "request-revision" | "rework" | "deliver" | "reopen";

export interface Transition {
  kind: TransitionKind;
  to: OrderStatus;
  label: string;
}

const TRANSITIONS: Record<OrderStatus, readonly Transition[]> = {
  received: [{ kind: "start", to: "drafting", label: "시안 작업 시작" }],
  drafting: [
    { kind: "deliver", to: "delivered", label: "납품 완료" },
    { kind: "request-revision", to: "revision", label: "수정 요청 기록" },
  ],
  revision: [{ kind: "rework", to: "drafting", label: "수정 작업 시작" }],
  delivered: [{ kind: "reopen", to: "drafting", label: "납품 되돌리기" }],
};

export function availableTransitions(status: OrderStatus): readonly Transition[] {
  return TRANSITIONS[status];
}

export function findTransition(from: OrderStatus, to: OrderStatus): Transition | undefined {
  return TRANSITIONS[from].find((t) => t.to === to);
}

export interface Allowance {
  /** Rounds still included in the package; null when unlimited. */
  remaining: number | null;
  /** True when the next change request would go beyond the allowance. */
  nextIsExtra: boolean;
}

export function revisionAllowance(limit: number | null, used: number): Allowance {
  if (limit === null) return { remaining: null, nextIsExtra: false };
  const remaining = Math.max(limit - used, 0);
  return { remaining, nextIsExtra: remaining === 0 };
}

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

export interface RevisionPlan {
  round: number;
  extraFee: number;
}

/**
 * Decides the round number and fee for a new change request.
 * Beyond the allowance, the operator must confirm it as a billed extra.
 */
export function planRevision(
  order: { status: OrderStatus; revisionLimit: number | null; revisionsUsed: number },
  request: { extraConfirmed: boolean; extraFee: number },
): RevisionPlan {
  if (!findTransition(order.status, "revision")) {
    throw new WorkflowError("시안 작업 중인 주문에만 수정 요청을 기록할 수 있어요.");
  }
  const { nextIsExtra } = revisionAllowance(order.revisionLimit, order.revisionsUsed);
  const round = order.revisionsUsed + 1;
  if (!nextIsExtra) return { round, extraFee: 0 };
  if (!request.extraConfirmed) {
    throw new WorkflowError(
      `포함된 수정 ${order.revisionLimit}회를 모두 사용했어요. 추가 수정으로 기록하려면 추가 비용을 확인해 주세요.`,
    );
  }
  if (request.extraFee < 0) throw new WorkflowError("추가 비용은 0원 이상이어야 해요.");
  return { round, extraFee: request.extraFee };
}
