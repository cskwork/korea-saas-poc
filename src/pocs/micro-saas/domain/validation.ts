import { z } from "zod";
import { formatPhone, isValidPhone } from "./phone";
import { SLOT_MINUTES, isDateKey, parseTime } from "./time";

/** Input schemas shared by server actions (and their tests). Messages are user-facing Korean. */

export const idSchema = z.uuid({ error: "잘못된 요청이에요." });

const trimmed = (label: string, max: number) =>
  z
    .string({ error: `${label}을(를) 입력해 주세요.` })
    .trim()
    .min(1, `${label}을(를) 입력해 주세요.`)
    .max(max, `${label}은(는) ${max}자까지 입력할 수 있어요.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자까지 입력할 수 있어요.`)
    .optional()
    .transform((v) => v ?? "");

export const customerNameSchema = z
  .string({ error: "이름을 입력해 주세요." })
  .trim()
  .min(1, "이름을 입력해 주세요.")
  .max(20, "이름은 20자까지 입력할 수 있어요.");

export const phoneSchema = z
  .string({ error: "연락처를 입력해 주세요." })
  .trim()
  .min(1, "연락처를 입력해 주세요.")
  .refine(isValidPhone, "연락처 형식을 확인해 주세요. 예: 010-1234-5678")
  .transform(formatPhone);

export const dateSchema = z.string({ error: "날짜를 골라 주세요." }).refine(isDateKey, "날짜를 골라 주세요.");

/** "14:30" → 870, on the 30-minute grid. */
export const slotTimeSchema = z
  .string({ error: "시간을 골라 주세요." })
  .min(1, "시간을 골라 주세요.")
  .transform((value, ctx) => {
    const minute = parseTime(value);
    if (minute === null || minute % SLOT_MINUTES !== 0) {
      ctx.addIssue({ code: "custom", message: "시간을 30분 단위로 골라 주세요." });
      return z.NEVER;
    }
    return minute;
  });

/** Number inputs: blank means missing; "15,000원" means 15000. */
const numeric = (label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.replace(/[,\s원₩분]/g, "") || undefined : v),
    z.coerce.number({ error: `${label}을(를) 숫자로 입력해 주세요.` }),
  );

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const statusSchema = z.enum(["pending", "confirmed", "cancelled"], { error: "상태를 골라 주세요." });

export const ownerBookingSchema = z.object({
  customerName: customerNameSchema,
  customerPhone: phoneSchema,
  date: dateSchema,
  time: slotTimeSchema,
  serviceId: z.uuid({ error: "서비스를 골라 주세요." }),
  status: z.enum(["pending", "confirmed"], { error: "상태를 골라 주세요." }),
  memo: optionalText(200),
  allowOverlap: checkbox,
});
export type OwnerBookingInput = z.infer<typeof ownerBookingSchema>;

export const bookingUpdateSchema = z.object({
  id: idSchema,
  date: dateSchema,
  time: slotTimeSchema,
  /** Blank keeps the booked service (also when that service was deleted since). */
  serviceId: z
    .union([z.uuid({ error: "서비스를 골라 주세요." }), z.literal("")])
    .optional()
    .transform((v) => v || null),
  memo: optionalText(200),
  allowOverlap: checkbox,
});
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;

export const statusChangeSchema = z.object({ id: idSchema, status: statusSchema });
export type StatusChangeInput = z.infer<typeof statusChangeSchema>;

export const onlineBookingSchema = z.object({
  serviceId: z.uuid({ error: "서비스를 골라 주세요." }),
  date: dateSchema,
  time: slotTimeSchema,
  name: customerNameSchema,
  phone: phoneSchema,
  memo: optionalText(200),
});
export type OnlineBookingInput = z.infer<typeof onlineBookingSchema>;

export const customerSchema = z.object({
  name: customerNameSchema,
  phone: phoneSchema,
  memo: optionalText(300),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const customerUpdateSchema = customerSchema.extend({ id: idSchema });

const hourSchema = (label: string) =>
  z.string({ error: `${label}을 골라 주세요.` }).transform((value, ctx) => {
    const minute = parseTime(value);
    if (minute === null || minute % SLOT_MINUTES !== 0) {
      ctx.addIssue({ code: "custom", message: `${label}을 30분 단위로 골라 주세요.` });
      return z.NEVER;
    }
    return minute;
  });

const weekdays = z.preprocess(
  (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]),
  z.array(z.coerce.number().int().min(0).max(6)).max(6, "적어도 하루는 문을 열어야 해요."),
);

export const shopSchema = z
  .object({
    name: trimmed("상호", 30),
    category: trimmed("업종", 20),
    ownerName: trimmed("대표자 이름", 20),
    phone: phoneSchema,
    address: trimmed("주소", 80),
    openTime: hourSchema("여는 시간"),
    closeTime: hourSchema("닫는 시간"),
    seats: numeric("좌석 수").pipe(
      z
        .number()
        .int("좌석 수는 정수로 입력해 주세요.")
        .min(1, "좌석은 1개 이상이어야 해요.")
        .max(20, "좌석은 20개까지 설정할 수 있어요."),
    ),
    closedWeekdays: weekdays,
    cancelPolicy: optionalText(80),
  })
  .refine((v) => v.closeTime - v.openTime >= 60, {
    path: ["closeTime"],
    message: "닫는 시간은 여는 시간보다 1시간 이상 늦어야 해요.",
  })
  .transform(({ openTime, closeTime, closedWeekdays, ...rest }) => ({
    ...rest,
    openMinute: openTime,
    closeMinute: closeTime,
    closedWeekdays: [...new Set(closedWeekdays)].sort(),
  }));
export type ShopInput = z.infer<typeof shopSchema>;

export const serviceSchema = z.object({
  name: trimmed("서비스 이름", 20),
  durationMinutes: numeric("소요 시간").pipe(
    z
      .number()
      .int("소요 시간은 분 단위 정수로 입력해 주세요.")
      .min(10, "소요 시간은 10분 이상이어야 해요.")
      .max(480, "소요 시간은 8시간(480분)까지 입력할 수 있어요."),
  ),
  price: numeric("가격").pipe(
    z
      .number()
      .int("가격은 원 단위 정수로 입력해 주세요.")
      .min(0, "가격은 0원 이상이어야 해요.")
      .max(5_000_000, "가격은 500만 원까지 입력할 수 있어요."),
  ),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const serviceUpdateSchema = serviceSchema.extend({ id: idSchema, active: checkbox });

export const planSchema = z.object({ plan: z.enum(["free", "pro", "business"], { error: "요금제를 골라 주세요." }) });
