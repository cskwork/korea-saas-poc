import { z } from "zod";
import { isDateKey } from "../domain/dates";
import { CONVERSION_SHARES, ESTIMATE_STATUSES, INVOICE_STATUSES } from "../domain/documents";
import { CLIENT_GRADES, NOTE_KINDS, PLAN_CATEGORIES } from "../domain/labels";
import { PRIORITIES, PROJECT_STATUSES } from "../domain/pipeline";

/** Zod schemas for every server action. Form fields arrive as strings; empty strings mean "none". */

export const id = z.uuid({ message: "잘못된 요청이에요." });

const optionalId = z
  .union([z.literal(""), z.uuid()])
  .optional()
  .transform((value) => value || null);

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자 이내로 입력하세요.`)
    .optional()
    .transform((value) => value ?? "");

const required = (message: string, max: number) => z.string({ message }).trim().min(1, message).max(max, `${max}자 이내로 입력하세요.`);

const stripNumber = (value: unknown) => (typeof value === "string" ? value.replaceAll(",", "").replaceAll("원", "").trim() : value);

const won = (max = 10_000_000_000) =>
  z.preprocess(
    (value) => {
      const stripped = stripNumber(value);
      return stripped === "" || stripped === undefined ? 0 : stripped;
    },
    z.coerce.number({ message: "숫자로 입력하세요." }).int("원 단위 정수로 입력하세요.").min(0, "0 이상으로 입력하세요.").max(max, "금액이 너무 커요."),
  );

const dateKey = z.string({ message: "날짜를 입력하세요." }).refine(isDateKey, "날짜 형식이 올바르지 않아요.");

const optionalDate = z
  .union([z.literal(""), dateKey])
  .optional()
  .transform((value) => value || null);

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((value) => value === "on" || value === "true");

/** "React, Node.js ,, PostgreSQL" → ["React", "Node.js", "PostgreSQL"] */
const list = (separator: RegExp, maxItems: number, maxLength: number) =>
  z
    .string()
    .optional()
    .transform((value) =>
      (value ?? "")
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, maxItems)
        .map((item) => item.slice(0, maxLength)),
    );

// ---------------------------------------------------------------------------------------------

export const clientInput = z.object({
  id: optionalId,
  name: required("이름이나 담당자명을 입력하세요.", 40),
  company: text(60),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || z.email().safeParse(value).success, "이메일 형식이 올바르지 않아요."),
  phone: text(30),
  grade: z.enum(CLIENT_GRADES, { message: "고객 등급을 고르세요." }),
  notes: text(1000),
});

export const noteInput = z.object({
  clientId: id,
  kind: z.enum(NOTE_KINDS),
  body: required("내용을 입력하세요.", 1000),
  occurredOn: dateKey,
});

export const projectInput = z
  .object({
    id: optionalId,
    title: required("프로젝트명을 입력하세요.", 80),
    clientId: optionalId,
    status: z.enum(PROJECT_STATUSES),
    priority: z.enum(PRIORITIES),
    budget: won(),
    startOn: optionalDate,
    dueOn: optionalDate,
    description: text(2000),
  })
  .refine((v) => !v.startOn || !v.dueOn || v.startOn <= v.dueOn, { message: "마감일은 시작일 이후여야 해요.", path: ["dueOn"] });

export const moveProjectInput = z.object({
  id,
  status: z.enum(PROJECT_STATUSES),
  index: z.number().int().min(0).max(10_000),
});

const hoursValue = z.preprocess(
  (value) => (value === "" || value === undefined ? null : stripNumber(value)),
  z.coerce.number({ message: "시간은 숫자로 입력하세요." }).min(0.5, "0.5시간 이상으로 입력하세요.").max(2000, "시간이 너무 커요.").nullable(),
);

export const milestoneInput = z.object({
  id: optionalId,
  projectId: id,
  title: required("마일스톤 이름을 입력하세요.", 80),
  estimatedHours: hoursValue,
  dueOn: optionalDate,
});

export const toggleInput = z.object({ id, done: z.boolean() });
export const directionInput = z.object({ id, direction: z.union([z.literal(-1), z.literal(1)]) });
export const idInput = z.object({ id });

// --- Documents -------------------------------------------------------------------------------

export const lineItem = z.object({
  title: z.string().trim().min(1, "항목 이름을 입력하세요.").max(120, "항목 이름은 120자 이내로 입력하세요."),
  unit: z.enum(["hour", "lump"]),
  quantity: z.number({ message: "수량을 입력하세요." }).positive("수량은 0보다 커야 해요.").max(10_000, "수량이 너무 커요."),
  unitPrice: z.number({ message: "단가를 입력하세요." }).int("단가는 원 단위 정수예요.").min(0).max(1_000_000_000, "단가가 너무 커요."),
});

const lineItems = z
  .string({ message: "항목을 하나 이상 입력하세요." })
  .transform((value, ctx) => {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "항목을 읽지 못했어요. 다시 시도해 주세요." });
      return z.NEVER;
    }
  })
  .pipe(z.array(lineItem, { message: "항목을 읽지 못했어요." }).min(1, "항목을 하나 이상 입력하세요.").max(60, "항목은 60개까지 넣을 수 있어요."));

const documentFields = {
  id: optionalId,
  clientId: optionalId,
  projectId: optionalId,
  title: required("문서 제목을 입력하세요.", 100),
  taxMode: z.enum(["withholding", "vat", "none"]),
  discount: won(),
  issuedOn: dateKey,
  notes: text(1000),
  items: lineItems,
};

export const estimateInput = z
  .object({ ...documentFields, validUntil: dateKey })
  .refine((v) => v.validUntil >= v.issuedOn, { message: "유효기간은 발행일 이후여야 해요.", path: ["validUntil"] });

export const invoiceInput = z
  .object({ ...documentFields, dueOn: dateKey })
  .refine((v) => v.dueOn >= v.issuedOn, { message: "입금 기한은 발행일 이후여야 해요.", path: ["dueOn"] });

export const estimateStatusInput = z.object({ id, status: z.enum(ESTIMATE_STATUSES) });
export const invoiceStatusInput = z.object({ id, status: z.enum(INVOICE_STATUSES), paidOn: dateKey.optional() });
export const convertInput = z.object({ id, share: z.enum(CONVERSION_SHARES) });

export const draftInput = z.object({
  brief: z.string().trim().min(10, "요청 내용을 10자 이상 붙여 넣어 주세요.").max(4000, "요청 내용은 4,000자 이내로 줄여 주세요."),
  hourlyRate: z.number().int().min(1_000).max(10_000_000),
});

// --- Time ------------------------------------------------------------------------------------

export const timerInput = z.object({
  projectId: z.uuid({ message: "프로젝트를 고르세요." }),
  milestoneId: optionalId,
  note: text(200),
});

const minutesFromHours = z.preprocess(
  stripNumber,
  z.coerce
    .number({ message: "작업 시간을 숫자로 입력하세요." })
    .min(0.25, "15분(0.25시간) 이상으로 입력하세요.")
    .max(24, "하루 24시간을 넘을 수 없어요.")
    .transform((hours) => Math.round(hours * 60)),
);

export const entryInput = z.object({
  id: optionalId,
  projectId: z.uuid({ message: "프로젝트를 고르세요." }),
  milestoneId: optionalId,
  workedOn: dateKey,
  hours: minutesFromHours,
  note: text(200),
});

// --- Showcase --------------------------------------------------------------------------------

export const portfolioInput = z.object({
  id: optionalId,
  projectId: optionalId,
  title: required("프로젝트명을 입력하세요.", 80),
  summary: text(600),
  role: text(80),
  outcome: text(300),
  stack: list(/[,\n]/, 12, 30),
  url: z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || /^https?:\/\/\S+$/.test(value), "http:// 또는 https://로 시작하는 주소를 입력하세요."),
  period: text(40),
  published: checkbox,
});

export const publishInput = z.object({ id, published: z.boolean() });

export const planInput = z.object({
  id: optionalId,
  category: z.enum(PLAN_CATEGORIES),
  name: required("요금제 이름을 입력하세요.", 40),
  price: won(1_000_000_000),
  delivery: text(30),
  features: list(/\n/, 12, 60),
  featured: checkbox,
});

// --- Settings & public -----------------------------------------------------------------------

export const profileInput = z.object({
  displayName: required("이름을 입력하세요.", 40),
  businessName: text(60),
  headline: text(120),
  bio: text(600),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || z.email().safeParse(value).success, "이메일 형식이 올바르지 않아요."),
  phone: text(30),
  businessNumber: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => value === null || /^\d{3}-\d{2}-\d{5}$/.test(value), "사업자등록번호는 000-00-00000 형식이에요."),
  taxMode: z.enum(["withholding", "vat", "none"]),
  bankAccount: text(80),
  hourlyRate: won(10_000_000),
  monthlyGoal: won(1_000_000_000),
});

export const inquiryInput = z.object({
  name: required("이름을 입력하세요.", 40),
  company: text(60),
  email: z.string({ message: "회신받을 이메일을 입력하세요." }).trim().pipe(z.email("이메일 형식이 올바르지 않아요.")),
  phone: text(30),
  category: z
    .union([z.literal(""), z.enum(PLAN_CATEGORIES)])
    .optional()
    .transform((value) => value || null),
  budget: won(),
  message: required("만들고 싶은 것을 적어 주세요.", 2000),
});
