import { z } from "zod";
import { APP_IDS, MAX_COLUMNS, MAX_LANES, MAX_NODES, NODE_KINDS } from "./workflow";
import {
  COMPLEXITIES,
  INDUSTRIES,
  LEAD_STATUSES,
  MAINTENANCE_STATUSES,
  PACKAGE_KINDS,
  PLATFORMS,
  QUOTE_STATUSES,
} from "./labels";
import { STAGES } from "./stages";
import { ROI_LIMITS } from "./roi";

/**
 * Input schemas shared by server actions and data functions. Form values arrive
 * as strings, so numbers are coerced and empty strings mean "not set".
 */

const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const toArray = (value: unknown) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const text = (max: number) => z.string().trim().max(max, `${max}자 이내로 입력해 주세요.`);
const required = (label: string, max: number) => text(max).min(1, `${label}을(를) 입력해 주세요.`);
const optionalText = (max: number) => z.preprocess((v) => v ?? "", text(max));

const won = (label: string, max = 1_000_000_000) =>
  z.coerce
    .number({ error: `${label}을(를) 숫자로 입력해 주세요.` })
    .int(`${label}은(는) 원 단위 정수로 입력해 주세요.`)
    .min(0, `${label}은(는) 0원 이상이어야 해요.`)
    .max(max, `${label}이(가) 너무 커요.`);

const optionalDate = z
  .preprocess(blankToUndefined, z.iso.date("날짜 형식이 올바르지 않아요.").nullish())
  .transform((v) => v ?? null);

export const idInput = z.object({ id: z.uuid("잘못된 요청이에요.") });

// --- Catalogue -------------------------------------------------------------

export const packageInput = z.object({
  name: required("패키지 이름", 60),
  industry: z.enum(INDUSTRIES, "업종을 선택해 주세요."),
  kind: z.enum(PACKAGE_KINDS, "유형을 선택해 주세요."),
  summary: required("한 줄 설명", 160),
  details: optionalText(1000),
  tools: z
    .preprocess((v) => (typeof v === "string" ? v.split(",") : toArray(v)), z.array(z.string().trim().max(40)))
    .transform((tools) => [...new Set(tools.filter(Boolean))])
    .pipe(
      z.array(z.string()).min(1, "사용 도구를 하나 이상 입력해 주세요.").max(8, "도구는 8개까지 입력할 수 있어요."),
    ),
  buildHours: z.coerce.number().int().min(1, "구축 시간은 1시간 이상이어야 해요.").max(2000),
  monthlyHoursSaved: z.coerce.number().int().min(0, "0 이상으로 입력해 주세요.").max(2000),
  setupFee: won("구축비", 100_000_000),
  monthlyFee: won("월 유지보수비", 20_000_000),
});
export type PackageInput = z.infer<typeof packageInput>;

export const packageUpdateInput = packageInput.extend(idInput.shape);
export const archiveInput = idInput.extend({ archived: z.enum(["true", "false"]).transform((v) => v === "true") });

// --- Projects --------------------------------------------------------------

const projectFields = z.object({
  clientName: required("고객명", 60),
  industry: z.enum(INDUSTRIES, "업종을 선택해 주세요."),
  stage: z.enum(STAGES, "단계를 선택해 주세요.").default("waiting"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  assignee: optionalText(30),
  startDate: optionalDate,
  dueDate: optionalDate,
  notes: optionalText(1000),
  packageIds: z.preprocess(toArray, z.array(z.uuid("패키지를 다시 선택해 주세요.")).max(10)),
  setupFee: won("구축비", 200_000_000),
  monthlyFee: won("월 유지보수비", 50_000_000),
  maintenanceStatus: z.enum(MAINTENANCE_STATUSES).default("none"),
  maintenanceStartedOn: optionalDate,
});

const datesInOrder = (v: { startDate: string | null; dueDate: string | null }) =>
  !v.startDate || !v.dueDate || v.startDate <= v.dueDate;
const datesMessage = { message: "마감일은 시작일 이후여야 해요.", path: ["dueDate"] };

export const projectInput = projectFields.refine(datesInOrder, datesMessage);
export type ProjectInput = z.infer<typeof projectInput>;

export const projectUpdateInput = projectFields.extend(idInput.shape).refine(datesInOrder, datesMessage);

export const maintenanceInput = idInput.extend({ maintenanceStatus: z.enum(MAINTENANCE_STATUSES) });

// --- Quotes ----------------------------------------------------------------

export const quoteLineInput = z.object({
  packageId: z.uuid().nullable(),
  name: required("항목명", 80),
  complexity: z.enum(COMPLEXITIES),
  quantity: z.coerce.number().int().min(1, "수량은 1 이상이어야 해요.").max(99),
  unitSetupFee: won("구축비", 100_000_000),
  unitMonthlyFee: won("월 유지보수비", 20_000_000),
});
export type QuoteLineInput = z.infer<typeof quoteLineInput>;

export const quoteInput = z.object({
  clientName: required("고객명", 60),
  contactName: optionalText(30),
  issuedOn: z.iso.date("발행일을 입력해 주세요."),
  validDays: z.coerce
    .number()
    .int()
    .min(7, "유효기간은 7일 이상이어야 해요.")
    .max(90, "유효기간은 90일 이하여야 해요."),
  notes: optionalText(1000),
  diagnosisId: z.preprocess(blankToUndefined, z.uuid().optional()),
  lines: z.preprocess((v) => {
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return undefined;
    }
  }, z.array(quoteLineInput, "견적 항목을 읽지 못했어요.").min(1, "견적 항목을 하나 이상 담아 주세요.").max(30)),
});
export type QuoteInput = z.infer<typeof quoteInput>;

