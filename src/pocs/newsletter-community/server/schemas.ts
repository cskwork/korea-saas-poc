import { z } from "zod";
import { BOARD_CATEGORIES } from "../domain/board";
import { CATEGORIES } from "../domain/issues";
import { SPONSORSHIP_STATUSES } from "../domain/revenue";
import { AUDIENCES, TIERS } from "../domain/tiers";
import { SUBSCRIBER_SORTS } from "./store/subscribers";

/** Input schemas shared by server actions, route handlers and search-param parsing. */

const text = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label}을(를) 입력해 주세요.`)
    .max(max, `${label}은(는) ${max}자까지 쓸 수 있어요.`);

const optionalText = (max: number) => z.string().trim().max(max, `${max}자까지 쓸 수 있어요.`).default("");

const won = (label: string) =>
  z.coerce
    .number({ error: `${label}을(를) 숫자로 입력해 주세요.` })
    .int(`${label}은(는) 원 단위 정수로 입력해 주세요.`)
    .min(0, `${label}은(는) 0원 이상이어야 해요.`)
    .max(1_000_000_000, `${label}이(가) 너무 커요.`);

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜를 골라 주세요.");
const email = z.string().trim().toLowerCase().pipe(z.email("이메일 형식을 확인해 주세요.")).pipe(z.string().max(120));
const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);

export const idInput = z.object({ id: z.uuid() });

// ---- issues ---------------------------------------------------------------

export const ISSUE_INTENTS = ["save", "schedule", "unschedule", "publish"] as const;

export const issueFormInput = z
  .object({
    id: z.preprocess(emptyToUndefined, z.uuid().optional()),
    title: text("제목", 120),
    lede: optionalText(200),
    body: z.string().max(40_000, "본문은 4만 자까지 쓸 수 있어요.").default(""),
    category: z.enum(CATEGORIES, "꼭지를 골라 주세요."),
    audience: z.enum(AUDIENCES, "받는 사람을 골라 주세요."),
    sponsorshipId: z.preprocess(emptyToUndefined, z.uuid().optional()),
    intent: z.enum(ISSUE_INTENTS).default("save"),
    scheduleDate: z.preprocess(emptyToUndefined, day.optional()),
    scheduleTime: z.preprocess(emptyToUndefined, z.string().regex(/^\d{2}:\d{2}$/, "시각을 골라 주세요.").optional()),
  })
  .refine((input) => input.intent !== "schedule" || (input.scheduleDate && input.scheduleTime), {
    message: "예약할 날짜와 시각을 골라 주세요.",
    path: ["scheduleDate"],
  });

export type IssueFormInput = z.infer<typeof issueFormInput>;

export const issueListQuery = z.object({
  status: z.preprocess(emptyToUndefined, z.enum(["draft", "scheduled", "published"]).optional()).catch(undefined),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()).catch(undefined),
});

// ---- subscribers ----------------------------------------------------------

export const subscriberInput = z.object({
  name: text("이름", 40),
  email,
  tier: z.enum(TIERS, "등급을 골라 주세요."),
});

export const subscriberUpdateInput = subscriberInput.extend({
  id: z.uuid(),
  status: z.enum(["active", "unsubscribed"], "상태를 골라 주세요."),
});

export const subscriptionChangeInput = z.object({
  id: z.uuid(),
  tier: z.enum(TIERS).optional(),
  status: z.enum(["active", "unsubscribed"]).optional(),
});

export const MAX_CSV_BYTES = 1_000_000;

export const csvImportInput = z.object({
  file: z
    .instanceof(File, { message: "CSV 파일을 골라 주세요." })
    .refine((file) => file.size > 0, "CSV 파일을 골라 주세요.")
    .refine((file) => file.size <= MAX_CSV_BYTES, "파일은 1MB까지 올릴 수 있어요."),
});

export const subscriberListQuery = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(60).optional()).catch(undefined),
  tier: z.preprocess(emptyToUndefined, z.enum(TIERS).optional()).catch(undefined),
  status: z.preprocess(emptyToUndefined, z.enum(["active", "unsubscribed"]).optional()).catch(undefined),
  sort: z.preprocess(emptyToUndefined, z.enum(SUBSCRIBER_SORTS).optional()).catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

// ---- board ----------------------------------------------------------------

/** Which identity performs a board action: the editor (studio) or the cookie reader (public letter). */
const boardRole = z.enum(["editor", "reader"]);

export const postInput = z.object({
  as: boardRole,
  category: z.enum(BOARD_CATEGORIES, "말머리를 골라 주세요."),
  title: text("제목", 80),
  body: text("내용", 4000),
});

export const commentInput = z.object({
  as: boardRole,
  postId: z.uuid(),
  body: text("댓글", 1000),
});

export const boardTargetInput = z.object({ as: boardRole, id: z.uuid() });
export const pinInput = z.object({ id: z.uuid(), pinned: z.boolean() });
export const likeInput = z.object({ as: boardRole, postId: z.uuid(), liked: z.boolean() });

export const boardQuery = z.object({
  category: z.preprocess(emptyToUndefined, z.enum(BOARD_CATEGORIES).optional()).catch(undefined),
});

// ---- revenue --------------------------------------------------------------

export const sponsorshipInput = z.object({
  sponsorName: text("광고주", 40),
  message: text("광고 문구", 120),
  amount: won("금액").refine((value) => value > 0, "금액은 1원 이상이어야 해요."),
  runOn: day,
  status: z.enum(SPONSORSHIP_STATUSES, "상태를 골라 주세요."),
});

export const sponsorshipStatusInput = z.object({ id: z.uuid(), status: z.enum(SPONSORSHIP_STATUSES) });

export const membershipSaleInput = z.object({
  item: text("항목", 40),
  buyerName: text("구매자", 40),
  amount: won("금액").refine((value) => value > 0, "금액은 1원 이상이어야 해요."),
  soldOn: day,
});

// ---- settings -------------------------------------------------------------

export const publicationInput = z.object({
  name: text("레터 이름", 40),
  description: text("소개", 200),
  editorName: text("에디터 이름", 20),
  sendHour: z.coerce.number().int().min(0, "0시부터 23시 사이로 골라 주세요.").max(23, "0시부터 23시 사이로 골라 주세요."),
  revenueGoal: won("월 수입 목표"),
  paidGoal: z.coerce.number().int().min(0, "0명 이상으로 입력해 주세요.").max(1_000_000),
});

export const planInput = z.object({
  tier: z.enum(TIERS),
  name: text("플랜 이름", 20),
  price: won("가격"),
  summary: text("한 줄 설명", 80),
  perks: z
    .string()
    .transform((value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().max(60, "혜택 한 줄은 60자까지예요.")).min(1, "혜택을 한 줄 이상 적어 주세요.").max(8, "혜택은 8줄까지 적을 수 있어요.")),
});

// ---- public letter --------------------------------------------------------

export const signupInput = subscriberInput.extend({
  returnTo: z.preprocess(emptyToUndefined, z.string().regex(/^\/newsletter-community(\/[\w/-]*)?$/).optional()).catch(undefined),
});

export const issueNumberParam = z.coerce.number().int().min(1).max(100_000);
