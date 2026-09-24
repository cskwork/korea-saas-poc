import { describe, expect, it } from "vitest";
import {
  canCancel,
  formatTrackingNumber,
  makeOrderNumber,
  nextOrderStatus,
  normalizeTrackingNumber,
  orderAmounts,
  sampleTrackingNumber,
} from "./orders";

describe("order workflow", () => {
  it("moves 신규주문 → 발주확인 → 배송중 → 배송완료 and stops", () => {
    expect(nextOrderStatus("new")).toBe("confirmed");
    expect(nextOrderStatus("confirmed")).toBe("shipping");
    expect(nextOrderStatus("shipping")).toBe("delivered");
    expect(nextOrderStatus("delivered")).toBeNull();
    expect(nextOrderStatus("cancelled")).toBeNull();
  });

  it("allows cancelling only before shipment", () => {
    expect(canCancel("new")).toBe(true);
    expect(canCancel("confirmed")).toBe(true);
    expect(canCancel("shipping")).toBe(false);
    expect(canCancel("delivered")).toBe(false);
    expect(canCancel("cancelled")).toBe(false);
  });
});

describe("tracking numbers", () => {
  it("accepts 10–14 digits with separators", () => {
    expect(normalizeTrackingNumber("6123-4567-8901")).toBe("612345678901");
    expect(normalizeTrackingNumber(" 1234 5678 90 ")).toBe("1234567890");
  });

  it("rejects letters and wrong lengths", () => {
    expect(normalizeTrackingNumber("12345")).toBeNull();
    expect(normalizeTrackingNumber("CJ1234567890")).toBeNull();
    expect(normalizeTrackingNumber("123456789012345")).toBeNull();
  });

  it("formats in groups of four", () => {
    expect(formatTrackingNumber("612345678901")).toBe("6123-4567-8901");
  });

  it("generates valid sample numbers", () => {
    for (const r of [0, 0.5, 0.999999]) {
      expect(normalizeTrackingNumber(sampleTrackingNumber(r))).toHaveLength(12);
    }
  });
});

describe("orderAmounts", () => {
  it("charges the fee on the order total and shipping once per parcel", () => {
    expect(
      orderAmounts({ quantity: 2, unitPrice: 15_900, unitCost: 4_000, shippingCost: 3_000, feeRateBp: 600 }),
    ).toEqual({
      revenue: 31_800,
      cost: 8_000,
      fee: 1_908,
      shipping: 3_000,
      profit: 18_892,
    });
  });
});

describe("makeOrderNumber", () => {
  it("prefixes the Seoul date to eight digits", () => {
    expect(makeOrderNumber("2026-09-24", 0.5)).toBe("2026092450000000");
    expect(makeOrderNumber("2026-09-24", 0)).toHaveLength(16);
  });
});
