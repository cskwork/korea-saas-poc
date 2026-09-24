import { describe, expect, it } from "vitest";
import { parseOrdersQuery } from "./query";

describe("parseOrdersQuery", () => {
  it("keeps valid filters", () => {
    expect(parseOrdersQuery({ status: "revision", type: "logo", q: "  꿀 ", sort: "amount" })).toEqual({
      status: "revision",
      type: "logo",
      q: "꿀",
      sort: "amount",
    });
    expect(parseOrdersQuery({ status: "open" }).status).toBe("open");
  });

  it("drops unknown values instead of failing", () => {
    expect(parseOrdersQuery({ status: "cancelled", type: "poster", sort: "random", q: "" })).toEqual({
      status: undefined,
      type: undefined,
      q: undefined,
      sort: "due",
    });
    expect(parseOrdersQuery({ status: ["drafting", "received"] }).status).toBe("drafting");
    expect(parseOrdersQuery({ q: "가".repeat(80) }).q).toHaveLength(50);
  });
});
