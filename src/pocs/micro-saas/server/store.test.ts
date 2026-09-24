import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { bookings, customers, schema, services, type MicroSaasSchema } from "../db/schema";
import { addDays, seoulClock, weekdayOf } from "../domain/time";
import { ownerBookingSchema, serviceSchema, shopSchema } from "../domain/validation";
import { microSaasModule } from "../module";
import {
  SlotUnavailableError,
  bookingsOn,
  createOnlineBooking,
  createOwnerBooking,
  findBooking,
  setBookingStatus,
  updateBooking,
} from "./store/bookings";
import { deleteCustomer, listCustomers } from "./store/customers";
import { createService, deleteService, findShop, listServices, updateService, updateShop } from "./store/shop";

describe("micro-saas store (PGlite)", () => {
  let t: TestDatabase<MicroSaasSchema>;
  const today = seoulClock().date;
  const clock = { date: today, minute: 0 };
  /** An open weekday beyond the seeded two weeks, so tests start from an empty day. */
  let day: string;
  let cut: { id: string; durationMinutes: number };
  let perm: { id: string };

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedModuleIfNeeded(t.db, microSaasModule, t.workspaceId);
    const shop = await findShop(t.db, t.workspaceId);
    day = addDays(today, 30);
    while (shop.closedWeekdays.includes(weekdayOf(day))) day = addDays(day, 1);
    const list = await listServices(t.db, t.workspaceId);
    cut = list.find((s) => s.name === "커트")!;
    perm = list.find((s) => s.name === "펌")!;
    // One chair from here on, so a single booking fills a slot.
    await updateShop(
      t.db,
      t.workspaceId,
      shopSchema.parse({ ...shop, openTime: "10:00", closeTime: "20:00", seats: "1", closedWeekdays: shop.closedWeekdays.map(String) }),
    );
  });
  afterAll(() => t.close());

  const online = (overrides: Partial<Parameters<typeof createOnlineBooking>[2]> = {}) =>
    createOnlineBooking(
      t.db,
      t.workspaceId,
      { serviceId: cut.id, date: day, time: 14 * 60, name: "테스트", phone: "010-9000-0001", memo: "", ...overrides },
      clock,
    );

  it("seeds a sample shop with a live book around today", async () => {
    const shop = await findShop(t.db, t.workspaceId);
    expect(shop).toMatchObject({ name: "뷰티헤어살롱", openMinute: 600, closeMinute: 1200 });
    expect(shop.closedWeekdays).not.toContain(weekdayOf(today));
    const todays = await bookingsOn(t.db, t.workspaceId, today);
    expect(todays.length).toBeGreaterThanOrEqual(6);
    expect(todays.some((b) => b.status === "pending")).toBe(true);
    expect(todays.some((b) => b.status === "cancelled")).toBe(true);
    const all = await t.db.select().from(bookings).where(eq(bookings.workspaceId, t.workspaceId));
    expect(all.length).toBeGreaterThan(150);
  });

  it("books a free slot online as 대기 and refuses the same slot twice", async () => {
    const first = await online();
    expect(await findBooking(t.db, t.workspaceId, first.id)).toMatchObject({ status: "pending", source: "online", date: day });
    await expect(online({ phone: "010-9000-0002" })).rejects.toBeInstanceOf(SlotUnavailableError);
    // A 120-minute perm starting at 13:00 would run into the 14:00 booking.
    await expect(online({ serviceId: perm.id, time: 13 * 60, phone: "010-9000-0003" })).rejects.toThrow(/마감/);
    // Cancelling frees the slot again.
    await setBookingStatus(t.db, t.workspaceId, first.id, "cancelled");
    await expect(online({ phone: "010-9000-0002" })).resolves.toHaveProperty("id");
  });

  it("serves exactly one of two customers racing for the last seat", async () => {
    const results = await Promise.allSettled([
      online({ time: 16 * 60, phone: "010-9000-0011" }),
      online({ time: 16 * 60, phone: "010-9000-0012" }),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });

  it("refuses past, closed-day and after-hours slots online", async () => {
    const shop = await findShop(t.db, t.workspaceId);
    let closed = addDays(today, 30);
    while (!shop.closedWeekdays.includes(weekdayOf(closed))) closed = addDays(closed, 1);
    await expect(online({ date: closed })).rejects.toThrow("휴무일");
    await expect(online({ time: 19 * 60 + 30, serviceId: perm.id })).rejects.toThrow("영업시간");
    await expect(
      createOnlineBooking(
        t.db,
        t.workspaceId,
        { serviceId: cut.id, date: today, time: 10 * 60, name: "늦은 손님", phone: "010-9000-0020", memo: "" },
        { date: today, minute: 11 * 60 },
      ),
    ).rejects.toThrow("지난 시간");
  });

  it("lets the owner book over a full slot only on purpose", async () => {
    const input = ownerBookingSchema.parse({
      customerName: "전화 손님",
      customerPhone: "010-9000-0030",
      date: day,
      time: "16:00",
      serviceId: cut.id,
      status: "confirmed",
    });
    await expect(createOwnerBooking(t.db, t.workspaceId, input)).rejects.toThrow("겹쳐도 저장");
    const { id } = await createOwnerBooking(t.db, t.workspaceId, { ...input, allowOverlap: true });
    expect(await findBooking(t.db, t.workspaceId, id)).toMatchObject({ status: "confirmed", source: "owner" });
    // Moving it to a free slot needs no override.
    await updateBooking(t.db, t.workspaceId, { id, date: day, time: 17 * 60, serviceId: null, memo: "옮김", allowOverlap: false });
    expect(await findBooking(t.db, t.workspaceId, id)).toMatchObject({ startMinute: 17 * 60, memo: "옮김", price: 15_000 });
  });

  it("keeps one customer per phone; only the owner renames", async () => {
    await online({ time: 11 * 60, phone: "010-1234-5678", name: "다른 이름" });
    const [kim] = await listCustomers(t.db, t.workspaceId, { query: "1234-5678", clock });
    expect(kim).toMatchObject({ name: "김미영", phone: "010-1234-5678" });
    expect(kim.visits).toBeGreaterThan(0);
    expect(kim.nextVisit).not.toBeNull();
    const byName = await listCustomers(t.db, t.workspaceId, { query: "미영", clock });
    expect(byName.map((c) => c.id)).toEqual([kim.id]);
  });

  it("adds, pauses and edits services; paused ones leave the booking page", async () => {
    const spa = await createService(t.db, t.workspaceId, serviceSchema.parse({ name: "두피 스파", durationMinutes: "50", price: "35,000" }));
    expect(spa).toMatchObject({ price: 35_000, durationMinutes: 50, active: true, position: 5 });
    await updateService(t.db, t.workspaceId, spa.id, { name: "두피 스파", durationMinutes: 60, price: 38_000, active: false });
    const offered = await listServices(t.db, t.workspaceId, { activeOnly: true });
    expect(offered.map((s) => s.name)).not.toContain("두피 스파");
    await expect(online({ serviceId: spa.id, time: 15 * 60, phone: "010-9000-0050" })).rejects.toThrow("예약을 받지 않는");
    const other = await t.createWorkspace();
    await expect(updateService(t.db, other, spa.id, { name: "탈취", durationMinutes: 30, price: 0, active: true })).rejects.toBeInstanceOf(
      UserError,
    );
  });

  it("keeps a deleted service's name and price on past bookings", async () => {
    const dry = (await listServices(t.db, t.workspaceId)).find((s) => s.name === "드라이")!;
    await deleteService(t.db, t.workspaceId, dry.id);
    const orphaned = await t.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.workspaceId, t.workspaceId), eq(bookings.serviceName, "드라이")));
    expect(orphaned.length).toBeGreaterThan(0);
    expect(orphaned.every((b) => b.serviceId === null && b.price === 10_000)).toBe(true);
  });

  it("isolates workspaces: other tenants' ids are not found and their bookings do not block", async () => {
    const other = await t.createWorkspace();
    await seedModuleIfNeeded(t.db, microSaasModule, other);
    const otherCut = (await listServices(t.db, other)).find((s) => s.name === "커트")!;
    const theirs = await createOnlineBooking(
      t.db,
      other,
      { serviceId: otherCut.id, date: day, time: 18 * 60, name: "옆 가게 손님", phone: "010-9000-0040", memo: "" },
      clock,
    );
    expect(await findBooking(t.db, t.workspaceId, theirs.id)).toBeUndefined();
    await expect(setBookingStatus(t.db, t.workspaceId, theirs.id, "cancelled")).rejects.toBeInstanceOf(UserError);
    await expect(online({ time: 18 * 60, phone: "010-9000-0041" })).resolves.toHaveProperty("id");
    // Another shop's service id cannot be booked here.
    await expect(online({ serviceId: otherCut.id, time: 12 * 60 })).rejects.toThrow("서비스를 찾을 수 없어요");
  });

  it("deletes a customer together with their bookings", async () => {
    const [target] = await listCustomers(t.db, t.workspaceId, { query: "테스트", clock });
    const result = await deleteCustomer(t.db, t.workspaceId, target.id);
    expect(result.bookings).toBeGreaterThan(0);
    const left = await t.db.select().from(bookings).where(eq(bookings.customerId, target.id));
    expect(left).toEqual([]);
  });

  it("resets to the sample shop without touching other workspaces", async () => {
    await resetModule(t.db, microSaasModule, t.workspaceId);
    const shop = await findShop(t.db, t.workspaceId);
    expect(shop.seats).toBe(2);
    const names = (await listServices(t.db, t.workspaceId)).map((s) => s.name);
    expect(names).toEqual(["커트", "펌", "염색", "클리닉", "드라이"]);
    const strays = await t.db
      .select()
      .from(customers)
      .where(and(eq(customers.workspaceId, t.workspaceId), eq(customers.phone, "010-9000-0030")));
    expect(strays).toEqual([]);
    expect((await t.db.select().from(services)).length).toBe(10);
  });
});
