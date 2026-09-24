import { z } from "zod";
import { ORDER_STATUSES, ORDER_TYPES } from "./catalog";

/** Form and action inputs, shared by server actions and tests. Field names match the form controls. */

const blankToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const checkbox = z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean());
const list = (item: z.ZodString, max: number) =>
  z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(item).max(max));
const lines = (maxItems: number, maxLength: number) =>
  z.preprocess(
    (v) =>
      typeof v === "string"
        ? v
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        : (v ?? []),
    z
      .array(z.string().max(maxLength, `한 줄은 ${maxLength}자 이내로 적어 주세요.`))
      .max(maxItems, `최대 ${maxItems}줄까지 적을 수 있어요.`),
  );
const won = (label: string, max = 100_000_000) =>
  z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: `${label}을 숫자로 적어 주세요.` })
      .int(`${label}은 원 단위 정수로 적어 주세요.`)
      .min(0, `${label}은 0원 이상이어야 해요.`)
      .max(max, `${label}이 너무 커요.`),
  );

const dayKey = z.iso.date({ error: "날짜를 선택해 주세요." });

/** Empty means unlimited. */
const revisionLimit = z.preprocess(
  blankToUndefined,
  z.coerce
    .number()
    .int()
    .min(0, "0회 이상으로 적어 주세요.")
    .max(20, "20회 이하로 적어 주세요.")
    .nullable()
    .default(null),
);

export const orderInput = z.object({
  packageId: z.preprocess(blankToUndefined, z.uuid().optional()),
  type: z.enum(ORDER_TYPES, { error: "작업 종류를 선택해 주세요." }),
  title: z.string().trim().min(2, "작업명을 2자 이상 적어 주세요.").max(60, "작업명은 60자 이내로 적어 주세요."),
  clientName: z.string().trim().min(1, "고객 이름을 적어 주세요.").max(40, "고객 이름은 40자 이내로 적어 주세요."),
  clientContact: z.string().trim().max(80, "연락처는 80자 이내로 적어 주세요.").default(""),
  brief: z.string().trim().max(2000, "요청 사항은 2,000자 이내로 적어 주세요.").default(""),
  referenceLinks: lines(10, 300),
  dueDate: dayKey,
  quantity: z.coerce
    .number()
    .int("수량은 정수로 적어 주세요.")
    .min(1, "수량은 1 이상이어야 해요.")
    .max(100, "수량은 100 이하로 적어 주세요."),
  rush: checkbox,
  price: won("금액"),
  revisionLimit,
  tools: list(z.string().max(40), 12),
});
export type OrderInput = z.infer<typeof orderInput>;

export const orderUpdateInput = orderInput.extend({ id: z.uuid() });

export const orderIdInput = z.object({ orderId: z.uuid() });

export const transitionInput = z.object({
  orderId: z.uuid(),
  to: z.enum(ORDER_STATUSES),
});

export const revisionInput = z.object({
  orderId: z.uuid(),
  note: z
    .string()
    .trim()
    .min(2, "고객이 요청한 수정 내용을 적어 주세요.")
    .max(500, "수정 내용은 500자 이내로 적어 주세요."),
  extraConfirmed: checkbox,
  extraFee: z.preprocess(blankToUndefined, won("추가 비용", 10_000_000).default(0)),
});

export const briefIdInput = z.object({ briefId: z.uuid() });

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이에요.");

export const portfolioInput = z.object({
  orderId: z.preprocess(blankToUndefined, z.uuid().optional()),
  title: z.string().trim().min(2, "작업 제목을 2자 이상 적어 주세요.").max(60, "제목은 60자 이내로 적어 주세요."),
  category: z.enum(ORDER_TYPES, { error: "카테고리를 선택해 주세요." }),
  clientLabel: z.string().trim().min(1, "어떤 고객의 작업인지 적어 주세요.").max(40, "40자 이내로 적어 주세요."),
  headline: z
    .string()
    .trim()
    .min(1, "작업물에 들어간 대표 문구를 적어 주세요.")
    .max(40, "대표 문구는 40자 이내로 적어 주세요."),
  summary: z.string().trim().max(400, "설명은 400자 이내로 적어 주세요.").default(""),
  tools: list(z.string().max(40), 12),
  palette: list(hexColor, 3),
});
export type PortfolioInput = z.infer<typeof portfolioInput>;

export const portfolioUpdateInput = portfolioInput.extend({ id: z.uuid() });

export const portfolioIdInput = z.object({ id: z.uuid() });

export const goalInput = z.object({
  monthlyGoal: z.coerce
    .number({ error: "목표 금액을 숫자로 적어 주세요." })
    .int("원 단위 정수로 적어 주세요.")
    .min(100_000, "목표는 10만 원 이상으로 정해 주세요.")
    .max(1_000_000_000, "목표가 너무 커요."),
});

export const packageUpdateInput = z.object({
  id: z.uuid(),
  price: won("가격", 50_000_000),
  revisionLimit,
  turnaroundDays: z.coerce
    .number()
    .int()
    .min(1, "작업 기간은 1일 이상이에요.")
    .max(60, "작업 기간은 60일 이하로 적어 주세요."),
  featured: checkbox,
});
