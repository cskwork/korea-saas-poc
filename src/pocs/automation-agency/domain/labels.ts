import type {
  Complexity,
  Industry,
  LeadStatus,
  MaintenanceStatus,
  PackageKind,
  Platform,
  QuoteStatus,
} from "../db/schema";

/** Korean labels for the module's enums. Kept in one place so every screen says the same thing. */

export const INDUSTRIES = ["manufacturing", "retail", "service", "it", "other"] as const satisfies readonly Industry[];
export const INDUSTRY_LABEL: Record<Industry, string> = {
  manufacturing: "제조",
  retail: "유통",
  service: "서비스",
  it: "IT",
  other: "기타",
};

export const PACKAGE_KINDS = [
  "data",
  "communication",
  "reporting",
  "settlement",
] as const satisfies readonly PackageKind[];
export const PACKAGE_KIND_LABEL: Record<PackageKind, string> = {
  data: "데이터처리",
  communication: "커뮤니케이션",
  reporting: "리포팅",
  settlement: "결제정산",
};

export const MAINTENANCE_STATUSES = [
  "none",
  "active",
  "paused",
  "ended",
] as const satisfies readonly MaintenanceStatus[];
export const MAINTENANCE_LABEL: Record<MaintenanceStatus, string> = {
  none: "미가입",
  active: "운행 중",
  paused: "일시 정지",
  ended: "종료",
};

export const QUOTE_STATUSES = ["draft", "sent", "accepted", "declined"] as const satisfies readonly QuoteStatus[];
export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "작성 중",
  sent: "발송",
  accepted: "수락",
  declined: "거절",
};

export const LEAD_STATUSES = ["new", "consulting", "quoted", "won", "on_hold"] as const satisfies readonly LeadStatus[];
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "신규",
  consulting: "상담 중",
  quoted: "견적 발송",
  won: "계약",
  on_hold: "보류",
};

export const COMPLEXITIES = ["simple", "normal", "complex"] as const satisfies readonly Complexity[];
export const COMPLEXITY_LABEL: Record<Complexity, string> = { simple: "단순", normal: "보통", complex: "복잡" };

/**
 * Automation platforms are the "lines" of the network: each has a line colour
 * (a token name in the module CSS) and a short code used on line badges.
 */
export const PLATFORMS = ["make", "zapier", "n8n", "apps_script"] as const satisfies readonly Platform[];
export const PLATFORM_INFO: Record<Platform, { label: string; code: string; tool: string }> = {
  make: { label: "Make", code: "M", tool: "Make" },
  zapier: { label: "Zapier", code: "Z", tool: "Zapier" },
  n8n: { label: "n8n", code: "N", tool: "n8n" },
  apps_script: { label: "Apps Script", code: "G", tool: "Google Apps Script" },
};

/** The platform a catalogue tool name belongs to, if it is one of the four lines. */
export function platformOfTool(tool: string): Platform | undefined {
  return PLATFORMS.find((p) => PLATFORM_INFO[p].tool.toLowerCase() === tool.trim().toLowerCase());
}
