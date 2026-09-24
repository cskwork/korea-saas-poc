import { describe, expect, it } from "vitest";
import { allowedCommands, characterCount, dueIssues, manuscriptSheets, nextIssueNumber, publishProblems, readingMinutes } from "./issues";
import { addDays, daysBetween, monthLabel, monthRange, recentMonths, seoulInstant, seoulParts } from "./dates";
import { audienceTiers, canRead, unlockingTier } from "./tiers";
import { canDelete, canParticipate, categoriesFor, likerKey, type BoardActor } from "./board";

describe("issues", () => {
  it("measures length in 원고지 sheets and reading minutes", () => {
    const body = "가".repeat(450);
    expect(characterCount(`## ${body}`)).toBe(450);
    expect(manuscriptSheets(body)).toBe(2.3);
    expect(readingMinutes(body)).toBe(1);
    expect(readingMinutes("가".repeat(2600))).toBe(5);
  });

  it("numbers issues and finds due ones in schedule order", () => {
    expect(nextIssueNumber(null)).toBe(1);
    expect(nextIssueNumber(20)).toBe(21);
    const now = new Date("2026-09-24T00:00:00Z");
    const due = dueIssues(
      [
        { id: "late", status: "scheduled" as const, scheduledAt: new Date("2026-09-23T00:00:00Z") },
        { id: "future", status: "scheduled" as const, scheduledAt: new Date("2026-09-25T00:00:00Z") },
        { id: "early", status: "scheduled" as const, scheduledAt: new Date("2026-09-20T00:00:00Z") },
        { id: "draft", status: "draft" as const, scheduledAt: null },
      ],
      now,
    );
    expect(due.map((i) => i.id)).toEqual(["early", "late"]);
  });

  it("guards the workflow", () => {
    expect(allowedCommands("published")).toEqual(["save"]);
    expect(allowedCommands("scheduled")).toContain("unschedule");
    expect(publishProblems({ title: " ", body: "짧음" })).toHaveLength(2);
    expect(publishProblems({ title: "제목", body: "가".repeat(20) })).toEqual([]);
  });
});

describe("dates (Asia/Seoul)", () => {
  it("converts between instants and Seoul wall-clock time", () => {
    expect(seoulParts(new Date("2026-09-23T22:30:00Z"))).toEqual({ date: "2026-09-24", time: "07:30" });
    expect(seoulInstant("2026-09-29", "07:00").toISOString()).toBe("2026-09-28T22:00:00.000Z");
  });

  it("does calendar arithmetic", () => {
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
    expect(daysBetween("2026-09-01", "2026-09-24")).toBe(23);
    expect(monthRange("2026-02")).toEqual({ start: "2026-02-01", end: "2026-02-28" });
    expect(recentMonths("2026-02-10", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
    expect(monthLabel("2026-09")).toBe("9월");
  });
});

describe("tiers and board rules", () => {
  it("decides who reads what", () => {
    expect(canRead(null, "everyone")).toBe(true);
    expect(canRead("free", "paid")).toBe(false);
    expect(canRead("basic", "paid")).toBe(true);
    expect(canRead("basic", "pro")).toBe(false);
    expect(audienceTiers("paid")).toEqual(["basic", "pro"]);
    expect(unlockingTier("pro")).toBe("pro");
  });

  it("lets paid active members and the editor take part", () => {
    const member: BoardActor = { role: "member", name: "김민수", subscriberId: "s1", tier: "basic", active: true };
    const editor: BoardActor = { role: "editor", name: "윤서하" };
    expect(canParticipate(member)).toBe(true);
    expect(canParticipate({ ...member, tier: "free" })).toBe(false);
    expect(canParticipate({ ...member, active: false })).toBe(false);
    expect(canParticipate(null)).toBe(false);
    expect(categoriesFor(member)).not.toContain("notice");
    expect(likerKey(editor)).toBe("editor");
    expect(canDelete(member, { authorRole: "member", authorSubscriberId: "s1" })).toBe(true);
    expect(canDelete(member, { authorRole: "member", authorSubscriberId: "s2" })).toBe(false);
    expect(canDelete(editor, { authorRole: "member", authorSubscriberId: "s2" })).toBe(true);
  });
});
