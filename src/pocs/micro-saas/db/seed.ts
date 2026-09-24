import type { Database } from "@/core/db/connection";
import { occupancy } from "../domain/availability";
import { SLOT_MINUTES, addDays, seoulClock, slotSpan, slotStarts, weekdayOf, type Clock } from "../domain/time";
import {
  bookings,
  customers,
  services,
  shops,
  type BookingSource,
  type BookingStatus,
  type MicroSaasSchema,
} from "./schema";

/**
 * Sample shop for a new workspace: a two-chair hair salon with eight weeks of history and
 * two weeks ahead, laid out around "today" in Asia/Seoul so the book looks alive on any date.
 * Every name, phone number and booking is synthetic and labelled as sample in the UI.
 */

type NewShop = typeof shops.$inferInsert;
type NewService = typeof services.$inferInsert & { id: string };
type NewCustomer = typeof customers.$inferInsert & { id: string };
type NewBooking = typeof bookings.$inferInsert;

const OPEN = 10 * 60;
const CLOSE = 20 * 60;
const SEATS = 2;

const SERVICES = [
  { name: "커트", durationMinutes: 30, price: 15_000, weight: 5 },
  { name: "펌", durationMinutes: 120, price: 50_000, weight: 2 },
  { name: "염색", durationMinutes: 90, price: 40_000, weight: 2 },
  { name: "클리닉", durationMinutes: 60, price: 30_000, weight: 2 },
  { name: "드라이", durationMinutes: 20, price: 10_000, weight: 1 },
] as const;

const CUSTOMERS: readonly (readonly [name: string, memo: string])[] = [
  ["김미영", "두피가 예민해요. 저자극 약제 사용"],
  ["이수진", ""],
  ["박지현", "앞머리는 눈썹 길이로"],
  ["최윤아", ""],
  ["정다은", "뿌리 염색 주기 6주"],
  ["한소희", ""],
  ["오세진", "주차 필요"],
  ["윤서연", ""],
  ["강지윤", "지난번과 같은 컬로"],
  ["임하늘", ""],
  ["조민지", ""],
  ["신예린", "아이와 함께 방문"],
  ["배준호", ""],
  ["문가영", ""],
  ["송태민", "투블럭 유지"],
  ["홍지아", ""],
  ["서지우", ""],
  ["권나연", "손상모, 열 기구 약하게"],
  ["황보람", ""],
  ["안유진", ""],
  ["류하은", ""],
  ["전소민", "예약 전날 문자 선호"],
  ["고은비", ""],
  ["남궁현", ""],
  ["양채원", ""],
  ["백승아", ""],
  ["허다인", ""],
  ["노지훈", ""],
  ["곽민서", ""],
  ["성예준", "학생"],
  ["차은서", ""],
  ["주하린", ""],
];

/** Synthetic, unique 010 numbers (the first few match the POC's sample numbers). */
const POC_PHONES = ["010-1234-5678", "010-2345-6789", "010-3456-7890", "010-4567-8901", "010-5678-9012", "010-6789-0123"];
const samplePhone = (i: number) =>
  POC_PHONES[i] ?? `010-${String(2000 + i * 173).padStart(4, "0")}-${String(3000 + ((i * 7919) % 6000)).padStart(4, "0")}`;

const MEMOS = ["", "", "", "", "", "뿌리 염색만", "지난번과 같은 스타일로", "시간 맞춰 올게요", "주차 문의", "상한 끝만 정리"];

/** Small deterministic PRNG (mulberry32) so every workspace gets the same, stable sample book. */
function random(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]) => items[int(0, items.length - 1)];
  const weighted = <T extends { weight: number }>(items: readonly T[]) => {
    let roll = next() * items.reduce((sum, i) => sum + i.weight, 0);
    for (const item of items) {
      roll -= item.weight;
      if (roll < 0) return item;
    }
    return items[items.length - 1];
  };
  return { next, int, pick, weighted };
}

/** Monday off, unless today is Monday (then Tuesday), so the sample book always opens on "today". */
export function sampleClosedWeekdays(today: string): number[] {
  return [weekdayOf(today) === 1 ? 2 : 1];
}

export interface SeedRows {
  shop: NewShop;
  services: NewService[];
  customers: NewCustomer[];
  bookings: NewBooking[];
}

