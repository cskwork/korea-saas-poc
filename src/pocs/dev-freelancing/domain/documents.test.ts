import { describe, expect, it } from "vitest";
import {
  availableShares,
  canMoveEstimate,
  canMoveInvoice,
  conversionLines,
  isEstimateExpired,
  nextDocumentNumber,
  overdueDays,
  receivableBucket,
  type ConvertibleEstimate,
} from "./documents";

describe("document numbers", () => {
  it("starts each day at 001", () => {
    expect(nextDocumentNumber("EST", "2026-09-24", [])).toBe("EST-20260924-001");
  });

  it("continues after the highest number of the same day and prefix", () => {
    const existing = ["EST-20260924-001", "EST-20260924-007", "EST-20260923-011", "INV-20260924-020"];
    expect(nextDocumentNumber("EST", "2026-09-24", existing)).toBe("EST-20260924-008");
    expect(nextDocumentNumber("INV", "2026-09-24", existing)).toBe("INV-20260924-021");
  });
});

describe("status workflows", () => {
  it("lets an estimate go draft → sent → accepted, and back to draft only from sent or declined", () => {
    expect(canMoveEstimate("draft", "sent")).toBe(true);
    expect(canMoveEstimate("sent", "accepted")).toBe(true);
    expect(canMoveEstimate("draft", "accepted")).toBe(false);
    expect(canMoveEstimate("declined", "draft")).toBe(true);
    expect(canMoveEstimate("accepted", "invoiced")).toBe(false);
    expect(canMoveEstimate("invoiced", "draft")).toBe(false);
  });

  it("lets an invoice go 발행 → 입금대기 → 입금완료 and undo a deposit", () => {
    expect(canMoveInvoice("issued", "awaiting")).toBe(true);
    expect(canMoveInvoice("awaiting", "paid")).toBe(true);
    expect(canMoveInvoice("paid", "awaiting")).toBe(true);
    expect(canMoveInvoice("paid", "issued")).toBe(false);
  });
});

describe("deadlines", () => {
  it("counts overdue days only for unpaid invoices", () => {
    expect(overdueDays({ status: "awaiting", dueOn: "2026-09-20" }, "2026-09-24")).toBe(4);
    expect(overdueDays({ status: "awaiting", dueOn: "2026-09-30" }, "2026-09-24")).toBe(0);
    expect(overdueDays({ status: "paid", dueOn: "2026-01-01" }, "2026-09-24")).toBe(0);
  });

  it("buckets receivables by age", () => {
    expect(receivableBucket(0)).toBe("current");
    expect(receivableBucket(30)).toBe("d1_30");
    expect(receivableBucket(31)).toBe("d31_60");
    expect(receivableBucket(90)).toBe("d61");
  });

  it("expires sent estimates after their validity date", () => {
    expect(isEstimateExpired({ status: "sent", validUntil: "2026-09-23" }, "2026-09-24")).toBe(true);
    expect(isEstimateExpired({ status: "sent", validUntil: "2026-09-24" }, "2026-09-24")).toBe(false);
    expect(isEstimateExpired({ status: "draft", validUntil: "2026-01-01" }, "2026-09-24")).toBe(false);
  });
});

describe("estimate → invoice conversion", () => {
  const estimate: ConvertibleEstimate = {
    title: "스타트업허브 MVP",
    taxMode: "withholding",
    discount: 200_000,
    items: [
      { title: "기획", unit: "hour", quantity: 16, unitPrice: 60_000 },
      { title: "개발", unit: "hour", quantity: 80, unitPrice: 60_000 },
      { title: "서버 세팅", unit: "lump", quantity: 1, unitPrice: 440_000 },
    ],
  };
  // subtotal 960,000 + 4,800,000 + 440,000 = 6,200,000; supply 6,000,000

  it("offers full or advance first, then only the balance", () => {
    expect(availableShares(6_000_000, 0)).toEqual(["full", "advance30", "advance50"]);
    expect(availableShares(6_000_000, 1_800_000)).toEqual(["balance"]);
    expect(availableShares(6_000_000, 6_000_000)).toEqual([]);
  });

  it("copies every line and the discount for a full invoice", () => {
    const result = conversionLines(estimate, 0, "full");
    expect(result?.items).toHaveLength(3);
    expect(result?.discount).toBe(200_000);
  });

  it("bills 30% of the supply amount as one 착수금 line", () => {
    const result = conversionLines(estimate, 0, "advance30");
    expect(result).toEqual({
      items: [{ title: "착수금 30% · 스타트업허브 MVP", unit: "lump", quantity: 1, unitPrice: 1_800_000 }],
      discount: 0,
    });
  });

  it("bills what is left as 잔금 and refuses shares that no longer apply", () => {
    expect(conversionLines(estimate, 1_800_000, "balance")?.items[0].unitPrice).toBe(4_200_000);
    expect(conversionLines(estimate, 1_800_000, "full")).toBeNull();
    expect(conversionLines(estimate, 6_000_000, "balance")).toBeNull();
  });
});
