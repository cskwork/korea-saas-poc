import { z } from "zod";
import {
  ARTICLE_KINDS,
  CATEGORIES,
  CHANNELS,
  COMMISSION_MODELS,
  COMMISSION_TYPES,
  CONVERSION_STATUSES,
  LINK_STATUSES,
} from "./catalog";
import { normalizeCustomCode } from "./codes";
import { parseRatePercent, parseWon } from "./commission";
import { isDayKey } from "./dates";
import { isSafeDestination } from "./tracking";

/** zod schemas for every form. Field names match the form controls' `name`s. */

const text = (max: number, message = `${max}자 이내로 입력해 주세요.`) => z.string().trim().max(max, message);
const required = (label: string, max: number) =>
  z
    .string({ error: `${label}을(를) 입력해 주세요.` })
    .trim()
    .min(1, `${label}을(를) 입력해 주세요.`)
    .max(max, `${label}은(는) ${max}자 이내로 입력해 주세요.`);

/** Optional won amount from a text input ("" → null). */
const optionalWon = (label: string) =>
  z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value?.trim()) return null;
      const won = parseWon(value);
      if (won == null) {
        ctx.addIssue({ code: "custom", message: `${label}은(는) 숫자로 입력해 주세요.` });
        return z.NEVER;
      }
      return won;
    });

const requiredWon = (label: string) =>
  z.string({ error: `${label}을(를) 입력해 주세요.` }).transform((value, ctx) => {
    const won = parseWon(value);
    if (won == null) {
      ctx.addIssue({ code: "custom", message: `${label}을(를) 숫자로 입력해 주세요.` });
      return z.NEVER;
    }
    return won;
  });

const ratePercent = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!value?.trim()) return 0;
    const bp = parseRatePercent(value);
    if (bp == null) {
      ctx.addIssue({ code: "custom", message: "수수료율은 0~100 사이, 소수 둘째 자리까지 입력해 주세요." });
      return z.NEVER;
    }
    return bp;
  });

export const destinationUrl = z
  .string({ error: "이동할 주소를 입력해 주세요." })
  .trim()
  .min(1, "이동할 주소를 입력해 주세요.")
  .max(2000, "주소가 너무 길어요.")
  .refine(isSafeDestination, "http:// 또는 https:// 로 시작하는 전체 주소를 입력해 주세요.");

const optionalUuid = z
  .string()
  .optional()
  .transform((v) => (v ? v : null))
  .pipe(z.uuid("올바르지 않은 항목이에요.").nullable());

const linkFields = {
  productName: required("상품명", 80),
  programId: optionalUuid,
  category: z.enum(CATEGORIES, { error: "카테고리를 골라 주세요." }),
  destinationUrl,
  priceWon: optionalWon("상품 가격"),
  commissionType: z.enum(COMMISSION_TYPES, { error: "수수료 방식을 골라 주세요." }),
  commissionRate: ratePercent,
  commissionFixed: optionalWon("건당 수수료"),
  memo: text(200),
};

export const createLinkInput = z.object({
  ...linkFields,
  code: z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (!value?.trim()) return null;
      const result = normalizeCustomCode(value);
      if (!result.ok) {
        ctx.addIssue({ code: "custom", message: result.message });
        return z.NEVER;
      }
      return result.code;
    }),
});
export type CreateLinkInput = z.infer<typeof createLinkInput>;

export const updateLinkInput = z.object({
  id: z.uuid(),
  ...linkFields,
  status: z.enum(LINK_STATUSES, { error: "상태를 골라 주세요." }),
});
export type UpdateLinkInput = z.infer<typeof updateLinkInput>;

export const idInput = z.object({ id: z.uuid() });

export const linkStatusInput = z.object({ id: z.uuid(), status: z.enum(LINK_STATUSES) });

export const recordConversionInput = z.object({
  linkId: z.uuid("링크를 골라 주세요."),
  orderedOn: z.string().refine(isDayKey, "주문일을 골라 주세요."),
  orderAmount: requiredWon("주문 금액"),
  commissionOverride: optionalWon("수수료"),
  status: z.enum(CONVERSION_STATUSES).default("pending"),
  channel: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.enum(CHANNELS).nullable()),
  note: text(120),
});
export type RecordConversionInput = z.infer<typeof recordConversionInput>;

export const conversionStatusInput = z.object({ id: z.uuid(), status: z.enum(CONVERSION_STATUSES) });

