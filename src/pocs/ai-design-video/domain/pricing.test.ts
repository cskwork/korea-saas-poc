import { describe, expect, it } from "vitest";
import { addDays, daysBetween, dueState, lastMonths, monthLabel } from "./calendar";
import { nextOrderCode, cutNumber } from "./order-code";
import { orderTotal, quotePrice } from "./pricing";

describe("quotePrice", () => {
  it("multiplies the unit price by quantity", () => {
    expect(quotePrice({ unitPrice: 50_000, quantity: 5, rush: false })).toBe(250_000);
  });

  it("adds 50% for rush work, rounded to 1,000 won", () => {
    expect(quotePrice({ unitPrice: 150_000, quantity: 1, rush: true })).toBe(225_000);
    expect(quotePrice({ unitPrice: 33_333, quantity: 1, rush: true })).toBe(50_000);
  });

  it("treats a missing quantity as one", () => {
    expect(quotePrice({ unitPrice: 80_000, quantity: 0, rush: false })).toBe(80_000);
  });

  it("counts billed extra revisions in the order total", () => {
    expect(orderTotal({ price: 300_000, extraFees: 60_000 })).toBe(360_000);
  });
});

describe("calendar", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(daysBetween("2026-09-24", "2026-10-01")).toBe(7);
  });

  it("lists months oldest first across a year boundary", () => {
    expect(lastMonths("2026-02", 4)).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
    expect(monthLabel("2026-09")).toBe("9월");
  });

  it("labels deadlines like the sheet's 마감 column", () => {
    expect(dueState("2026-09-23", "2026-09-24")).toMatchObject({ label: "1일 지남", tone: "overdue" });
    expect(dueState("2026-09-24", "2026-09-24")).toMatchObject({ label: "오늘 마감", tone: "today" });
    expect(dueState("2026-09-26", "2026-09-24")).toMatchObject({ label: "D-2", tone: "soon" });
    expect(dueState("2026-10-04", "2026-09-24")).toMatchObject({ label: "D-10", tone: "later" });
  });
});

describe("order codes", () => {
  it("numbers orders per intake day", () => {
    expect(nextOrderCode("2026-09-24", [])).toBe("ORD-20260924-001");
    expect(nextOrderCode("2026-09-24", ["ORD-20260924-001", "ORD-20260924-007", "ORD-20260923-012"])).toBe(
      "ORD-20260924-008",
    );
    expect(cutNumber("ORD-20260924-008")).toBe("008");
  });
});
