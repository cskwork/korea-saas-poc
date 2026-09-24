import { seoulDateKey } from "@/core/format";
import { addDays, seoulDayStart } from "../domain/analytics";
import { SUPPLIER_LABEL, feeRateBp } from "../domain/categories";
import { templateListingCopy } from "../domain/listing-copy";
import { COURIERS, makeOrderNumber, sampleTrackingNumber, type OrderStatus } from "../domain/orders";
import { createRandom, stableHash, type Random } from "../domain/random";
import {
  CATALOG,
  CUSTOMER_NAMES,
  KEYWORD_HEADS,
  LISTED,
  REGIONS,
  SAMPLE_CALCULATIONS,
  SAVED_KEYWORDS,
} from "./seed-data";
import { calculations, catalogItems, keywordStats, listings, orders, savedKeywords } from "./schema";
import type { SmartStoreDb } from "./types";

/** Days of order history seeded (enough to compare a 30-day period with the one before). */
export const HISTORY_DAYS = 60;

const HOUR = 3_600_000;

/**
 * Seeds a workspace with sample data relative to `now` (Asia/Seoul days), so
 * the dashboards look alive on any date. Deterministic for a given day.
 */
export async function seedSmartStore(db: SmartStoreDb, workspaceId: string, now: Date = new Date()): Promise<void> {
  const todayKey = seoulDateKey(now);
  const random = createRandom(stableHash(`smart-store|${todayKey}`));

  const items = await db
    .insert(catalogItems)
    .values(
      CATALOG.map((item, i) => ({
        ...item,
        workspaceId,
        createdAt: new Date(now.getTime() - (CATALOG.length - i) * 6 * HOUR),
      })),
    )
    .returning();
  const itemByCode = new Map(items.map((item) => [item.code, item]));

  const listedRows = await db
    .insert(listings)
    .values(
      LISTED.map((entry, i) => {
        const item = itemByCode.get(entry.code)!;
        const copy = templateListingCopy({
          name: item.name,
          category: item.category,
          supplierLabel: SUPPLIER_LABEL[item.supplier],
          options: item.options,
          leadDays: item.leadDays,
        });
        const createdAt = new Date(seoulDayStart(addDays(todayKey, -(HISTORY_DAYS + 5 - i))).getTime() + 10 * HOUR);
        return {
          workspaceId,
          catalogItemId: item.id,
          originalName: item.name,
          ...copy,
          category: item.category,
          supplier: item.supplier,
          cost: item.wholesalePrice,
          price: entry.price,
          shippingCost: item.shippingCost,
          status: entry.status,
          copySource: "template" as const,
          createdAt,
          updatedAt: createdAt,
        };
      }),
    )
    .returning();

  const weightById = new Map(
    listedRows.map((row) => {
      const code = items.find((item) => item.id === row.catalogItemId)?.code;
      return [row.id, LISTED.find((entry) => entry.code === code)?.weight ?? 1] as const;
    }),
  );
  await db.insert(orders).values(sampleOrders(listedRows, weightById, workspaceId, todayKey, now, random));

  await db.insert(calculations).values(
    SAMPLE_CALCULATIONS.map((calc, i) => ({
      ...calc,
      workspaceId,
      createdAt: new Date(now.getTime() - (i + 1) * 26 * HOUR),
    })),
  );

  await db.insert(keywordStats).values(sampleKeywords(workspaceId));
  await db.insert(savedKeywords).values(
    SAVED_KEYWORDS.map((keyword, i) => ({
      workspaceId,
      keyword,
      createdAt: new Date(now.getTime() - (i + 1) * 30 * HOUR),
    })),
  );
}

type ListingRow = typeof listings.$inferSelect;
type OrderInsert = typeof orders.$inferInsert;

