import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone } from "./phone";
import { planById, usageAgainst } from "./plans";
import { nextStamps, stampTilt } from "./status";
import { onlineBookingSchema, serviceSchema, shopSchema } from "./validation";

describe("phone numbers", () => {
  it("normalises mobile and Seoul numbers", () => {
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
    expect(formatPhone("010 123 4567")).toBe("010-123-4567");
    expect(formatPhone("0212345678")).toBe("02-1234-5678");
    expect(isValidPhone("010-1234-5678")).toBe(true);
    expect(isValidPhone("010-123")).toBe(false);
    expect(isValidPhone("1234567890")).toBe(false);
  });
});

describe("input schemas", () => {
  const serviceId = "3f8b4c1e-2a7d-4e59-9c1a-0b2d3e4f5a6b";

  it("parses the public booking form into minutes and a normalised phone", () => {
    const parsed = onlineBookingSchema.parse({
      serviceId,
      date: "2026-09-25",
      time: "14:30",
      name: "  김미영 ",
      phone: "01012345678",
    });
    expect(parsed).toEqual({ serviceId, date: "2026-09-25", time: 870, name: "김미영", phone: "010-1234-5678", memo: "" });
  });

  it("rejects off-grid times, bad dates and bad phones with Korean messages", () => {
    const result = onlineBookingSchema.safeParse({ serviceId, date: "2026-02-30", time: "14:15", name: "", phone: "123" });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((i) => i.path[0]);
    expect(fields).toEqual(expect.arrayContaining(["date", "time", "name", "phone"]));
    expect(result.error?.issues.find((i) => i.path[0] === "time")?.message).toBe("시간을 30분 단위로 골라 주세요.");
    const blank = onlineBookingSchema.safeParse({ serviceId, date: "2026-09-25", time: "", name: "김", phone: "01012345678" });
    expect(blank.error?.issues.map((i) => i.message)).toEqual(["시간을 골라 주세요."]);
  });

  it("reads shop hours, seats and closed weekdays from form fields", () => {
    const parsed = shopSchema.parse({
      name: "뷰티헤어살롱",
      category: "미용실",
      ownerName: "김사장",
      phone: "0212345678",
      address: "서울시 강남구",
      openTime: "10:00",
      closeTime: "20:30",
      seats: "2",
      closedWeekdays: ["1", "0", "1"],
    });
    expect(parsed).toMatchObject({ openMinute: 600, closeMinute: 1230, seats: 2, closedWeekdays: [0, 1], cancelPolicy: "" });
    const shut = shopSchema.safeParse({ ...parsed, openTime: "10:00", closeTime: "10:30", seats: "1", closedWeekdays: "3" });
    expect(shut.error?.issues[0]).toMatchObject({ path: ["closeTime"] });
  });

  it("accepts prices typed with commas and refuses blanks", () => {
    expect(serviceSchema.parse({ name: "커트", durationMinutes: "30", price: "15,000" })).toEqual({
      name: "커트",
      durationMinutes: 30,
      price: 15_000,
    });
    expect(serviceSchema.safeParse({ name: "커트", durationMinutes: "30", price: "" }).success).toBe(false);
  });
});

describe("stamps and plans", () => {
  it("offers the stamps each status can take", () => {
    expect(nextStamps("pending")).toEqual(["confirmed", "cancelled"]);
    expect(nextStamps("confirmed")).toEqual(["cancelled"]);
    expect(nextStamps("cancelled")).toEqual(["pending"]);
  });

  it("tilts a stamp the same way every time, within range", () => {
    const tilt = stampTilt("0b6f3c2e-booking");
    expect(tilt).toBe(stampTilt("0b6f3c2e-booking"));
    expect(Math.abs(tilt)).toBeLessThanOrEqual(9);
  });

  it("measures real usage against a plan's limits", () => {
    expect(usageAgainst(planById("free"), { monthlyBookings: 42, customers: 16 })).toEqual([
      { label: "이번 달 예약", used: 42, limit: 30, over: true },
      { label: "등록 고객", used: 16, limit: 50, over: false },
    ]);
    expect(usageAgainst(planById("business"), { monthlyBookings: 42, customers: 16 }).every((l) => !l.over)).toBe(true);
  });
});