export const goalInput = z.object({
  goal: requiredWon("목표 금액").pipe(z.number().min(10_000, "목표는 1만 원 이상으로 정해 주세요.").max(10_000_000_000)),
});

const programFields = {
  name: required("프로그램 이름", 40),
  model: z.enum(COMMISSION_MODELS, { error: "수수료 구조를 골라 주세요." }),
  defaultRate: ratePercent,
  defaultFixed: optionalWon("건당 수수료"),
  settlementCycle: text(60),
  minPayout: optionalWon("최소 지급액"),
  cookieWindow: text(40),
  bestChannels: text(80),
  bestCategories: text(80),
  notes: text(300),
};
export const createProgramInput = z.object(programFields);
export const updateProgramInput = z.object({ id: z.uuid(), ...programFields });
export type ProgramInput = z.infer<typeof createProgramInput>;

/** Repeated form fields arrive as a string (one row) or an array (several rows). */
const rows = <T extends z.ZodType>(item: T) =>
  z.preprocess((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]), z.array(item));

const splitList = (value: string) =>
  value
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 8);

export const articleRequestInput = z
  .object({
    kind: z.enum(ARTICLE_KINDS),
    title: text(80),
    audience: text(60),
    summary: text(600),
    itemLinkId: rows(z.string()),
    itemName: rows(z.string().trim().max(80, "제품명은 80자 이내로 입력해 주세요.")),
    itemPrice: rows(z.string()),
    itemRating: rows(z.string()),
    itemPros: rows(z.string().max(300)),
    itemCons: rows(z.string().max(300)),
    itemReason: rows(z.string().max(300)),
  })
  .transform((input, ctx) => {
    const items = input.itemName.map((name, index) => {
      const priceRaw = input.itemPrice[index] ?? "";
      const ratingRaw = (input.itemRating[index] ?? "").trim();
      const price = priceRaw.trim() ? parseWon(priceRaw) : null;
      const rating = ratingRaw ? Number(ratingRaw) : null;
      if (priceRaw.trim() && price == null) ctx.addIssue({ code: "custom", path: ["itemPrice"], message: `${index + 1}번 제품의 가격을 숫자로 입력해 주세요.` });
      if (rating != null && !(rating >= 1 && rating <= 5)) ctx.addIssue({ code: "custom", path: ["itemRating"], message: `${index + 1}번 제품의 평점은 1~5 사이로 입력해 주세요.` });
      const linkId = input.itemLinkId[index]?.trim() || null;
      if (linkId && !z.uuid().safeParse(linkId).success) ctx.addIssue({ code: "custom", path: ["itemLinkId"], message: "링크 선택이 올바르지 않아요." });
      return {
        linkId,
        name: name.trim(),
        priceWon: price,
        rating: rating != null && Number.isFinite(rating) ? Math.round(rating * 10) / 10 : null,
        pros: splitList(input.itemPros[index] ?? ""),
        cons: splitList(input.itemCons[index] ?? ""),
        reason: (input.itemReason[index] ?? "").trim(),
      };
    });
    const filled = items.filter((item) => item.name || item.linkId);
    const limits = { comparison: [2, 4], ranking: [1, 10], review: [1, 1] }[input.kind];
    if (filled.length < limits[0] || filled.length > limits[1]) {
      ctx.addIssue({
        code: "custom",
        path: ["itemName"],
        message: input.kind === "comparison" ? "비교할 제품을 2~4개 입력해 주세요." : input.kind === "ranking" ? "추천할 제품을 1~10개 입력해 주세요." : "리뷰할 제품을 입력해 주세요.",
      });
    }
    return { kind: input.kind, title: input.title, audience: input.audience, summary: input.summary, items: filled };
  });
export type ArticleRequestInput = z.infer<typeof articleRequestInput>;

export const updateArticleInput = z.object({
  id: z.uuid(),
  title: required("제목", 120),
  body: required("본문", 20_000),
});

export const socialRequestInput = z.object({
  linkId: optionalUuid,
  productName: required("상품명", 80),
  category: z.enum(CATEGORIES).default("기타"),
  price: optionalWon("정가"),
  salePrice: optionalWon("판매가"),
  points: z
    .string()
    .max(600, "포인트는 600자 이내로 입력해 주세요.")
    .default("")
    .transform((value) => value.split("\n").map((p) => p.trim()).filter(Boolean).slice(0, 5)),
});
export type SocialRequestInput = z.infer<typeof socialRequestInput>;