function sampleOrders(
  rows: ListingRow[],
  weightById: Map<string, number>,
  workspaceId: string,
  todayKey: string,
  now: Date,
  random: Random,
): OrderInsert[] {
  const result: OrderInsert[] = [];
  const usedNumbers = new Set<string>();

  for (let daysAgo = HISTORY_DAYS - 1; daysAgo >= 0; daysAgo -= 1) {
    const dayKey = addDays(todayKey, -daysAgo);
    const dayStart = seoulDayStart(dayKey).getTime();
    const minutesSinceDayStart = Math.max(0, Math.floor((now.getTime() - dayStart) / 60_000));
    const weekday = new Date(`${dayKey}T12:00:00+09:00`).getUTCDay();
    // Slow growth toward today, busier Sundays and Mondays, some noise.
    const growth = ((HISTORY_DAYS - daysAgo) / HISTORY_DAYS) * 3;
    const weekend = weekday === 0 || weekday === 1 ? 1.5 : 0;
    const count = daysAgo === 0 ? 5 : Math.max(1, Math.round(3 + growth + weekend + random.int(-2, 2)));

    for (let n = 0; n < count; n += 1) {
      // Today's orders land in the last 6 hours but never before Seoul midnight (so they stay
      // "today" at any hour); earlier days 07:00–23:59.
      const orderedMs =
        daysAgo === 0
          ? now.getTime() - random.int(Math.min(5, minutesSinceDayStart), Math.min(360, minutesSinceDayStart)) * 60_000
          : dayStart + 7 * HOUR + random.int(0, 17 * 60 - 1) * 60_000;
      const orderedAt = new Date(orderedMs);
      const available = rows.filter((row) => row.status === "selling" || daysAgo > 14);
      const listing = random.weighted(
        available,
        available.map((row) => weightById.get(row.id) ?? 1),
      );
      const quantity = random.weighted([1, 2, 3], [70, 22, 8]);
      const status = sampleStatus(daysAgo, random);
      let orderNo = makeOrderNumber(seoulDateKey(orderedAt), random.next());
      while (usedNumbers.has(orderNo)) orderNo = makeOrderNumber(seoulDateKey(orderedAt), random.next());
      usedNumbers.add(orderNo);

      result.push({
        workspaceId,
        orderNo,
        listingId: listing.id,
        productName: listing.title,
        category: listing.category,
        customerName: random.pick(CUSTOMER_NAMES),
        region: random.pick(REGIONS),
        quantity,
        unitPrice: listing.price,
        unitCost: listing.cost,
        shippingCost: listing.shippingCost,
        feeRateBp: feeRateBp(listing.category),
        orderedAt,
        ...statusTimeline(status, orderedAt, now, random),
      });
    }
  }
  return result;
}

function sampleStatus(daysAgo: number, random: Random): OrderStatus {
  if (daysAgo === 0) return "new";
  if (daysAgo === 1) return random.weighted(["new", "confirmed", "shipping", "cancelled"] as const, [22, 38, 36, 4]);
  if (daysAgo <= 3) return random.weighted(["shipping", "delivered", "cancelled"] as const, [65, 32, 3]);
  return random.weighted(["delivered", "cancelled"] as const, [95, 5]);
}

function statusTimeline(status: OrderStatus, orderedAt: Date, now: Date, random: Random): Partial<OrderInsert> {
  const cap = (ms: number) => new Date(Math.min(ms, now.getTime() - 60_000));
  const confirmedAt = cap(orderedAt.getTime() + random.int(1, 6) * HOUR);
  const shippedAt = cap(confirmedAt.getTime() + random.int(8, 26) * HOUR);
  const deliveredAt = cap(shippedAt.getTime() + random.int(20, 44) * HOUR);
  const tracking = () => ({ courier: random.pick(COURIERS), trackingNumber: sampleTrackingNumber(random.next()) });

  switch (status) {
    case "new":
      return { status };
    case "confirmed":
      return { status, confirmedAt };
    case "shipping":
      return { status, confirmedAt, shippedAt, ...tracking() };
    case "delivered":
      return { status, confirmedAt, shippedAt, deliveredAt, ...tracking() };
    case "cancelled":
      return { status, cancelledAt: cap(orderedAt.getTime() + random.int(1, 10) * HOUR) };
  }
}

function sampleKeywords(workspaceId: string) {
  const competitions = ["low", "medium", "high"] as const;
  const trends = ["rising", "steady", "falling", "seasonal"] as const;
  return KEYWORD_HEADS.flatMap((head) => [
    {
      workspaceId,
      keyword: head.keyword,
      headKeyword: head.keyword,
      category: head.category,
      monthlyVolume: head.monthlyVolume,
      competition: head.competition,
      trend: head.trend,
    },
    ...head.related.map((keyword) => {
      // Related keywords get stable pseudo-metrics derived from their text: 4–60% of the head's volume.
      const hash = stableHash(keyword);
      const ratio = 0.04 + ((hash % 1000) / 1000) * 0.56;
      return {
        workspaceId,
        keyword,
        headKeyword: head.keyword,
        category: head.category,
        monthlyVolume: Math.round((head.monthlyVolume * ratio) / 10) * 10,
        competition: competitions[(hash >>> 10) % competitions.length],
        trend: trends[(hash >>> 14) % trends.length],
      };
    }),
  ]);
}
