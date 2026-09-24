import { describe, expect, it } from "vitest";
import { parseCsv, parseSubscriberCsv, subscribersToCsv, toCsv } from "./csv";

describe("csv", () => {
  it("round-trips quotes, commas and newlines", () => {
    const rows = [
      ["이름", "메모"],
      ['김"따옴표"', "쉼표, 포함\n줄바꿈"],
    ];
    expect(parseCsv(toCsv(rows))).toEqual(rows);
  });

  it("neutralises spreadsheet formulas on export", () => {
    expect(toCsv([["=SUM(A1)"]])).toContain("'=SUM(A1)");
  });

  it("exports subscribers with Korean labels and a BOM", () => {
    const csv = subscribersToCsv([
      { name: "김민수", email: "minsu@example.com", tier: "pro", status: "active", joinedOn: "2026-09-01" },
    ]);
    expect(csv.startsWith("﻿이름,이메일,등급,상태,가입일\r\n")).toBe(true);
    expect(csv).toContain("김민수,minsu@example.com,프로,구독 중,2026-09-01");
  });

  it("imports Korean or English headers and reports bad lines", () => {
    const result = parseSubscriberCsv(
      [
        "name,email,tier,status,joined",
        "김민수,MINSU@example.com,pro,active,2026-09-01",
        "이지영,jiyoung@example.com,베이직,해지,",
        ",empty@example.com,,,",
        "박서연,not-an-email,,,",
        "최유진,yujin@example.com,골드,,",
        "정하늘,minsu@example.com,,,",
        "한별,byul@example.com,,,2026/09/01",
      ].join("\n"),
    );
    expect(result.rows).toEqual([
      { line: 2, name: "김민수", email: "minsu@example.com", tier: "pro", status: "active", joinedOn: "2026-09-01" },
      { line: 3, name: "이지영", email: "jiyoung@example.com", tier: "basic", status: "unsubscribed", joinedOn: null },
    ]);
    expect(result.errors.map((e) => e.line)).toEqual([4, 5, 6, 7, 8]);
  });

  it("requires a header with name and email", () => {
    expect(parseSubscriberCsv("김민수,minsu@example.com").errors[0].message).toContain("'이름'과 '이메일'");
    expect(parseSubscriberCsv("").errors[0].message).toBe("파일이 비어 있어요.");
  });
});