export const quoteUpdateInput = quoteInput.extend(idInput.shape);
export const quoteStatusInput = idInput.extend({ status: z.enum(QUOTE_STATUSES) });

export const profileInput = z.object({
  agencyName: required("상호", 40),
  representative: required("대표자", 20),
  businessNumber: optionalText(20),
  email: z.preprocess(blankToUndefined, z.email("이메일 형식이 올바르지 않아요.").optional()).transform((v) => v ?? ""),
  phone: optionalText(20),
});
export type ProfileInput = z.infer<typeof profileInput>;

// --- ROI diagnoses -------------------------------------------------------------

const bounded = (key: keyof typeof ROI_LIMITS, label: string) =>
  z.coerce
    .number({ error: `${label}을(를) 숫자로 입력해 주세요.` })
    .int()
    .min(ROI_LIMITS[key].min, `${label}은(는) ${ROI_LIMITS[key].min.toLocaleString("ko-KR")} 이상이어야 해요.`)
    .max(ROI_LIMITS[key].max, `${label}은(는) ${ROI_LIMITS[key].max.toLocaleString("ko-KR")} 이하여야 해요.`);

export const roiInput = z.object({
  weeklyHours: bounded("weeklyHours", "주당 반복 업무 시간"),
  hourlyCost: bounded("hourlyCost", "시간당 인건비"),
  automationRate: bounded("automationRate", "자동화 비율"),
  investment: bounded("investment", "구축비"),
  monthlyFee: bounded("monthlyFee", "월 유지보수비"),
});

export const diagnosisInput = roiInput.extend({
  clientName: required("고객명", 60),
  contactName: optionalText(30),
  industry: z.enum(INDUSTRIES, "업종을 선택해 주세요."),
  note: optionalText(500),
});
export type DiagnosisInput = z.infer<typeof diagnosisInput>;

export const diagnosisStatusInput = idInput.extend({ status: z.enum(LEAD_STATUSES) });

// --- Workflows -------------------------------------------------------------

export const workflowCreateInput = z.object({
  name: required("워크플로 이름", 60),
  platform: z.enum(PLATFORMS, "플랫폼을 선택해 주세요."),
  template: z.preprocess(blankToUndefined, z.string().max(40).optional()),
  projectId: z.preprocess(blankToUndefined, z.uuid().optional()),
});
export type WorkflowCreateInput = z.infer<typeof workflowCreateInput>;

export const graphInput = z.object({
  nodes: z
    .array(
      z.object({
        key: z.string().min(1).max(64),
        kind: z.enum(NODE_KINDS),
        app: z.string().refine((app) => (APP_IDS as readonly string[]).includes(app), "알 수 없는 앱이에요."),
        label: required("역 이름", 40),
        column: z
          .number()
          .int()
          .min(0)
          .max(MAX_COLUMNS - 1),
        lane: z
          .number()
          .int()
          .min(0)
          .max(MAX_LANES - 1),
      }),
    )
    .max(MAX_NODES),
  edges: z.array(z.object({ from: z.string().max(64), to: z.string().max(64), label: text(12) })).max(MAX_NODES * 3),
});

export const workflowSaveInput = z.object({
  id: z.uuid(),
  name: required("워크플로 이름", 60),
  description: optionalText(200),
  platform: z.enum(PLATFORMS),
  projectId: z.uuid().nullable(),
  graph: graphInput,
});
export type WorkflowSaveInput = z.infer<typeof workflowSaveInput>;