export function buildSeedRows(workspaceId: string, clock: Clock = seoulClock()): SeedRows {
  const rng = random(20260924);
  const today = clock.date;
  const closedWeekdays = sampleClosedWeekdays(today);

  const serviceRows: (NewService & { weight: number })[] = SERVICES.map((s, position) => ({
    ...s,
    id: crypto.randomUUID(),
    workspaceId,
    position,
    active: true,
  }));
  const customerRows: NewCustomer[] = CUSTOMERS.map(([name, memo], i) => ({
    id: crypto.randomUUID(),
    workspaceId,
    name,
    phone: samplePhone(i),
    memo,
  }));
  // Regulars first: the first customers come back more often.
  const customerWeights = customerRows.map((c, i) => ({ ...c, weight: i < 8 ? 3 : i < 20 ? 2 : 1 }));

  const bookingRows: NewBooking[] = [];
  const add = (date: string, start: number, status: BookingStatus, source: BookingSource) => {
    const { weight: _w, ...service } = rng.weighted(serviceRows);
    const customer = rng.weighted(customerWeights);
    const counts = occupancy(
      bookingRows
        .filter((b) => b.date === date)
        .map((b, i) => ({
          id: String(i),
          startMinute: b.startMinute,
          durationMinutes: b.durationMinutes,
          status: b.status ?? "pending",
        })),
    );
    const span = slotSpan(service.durationMinutes);
    const fits =
      start + service.durationMinutes <= CLOSE &&
      Array.from({ length: span }, (_, i) => counts.get(start + i * SLOT_MINUTES) ?? 0).every((n) => n < SEATS);
    if (!fits) return false;
    bookingRows.push({
      workspaceId,
      customerId: customer.id,
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
      date,
      startMinute: start,
      status,
      source,
      memo: rng.pick(MEMOS),
    });
    return true;
  };

  const starts = slotStarts(OPEN, CLOSE);
  for (let offset = -56; offset <= 14; offset++) {
    const date = addDays(today, offset);
    if (closedWeekdays.includes(weekdayOf(date))) continue;

    if (offset === 0) {
      // Today: a readable book with gaps, two bookings waiting for a stamp and one cancellation.
      const plan: [number, BookingStatus, BookingSource][] = [
        [10 * 60, "confirmed", "owner"],
        [11 * 60, "confirmed", "online"],
        [11 * 60 + 30, "cancelled", "owner"],
        [13 * 60, "confirmed", "owner"],
        [15 * 60, "confirmed", "owner"],
        [16 * 60 + 30, "pending", "online"],
        [18 * 60, "confirmed", "owner"],
        [19 * 60, "pending", "online"],
      ];
      for (const [start, status, source] of plan) {
        for (let attempt = 0; attempt < 6 && !add(date, start, status, source); attempt++);
      }
      continue;
    }

    const weekend = [0, 6].includes(weekdayOf(date));
    const wanted = offset < 0 ? rng.int(weekend ? 4 : 2, weekend ? 7 : 5) : offset <= 3 ? rng.int(1, 4) : rng.int(0, 3);
    for (let placed = 0, attempt = 0; placed < wanted && attempt < 40; attempt++) {
      const status: BookingStatus =
        offset < 0
          ? rng.next() < 0.08
            ? "cancelled"
            : "confirmed"
          : rng.next() < 0.55
            ? "confirmed"
            : rng.next() < 0.8
              ? "pending"
              : "cancelled";
      const source: BookingSource = rng.next() < (status === "pending" ? 0.7 : 0.3) ? "online" : "owner";
      if (add(date, rng.pick(starts), status, source)) placed++;
    }
  }

  return {
    shop: {
      workspaceId,
      name: "뷰티헤어살롱",
      category: "미용실",
      ownerName: "김사장",
      phone: "02-1234-5678",
      address: "서울시 강남구 역삼동 123-45",
      openMinute: OPEN,
      closeMinute: CLOSE,
      seats: SEATS,
      closedWeekdays,
      cancelPolicy: "변경·취소는 방문 1시간 전까지 가능합니다.",
      plan: "pro",
    },
    services: serviceRows.map(({ weight: _w, ...s }) => s),
    customers: customerRows,
    bookings: bookingRows,
  };
}

export async function seedMicroSaas(db: Database<MicroSaasSchema>, workspaceId: string): Promise<void> {
  const rows = buildSeedRows(workspaceId);
  await db.insert(shops).values(rows.shop);
  await db.insert(services).values(rows.services);
  await db.insert(customers).values(rows.customers);
  for (let i = 0; i < rows.bookings.length; i += 200) {
    await db.insert(bookings).values(rows.bookings.slice(i, i + 200));
  }
}
