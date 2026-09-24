import { describe, expect, it } from "vitest";
import { AI_TOOLS, toolUsage, toolsForType } from "./tools";

describe("tool catalogue", () => {
  it("gives every order type a kit", () => {
    for (const type of ["thumbnail", "banner", "detail_page", "short_form", "video_edit", "logo", "bundle"] as const) {
      expect(toolsForType(type).length).toBeGreaterThan(0);
    }
    expect(new Set(AI_TOOLS.map((t) => t.name)).size).toBe(AI_TOOLS.length);
  });

  it("counts orders per tool and type once per order, ignoring unknown tools", () => {
    const usage = toolUsage([
      { type: "thumbnail", tools: ["Canva", "Canva", "ChatGPT"] },
      { type: "short_form", tools: ["CapCut", "ChatGPT", "Photoshop"] },
      { type: "thumbnail", tools: [] },
    ]);
    expect(usage.get("Canva")).toEqual({ total: 1, byType: { thumbnail: 1 } });
    expect(usage.get("ChatGPT")).toEqual({ total: 2, byType: { thumbnail: 1, short_form: 1 } });
    expect(usage.has("Photoshop")).toBe(false);
    expect(usage.get("Suno")?.total).toBe(0);
  });
});
