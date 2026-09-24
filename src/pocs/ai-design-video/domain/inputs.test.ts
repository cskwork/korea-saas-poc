import { describe, expect, it } from "vitest";
import { orderInput, revisionInput } from "./inputs";

describe("form inputs", () => {
  const base = {
    type: "thumbnail",
    title: "썸네일",
    clientName: "고객",
    dueDate: "2026-09-30",
    quantity: "1",
    price: "50000",
  };

  it("rejects a blank price instead of reading it as 0", () => {
    const parsed = orderInput.safeParse({ ...base, price: "" });
    expect(parsed.success).toBe(false);
  });

  it("reads an empty revision limit as unlimited and checkboxes as booleans", () => {
    const parsed = orderInput.parse({ ...base, revisionLimit: "", rush: "on", tools: "Canva" });
    expect(parsed).toMatchObject({ revisionLimit: null, rush: true, tools: ["Canva"], referenceLinks: [] });
  });

  it("defaults the extra fee to 0 when left blank", () => {
    const parsed = revisionInput.parse({ orderId: crypto.randomUUID(), note: "글자 크게", extraFee: "" });
    expect(parsed).toMatchObject({ extraFee: 0, extraConfirmed: false });
  });
});
