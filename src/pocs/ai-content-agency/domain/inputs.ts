import { z } from "zod";
import { seoulDateKey } from "@/core/format";
import { CONTENT_KINDS, INDUSTRIES, LENGTHS, TONES, parseKeywords } from "./content";
import { isDateKey } from "./dates";
import { josa } from "./korean";
import { ORDER_STATUSES } from "./pipeline";
import { PLAN_IDS } from "./plans";

/** Validation for every form and button the module accepts (Korean messages). */

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${josa(label, "을/를")} 적어 주세요.` })
    .trim()
    .min(min, min <= 1 ? `${josa(label, "을/를")} 적어 주세요.` : `${josa(label, "은/는")} ${min}자 이상 적어 주세요.`)
    .max(max, `${josa(label, "은/는")} ${max}자까지 적을 수 있어요.`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${josa(label, "은/는")} ${max}자까지 적을 수 있어요.`).default("");

const id = (label: string) => z.uuid({ error: `${josa(label, "을/를")} 찾을 수 없어요.` });

const kind = z.enum(CONTENT_KINDS, { error: "콘텐츠 유형을 골라 주세요." });
const tone = z.enum(TONES, { error: "말투를 골라 주세요." });
const length = z.enum(LENGTHS, { error: "분량을 골라 주세요." });
const keywords = z
  .string()
  .max(300, "키워드는 300자까지 적을 수 있어요.")
  .default("")
  .transform((value) => parseKeywords(value));
const dueDate = z.string({ error: "마감일을 골라 주세요." }).refine(isDateKey, "마감일을 골라 주세요.");

const orderFields = {
  clientName: text("상호", 1, 40),
  industry: z.enum(INDUSTRIES, { error: "업종을 골라 주세요." }),
  contactName: optionalText("담당자", 30),
  contactEmail: z
    .string()
    .trim()
    .default("")
    .pipe(z.union([z.literal(""), z.email("이메일 주소를 확인해 주세요.")])),
  kind,
  topic: text("주제", 2, 80),
  brief: optionalText("상세 요청", 1000),
  keywords,
  tone,
  length,
  dueDate,
};

/** A new request (의뢰서). The due date cannot be in the past. */
export const orderInput = z.object(orderFields).refine((v) => v.dueDate >= seoulDateKey(), {
  path: ["dueDate"],
  message: "마감일은 오늘이거나 그 이후로 골라 주세요.",
});
export type OrderInput = z.infer<typeof orderInput>;

/** Editing an existing request keeps any due date, including one already passed. */
export const orderEditInput = z.object({ orderId: id("의뢰"), ...orderFields });
export type OrderEditInput = z.infer<typeof orderEditInput>;

export const moveOrderInput = z.object({
  orderId: id("의뢰"),
  to: z.enum(ORDER_STATUSES),
  draftId: id("원고").optional(),
});

export const orderIdInput = z.object({ orderId: id("의뢰") });

export const generateInput = z.object({
  kind,
  topic: text("주제", 2, 80),
  keywords,
  tone,
  length,
  notes: optionalText("추가 요청", 500),
  orderId: z
    .union([z.literal(""), id("의뢰")])
    .default("")
    .transform((v) => v || null),
});
export type GenerateInput = z.infer<typeof generateInput>;

export const regenerateInput = z.object({
  draftId: id("원고"),
  tone,
  length,
  keywords,
  notes: optionalText("추가 요청", 500),
});

export const editDraftInput = z.object({
  draftId: id("원고"),
  title: text("제목", 2, 120),
  body: text("본문", 10, 20000),
  note: optionalText("수정 메모", 80),
});

export const restoreVersionInput = z.object({
  draftId: id("원고"),
  version: z.coerce.number().int().min(1),
});

export const linkDraftInput = z.object({
  draftId: id("원고"),
  orderId: z
    .union([z.literal(""), id("의뢰")])
    .default("")
    .transform((v) => v || null),
});

export const draftIdInput = z.object({ draftId: id("원고") });

export const publishCaseInput = z.object({
  orderId: id("의뢰"),
  title: text("사례 제목", 2, 60),
  summary: text("한 줄 설명", 5, 160),
});

export const caseIdInput = z.object({ caseId: id("사례") });

export const caseEditInput = z.object({
  caseId: id("사례"),
  title: publishCaseInput.shape.title,
  summary: publishCaseInput.shape.summary,
});

export const inquiryIdInput = z.object({ inquiryId: id("문의") });

export const selectPlanInput = z.object({ plan: z.enum(PLAN_IDS, { error: "요금제를 골라 주세요." }) });

export const inquiryInput = z.object({
  companyName: text("회사명", 1, 60),
  contactName: text("담당자", 1, 30),
  email: z.string().trim().pipe(z.email("이메일 주소를 확인해 주세요.")),
  monthlyVolume: z.coerce
    .number({ error: "월 예상 건수를 숫자로 적어 주세요." })
    .int("월 예상 건수를 숫자로 적어 주세요.")
    .min(1, "월 예상 건수는 1건 이상이어야 해요.")
    .max(10_000, "월 예상 건수를 다시 확인해 주세요."),
  message: optionalText("문의 내용", 1000),
});
export type InquiryInput = z.infer<typeof inquiryInput>;
