import type { EstimateStatus, InvoiceStatus } from "./documents";
import type { LineUnit, TaxMode } from "./money";
import type { Priority, ProjectStatus } from "./pipeline";

/** Korean labels for every enum the UI shows. */

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  inquiry: "문의",
  progress: "진행 중",
  review: "검수 중",
  done: "완료",
};

export const PRIORITY_LABEL: Record<Priority, string> = { high: "높음", medium: "보통", low: "낮음" };

export const ESTIMATE_STATUS_LABEL: Record<EstimateStatus, string> = {
  draft: "작성 중",
  sent: "발송됨",
  accepted: "수락됨",
  declined: "거절됨",
  invoiced: "청구됨",
};

/** Verb for moving an estimate into a status. */
export const ESTIMATE_ACTION_LABEL: Record<EstimateStatus, string> = {
  draft: "작성 중으로 되돌리기",
  sent: "발송 처리",
  accepted: "수락 기록",
  declined: "거절 기록",
  invoiced: "인보이스로 전환",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  issued: "발행",
  awaiting: "입금대기",
  paid: "입금완료",
};

export const INVOICE_ACTION_LABEL: Record<InvoiceStatus, string> = {
  issued: "발송 전으로 되돌리기",
  awaiting: "발송 처리",
  paid: "입금 확인",
};

export const TAX_MODE_LABEL: Record<TaxMode, string> = {
  withholding: "원천징수 3.3%",
  vat: "부가세 10%",
  none: "세금 없음",
};

export const TAX_MODE_HINT: Record<TaxMode, string> = {
  withholding: "사업자 미등록 프리랜서 · 사업소득 3.3%를 떼고 입금",
  vat: "일반과세자 · 공급가액에 부가세 10%를 더해 세금계산서 발행",
  none: "간이과세자 영수증, 해외 고객 등 세금 줄 없이 청구",
};

export const LINE_UNIT_LABEL: Record<LineUnit, string> = { hour: "시간", lump: "식" };

export const CLIENT_GRADES = ["vip", "regular", "new"] as const;
export type ClientGrade = (typeof CLIENT_GRADES)[number];

export const CLIENT_GRADE_LABEL: Record<ClientGrade, string> = { vip: "VIP", regular: "일반", new: "신규" };

export const NOTE_KINDS = ["call", "meeting", "email", "memo"] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export const NOTE_KIND_LABEL: Record<NoteKind, string> = { call: "통화", meeting: "미팅", email: "메일", memo: "메모" };

export const PLAN_CATEGORIES = ["website", "app", "nocode"] as const;
export type PlanCategory = (typeof PLAN_CATEGORIES)[number];

export const PLAN_CATEGORY_LABEL: Record<PlanCategory, string> = {
  website: "웹사이트",
  app: "앱",
  nocode: "노코드 · 로코드",
};
