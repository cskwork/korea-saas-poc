import { describe, expect, it } from "vitest";
import { formDataToObject } from "@/core/actions";
import { diagnosisInput, graphInput, packageInput, projectInput, quoteInput } from "./inputs";

const form = (entries: [string, string][]) => {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return formDataToObject(data);
};

describe("form input schemas", () => {
  it("parses a package form, splitting and de-duplicating tools", () => {
    const parsed = packageInput.parse(
      form([
        ["name", " 재고 알림 "],
        ["industry", "retail"],
        ["kind", "data"],
        ["summary", "재고가 떨어지면 알려요"],
        ["tools", "n8n, Google Sheets, n8n, "],
        ["buildHours", "12"],
        ["monthlyHoursSaved", "20"],
        ["setupFee", "900000"],
        ["monthlyFee", "150000"],
      ]),
    );
    expect(parsed).toMatchObject({ name: "재고 알림", tools: ["n8n", "Google Sheets"], setupFee: 900_000, details: "" });
  });

  it("reads repeated package ids as an array and blank dates as null", () => {
    const parsed = projectInput.parse(
      form([
        ["clientName", "테스트"],
        ["industry", "it"],
        ["stage", "analysis"],
        ["progress", "20"],
        ["startDate", ""],
        ["dueDate", "2026-10-01"],
        ["packageIds", "0b5d1e0c-2c1a-4c5e-9d2e-0f4a8e1b2c3d"],
        ["packageIds", "1b5d1e0c-2c1a-4c5e-9d2e-0f4a8e1b2c3d"],
        ["setupFee", "0"],
        ["monthlyFee", "0"],
      ]),
    );
    expect(parsed.packageIds).toHaveLength(2);
    expect(parsed.startDate).toBeNull();
    expect(parsed.maintenanceStatus).toBe("none");
  });

  it("rejects a due date before the start date", () => {
    const result = projectInput.safeParse(
      form([
        ["clientName", "테스트"],
        ["industry", "it"],
        ["startDate", "2026-10-02"],
        ["dueDate", "2026-10-01"],
        ["setupFee", "0"],
        ["monthlyFee", "0"],
      ]),
    );
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["dueDate"]);
  });

  it("parses quote lines from the JSON field and requires at least one", () => {
    const base: [string, string][] = [
      ["clientName", "고객"],
      ["issuedOn", "2026-09-24"],
      ["validDays", "30"],
    ];
    const lines = JSON.stringify([{ packageId: null, name: "연동", complexity: "simple", quantity: 2, unitSetupFee: 100000, unitMonthlyFee: 0 }]);
    expect(quoteInput.parse(form([...base, ["lines", lines]])).lines[0].quantity).toBe(2);
    expect(quoteInput.safeParse(form([...base, ["lines", "[]"]])).success).toBe(false);
    expect(quoteInput.safeParse(form([...base, ["lines", "not json"]])).success).toBe(false);
  });

  it("bounds ROI inputs", () => {
    const base = { clientName: "고객", industry: "service", weeklyHours: 10, hourlyCost: 20000, automationRate: 50, investment: 0, monthlyFee: 0 };
    expect(diagnosisInput.safeParse(base).success).toBe(true);
    expect(diagnosisInput.safeParse({ ...base, automationRate: 150 }).success).toBe(false);
  });

  it("only accepts known apps on workflow stations", () => {
    const node = { key: "a", kind: "trigger", app: "gmail", label: "메일", column: 0, lane: 0 };
    expect(graphInput.safeParse({ nodes: [node], edges: [] }).success).toBe(true);
    expect(graphInput.safeParse({ nodes: [{ ...node, app: "unknown" }], edges: [] }).success).toBe(false);
  });
});
