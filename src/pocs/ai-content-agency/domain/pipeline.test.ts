import { describe, expect, it } from "vitest";
import { addBusinessDays, addDays, daysBetween, isDateKey, longDate, monthRange, startOfWeek, weekdayIndex } from "./dates";
import { canMove, dueState, nextStatus, orderCode, previousStatus } from "./pipeline";
import { PLANS, checkOrderAllowance, planPriceLabel } from "./plans";

describe("date keys", () => {
  it("does calendar arithmetic without time zones", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(daysBetween("2026-09-24", "2026-09-20")).toBe(-4);
    expect(weekdayIndex("2026-09-24")).toBe(3); // Thursday
    expect(startOfWeek("2026-09-27")).toBe("2026-09-21");
    expect(longDate("2026-09-24")).toBe("9월 24일 (목)");
  });

  it("skips weekends for business days", () => {
    expect(addBusinessDays("2026-09-25", 1)).toBe("2026-09-28"); // Fri → Mon
    expect(addBusinessDays("2026-09-24", 3)).toBe("2026-09-29");
  });

  it("validates keys and month ranges", () => {
    expect(isDateKey("2026-02-30")).toBe(false);
    expect(isDateKey("2026-09-24")).toBe(true);
    expect(monthRange("2026-12-15")).toEqual({ start: "2026-12-01", next: "2027-01-01" });
  });
});

describe("pipeline", () => {
  it("moves one step at a time", () => {
    expect(nextStatus("received")).toBe("writing");
    expect(nextStatus("delivered")).toBeNull();
    expect(previousStatus("received")).toBeNull();
    expect(canMove("writing", "review")).toBe(true);
    expect(canMove("review", "writing")).toBe(true);
    expect(canMove("received", "delivered")).toBe(false);
  });

  it("describes the due date from today's point of view", () => {
    const today = "2026-09-24";
    expect(dueState({ dueDate: "2026-09-27", today, status: "writing" })).toEqual({ daysLeft: 3, label: "D-3", tone: "normal" });
    expect(dueState({ dueDate: "2026-09-25", today, status: "writing" }).tone).toBe("soon");
    expect(dueState({ dueDate: today, today, status: "review" })).toMatchObject({ label: "D-day", tone: "today" });
    expect(dueState({ dueDate: "2026-09-22", today, status: "writing" })).toMatchObject({ label: "2일 지연", tone: "late" });
  });

  it("judges delivered orders by their delivery day", () => {
    expect(dueState({ dueDate: "2026-09-20", today: "2026-09-24", status: "delivered", deliveredOn: "2026-09-19" }).label).toBe("기한 내 납품");
    expect(dueState({ dueDate: "2026-09-20", today: "2026-09-24", status: "delivered", deliveredOn: "2026-09-22" }).label).toBe("2일 늦게 납품");
  });

  it("pads order codes", () => {
    expect(orderCode(7)).toBe("#007");
  });
});

describe("plans", () => {
  it("keeps 광고 카피 out of 스타터", () => {
    expect(checkOrderAllowance("starter", "ad", 0)).toMatchObject({ ok: false });
    expect(checkOrderAllowance("starter", "blog", 0)).toEqual({ ok: true, remaining: 9 });
  });

  it("enforces the monthly quota, except on 엔터프라이즈", () => {
    expect(checkOrderAllowance("pro", "ad", 30)).toMatchObject({ ok: false });
    expect(checkOrderAllowance("pro", "ad", 29)).toEqual({ ok: true, remaining: 0 });
    expect(checkOrderAllowance("enterprise", "ad", 500)).toEqual({ ok: true, remaining: null });
  });

  it("labels prices in 만원 or as a quote", () => {
    expect(planPriceLabel(PLANS.starter)).toBe("29만원");
    expect(planPriceLabel(PLANS.enterprise)).toBe("맞춤 견적");
  });
});
