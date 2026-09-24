import { describe, expect, it } from "vitest";
import { contrastRatio, signLettering, signPaint } from "./contrast";

describe("sign lettering", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("letters dark paint in white and light paint in ink", () => {
    expect(signLettering("#0e5a45")).toBe("#ffffff");
    expect(signLettering("#f59f00")).toBe("#16202b");
    expect(signLettering("#03c75a")).toBe("#16202b");
  });

  it("always picks the more legible of the two", () => {
    for (const paint of ["#e0457b", "#c23a2c", "#7b5cff", "#4263eb", "#fa5252", "#5f3dc4", "#1098ad"]) {
      const chosen = signLettering(paint);
      const other = chosen === "#ffffff" ? "#16202b" : "#ffffff";
      expect(contrastRatio(paint, chosen)).toBeGreaterThanOrEqual(contrastRatio(paint, other));
    }
  });
});

describe("sign paint", () => {
  it("keeps a colour that already reads", () => {
    expect(signPaint("#0d5a44")).toEqual({ paint: "#0d5a44", ink: "#ffffff" });
  });

  it("adjusts borderline colours until small lettering reaches 4.5:1", () => {
    for (const accent of ["#7b5cff", "#e0457b", "#1098ad", "#fa5252", "#03c75a", "#e0ef3c"]) {
      const { paint, ink } = signPaint(accent);
      expect(contrastRatio(paint, ink)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
