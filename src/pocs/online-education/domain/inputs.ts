import { z } from "zod";
import { MAX_LESSON_SECONDS, parseDuration } from "./duration";
import { MINUTES_PER_SESSION, SESSIONS_PER_WEEK } from "./study-plan";

/** Validation for every mutation (FormData strings in, typed values out). Messages are user-facing Korean. */

const text = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label}을(를) 입력해 주세요.` })
    .trim()
    .min(min, { error: min <= 1 ? `${label}을(를) 입력해 주세요.` : `${label}은(는) ${min}자 이상 써 주세요.` })
    .max(max, { error: `${label}은(는) ${max}자까지 쓸 수 있어요.` });

const won = (label: string) =>
  z
    .string({ error: `${label}을(를) 입력해 주세요.` })
    .trim()
    .regex(/^[\d,]+$/, { error: `${label}은(는) 숫자로만 입력해 주세요.` })
    .transform((value) => Number(value.replaceAll(",", "")))
    .pipe(z.number().int().max(10_000_000, { error: `${label}은(는) 1,000만 원까지 입력할 수 있어요.` }));

const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const id = z.uuid({ error: "잘못된 요청이에요." });

const categories = ["programming", "design", "data", "marketing"] as const;
const colors = ["sky", "pink", "mint", "tangerine", "lavender", "tomato", "lime", "lemon"] as const;

const courseFields = z.object({
    title: text("강의 제목", 2, 80),
    description: text("강의 소개", 10, 600),
    category: z.enum(categories, { error: "카테고리를 골라 주세요." }),
    color: z.enum(colors, { error: "블록 색을 골라 주세요." }).optional(),
    listPrice: won("정가"),
    price: won("판매가"),
    outcomes: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      )
      .pipe(
        z
          .array(z.string().max(80, { error: "배울 내용 한 줄은 80자까지 쓸 수 있어요." }))
          .max(8, { error: "배울 내용은 8줄까지 쓸 수 있어요." }),
      ),
});

const priceNotAboveList = (input: { price: number; listPrice: number }) => input.price <= input.listPrice;
const priceIssue = { error: "판매가는 정가보다 높을 수 없어요.", path: ["price"] };

export const courseInput = courseFields.refine(priceNotAboveList, priceIssue);
export type CourseInput = z.infer<typeof courseInput>;

export const updateCourseInput = courseFields.extend({ courseId: id }).refine(priceNotAboveList, priceIssue);

export const courseStatusInput = z.object({ courseId: id, status: z.enum(["draft", "published"]) });

export const sectionInput = z.object({ courseId: id, title: text("섹션 제목", 1, 60) });
export const renameSectionInput = z.object({ sectionId: id, title: text("섹션 제목", 1, 60) });

const duration = z
  .string({ error: "레슨 길이를 입력해 주세요." })
  .trim()
  .transform((value, ctx) => {
    const seconds = parseDuration(value);
    if (seconds === null) {
      ctx.addIssue({
        code: "custom",
        message: `레슨 길이는 "12:30"(분:초)이나 "15"(분)처럼 ${MAX_LESSON_SECONDS / 3600}시간 이내로 적어 주세요.`,
      });
      return z.NEVER;
    }
    return seconds;
  });

export const lessonInput = z.object({
  sectionId: id,
  title: text("레슨 제목", 1, 80),
  type: z.enum(["video", "text", "quiz"], { error: "레슨 유형을 골라 주세요." }),
  duration,
  isPreview: checkbox,
});

export const updateLessonInput = lessonInput.extend({ lessonId: id });

export const moveInput = z.object({ id, direction: z.enum(["up", "down"]) });

export const learnerFields = {
  name: text("이름", 1, 30),
  email: z.email({ error: "이메일 주소를 확인해 주세요." }).max(120).transform((value) => value.toLowerCase()),
};

export const enrollInput = z.object({
  courseId: id,
  ...learnerFields,
  sessionsPerWeek: z.coerce.number().pipe(z.literal(SESSIONS_PER_WEEK, { error: "공부할 요일 수를 골라 주세요." })),
  minutesPerSession: z.coerce
    .number()
    .pipe(z.literal(MINUTES_PER_SESSION, { error: "하루 공부 시간을 골라 주세요." })),
});
export type EnrollInput = z.infer<typeof enrollInput>;

export const purchaseInput = z.object({ productId: id, ...learnerFields });
export type PurchaseInput = z.infer<typeof purchaseInput>;

export const productInput = z.object({
  title: text("상품명", 2, 80),
  type: z.enum(["notion", "pdf", "sheet"], { error: "상품 유형을 골라 주세요." }),
  description: text("상품 설명", 10, 400),
  price: won("가격"),
});
export type ProductInput = z.infer<typeof productInput>;

export const updateProductInput = productInput.extend({ productId: id });
export const productStatusInput = z.object({ productId: id, status: z.enum(["on_sale", "paused"]) });

export const planInput = z.object({
  plan: z.enum(["free", "basic", "pro"], { error: "요금제를 골라 주세요." }),
  billing: z.enum(["monthly", "yearly"], { error: "결제 주기를 골라 주세요." }),
});

export const schoolInput = z.object({
  name: text("스쿨 이름", 2, 40),
  creatorName: text("강사 이름", 1, 20),
});

export const idInput = z.object({ id });
