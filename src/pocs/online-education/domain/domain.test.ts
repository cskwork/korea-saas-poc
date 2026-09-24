import { describe, expect, it } from "vitest";
import { addDays, addMonths, dayKey, daysBetween, mondayOf, seoulInstant, weekdayOf, weekLabel } from "./calendar";
import { discountPercent, nextCourseColor } from "./catalog";
import { normalizeDraft, templateDraft } from "./curriculum-draft";
import { formatClock, formatRuntime, parseDuration, toMinutes } from "./duration";
import { courseInput, enrollInput, lessonInput } from "./inputs";
import { downgradeProblem, limitProblem, planPrice } from "./plans";
import { growthRate, monthlySeries, monthToDate, revenueByItem, revenueCsv, revenueSplit, settlement, type RevenuePayment } from "./revenue";
import { buildStudyPlan, expectedProgress, packSessions, paceStatus, studyWeek } from "./study-plan";
import { weekStart, weekTimetable } from "./week";

describe("duration", () => {
  it("parses mm:ss, h:mm:ss and whole minutes", () => {
    expect(parseDuration("12:30")).toBe(750);
    expect(parseDuration("1:05:00")).toBe(3900);
    expect(parseDuration(" 15 ")).toBe(900);
  });

  it("rejects malformed or out-of-range times", () => {
    expect(parseDuration("12:75")).toBeNull();
    expect(parseDuration("abc")).toBeNull();
    expect(parseDuration("0")).toBeNull();
    expect(parseDuration("6:00:00")).toBeNull();
  });

  it("formats clocks and runtimes in Korean", () => {
    expect(formatClock(750)).toBe("12:30");
    expect(formatClock(3900)).toBe("1:05:00");
    expect(formatRuntime(5100)).toBe("1시간 25분");
    expect(formatRuntime(7200)).toBe("2시간");
    expect(formatRuntime(2700)).toBe("45분");
    expect(formatRuntime(20)).toBe("1분 미만");
    expect(toMinutes(20)).toBe(1);
    expect(toMinutes(0)).toBe(0);
  });
});

describe("calendar (Asia/Seoul)", () => {
  it("keys days in Seoul time, not UTC", () => {
    // 2026-09-23 16:30 UTC is 2026-09-24 01:30 in Seoul.
    expect(dayKey(new Date("2026-09-23T16:30:00Z"))).toBe("2026-09-24");
    expect(seoulInstant("2026-09-24", 9).toISOString()).toBe("2026-09-24T00:00:00.000Z");
  });

  it("does week and month arithmetic", () => {
    expect(weekdayOf("2026-09-24")).toBe(4);
    expect(mondayOf("2026-09-27")).toBe("2026-09-21");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(daysBetween("2026-09-01", "2026-10-01")).toBe(30);
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(weekLabel("2026-09-21")).toBe("9월 넷째 주");
    // The week of Mon 2026-06-29 holds Thursday July 2nd, so it is July's first week.
    expect(weekLabel("2026-06-29")).toBe("7월 첫째 주");
  });
});

describe("catalog", () => {
  it("assigns the first free block colour", () => {
    expect(nextCourseColor([])).toBe("sky");
    expect(nextCourseColor(["sky", "pink"])).toBe("mint");
  });

  it("computes discounts only when the sale price is lower", () => {
    expect(discountPercent(129_000, 89_000)).toBe(31);
    expect(discountPercent(55_000, 55_000)).toBe(0);
    expect(discountPercent(0, 0)).toBe(0);
  });
});

describe("study plan", () => {
  const lessons = [
    { id: "a", title: "A", minutes: 12 },
    { id: "b", title: "B", minutes: 15 },
    { id: "c", title: "C", minutes: 40 },
    { id: "d", title: "D", minutes: 10 },
    { id: "e", title: "E", minutes: 10 },
  ];

  it("packs lessons in order without splitting them", () => {
    expect(packSessions(lessons, 30).map((s) => s.map((l) => l.id))).toEqual([["a", "b"], ["c"], ["d", "e"]]);
  });

  it("schedules sessions on the pace's weekdays and finds the finish day", () => {
    // Thu 2026-09-24, 주 3회 (월·수·금) → Fri 25, Mon 28, Wed 30.
    const plan = buildStudyPlan(lessons, { sessionsPerWeek: 3, minutesPerSession: 30 }, "2026-09-24");
    expect(plan.sessions.map((s) => s.day)).toEqual(["2026-09-25", "2026-09-28", "2026-09-30"]);
    expect(plan.sessions[1].over).toBe(true);
    expect(plan.finishOn).toBe("2026-09-30");
    expect(plan.weeks).toBe(2);
    expect(plan.totalMinutes).toBe(87);

    // The week of the 21st holds one session, the week of the 28th two: that is the one shown.
    const week = studyWeek(plan);
    expect(week?.monday).toBe("2026-09-28");
    expect(week?.days).toHaveLength(7);
    expect(week?.days[0].sessions).toHaveLength(1);
    expect(week?.days[2].sessions).toHaveLength(1);
    expect(week?.days[4].sessions).toHaveLength(0);
  });

  it("returns an empty plan for a course without lessons", () => {
    const plan = buildStudyPlan([], { sessionsPerWeek: 7, minutesPerSession: 20 }, "2026-09-24");
    expect(plan.finishOn).toBeNull();
    expect(plan.weeks).toBe(0);
    expect(studyWeek(plan)).toBeNull();
  });

  it("judges pace against the plan", () => {
    expect(expectedProgress("2026-09-01", "2026-09-11", "2026-09-06")).toBeCloseTo(0.5);
    expect(expectedProgress("2026-09-01", "2026-09-11", "2026-10-01")).toBe(1);
    expect(paceStatus({ status: "active", progress: 20, expected: 0.5 })).toBe("behind");
    expect(paceStatus({ status: "active", progress: 40, expected: 0.5 })).toBe("on_track");
    expect(paceStatus({ status: "active", progress: 100, expected: 1 })).toBe("completed");
    expect(paceStatus({ status: "refunded", progress: 0, expected: 1 })).toBe("refunded");
  });
});

describe("revenue", () => {
  const now = new Date("2026-09-24T12:00:00Z"); // 21:00 KST
  const pay = (paidAt: string, amount: number, kind: "course" | "product" = "course", status: "paid" | "refunded" = "paid"): RevenuePayment => ({
    kind,
    amount,
    status,
    paidAt: new Date(paidAt),
    courseId: kind === "course" ? "course-1" : null,
    productId: kind === "product" ? "product-1" : null,
    itemTitle: kind === "course" ? "React" : "PDF",
  });
  const payments = [
    pay("2026-09-02T01:00:00Z", 89_000),
    pay("2026-09-20T01:00:00Z", 10_000, "product"),
    pay("2026-09-21T01:00:00Z", 89_000, "course", "refunded"),
    pay("2026-08-10T01:00:00Z", 89_000),
    pay("2026-08-28T01:00:00Z", 50_000),
    pay("2026-07-31T16:00:00Z", 9_900, "product"), // Aug 1st 01:00 in Seoul
  ];

  it("builds a Seoul-month series with refunds kept apart", () => {
    const series = monthlySeries(payments, now, 3);
    expect(series.map((m) => m.month)).toEqual(["2026-07", "2026-08", "2026-09"]);
    expect(series[0].total).toBe(0);
    expect(series[1]).toMatchObject({ course: 139_000, product: 9_900, total: 148_900, sales: 3 });
    expect(series[2]).toMatchObject({ course: 89_000, product: 10_000, refunded: 89_000, sales: 2 });
    expect(series[2].byCourse["course-1"]).toBe(89_000);
  });

  it("compares this month to the same stretch of last month", () => {
    const mtd = monthToDate(payments, now);
    expect(mtd.current).toBe(99_000);
    // Aug 1–24 only: the Aug 28 payment is outside the comparable window.
    expect(mtd.previous).toBe(98_900);
    expect(mtd.throughDay).toBe(24);
    expect(mtd.growth).toBeCloseTo(99_000 / 98_900 - 1);
    expect(growthRate(10, 0)).toBeNull();
  });

  it("splits and ranks revenue, and prices the settlement", () => {
    const split = revenueSplit(payments);
    expect(split).toMatchObject({ course: 228_000, product: 19_900, total: 247_900 });
    const items = revenueByItem(payments);
    expect(items[0]).toMatchObject({ title: "React", revenue: 228_000, sales: 3, refunds: 1 });
    expect(settlement(100_000)).toEqual({ gross: 100_000, fee: 3_500, net: 96_500 });
  });

  it("exports CSV with a BOM and one row per month", () => {
    const csv = revenueCsv(monthlySeries(payments, now, 2));
    expect(csv.startsWith("﻿월,")).toBe(true);
    expect(csv.trim().split("\r\n")).toHaveLength(3);
  });
});

describe("week timetable", () => {
  it("places payments on Seoul weekday × hour cells with lanes", () => {
    const now = new Date("2026-09-24T12:00:00Z"); // Thu 21:00 KST
    const monday = weekStart(now, 0);
    expect(monday).toBe("2026-09-21");
    const at = (iso: string, id: string) => ({ id, kind: "course" as const, amount: 1000, paidAt: new Date(iso), itemTitle: id, color: "sky" });
    const table = weekTimetable(
      [
        at("2026-09-21T12:10:00Z", "a"), // Mon 21:10
        at("2026-09-21T12:40:00Z", "b"), // Mon 21:40
        at("2026-09-22T20:30:00Z", "c"), // Wed 05:30 → extends the first hour
        at("2026-09-28T00:00:00Z", "outside"),
      ],
      monday,
      now,
    );
    expect(table.count).toBe(3);
    expect(table.firstHour).toBe(5);
    expect(table.cells.find((c) => c.dayIndex === 0 && c.hour === 21)?.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(table.days[3].isToday).toBe(true);
    expect(table.days[0]).toMatchObject({ total: 2000, count: 2 });
    expect(table.days[4].isFuture).toBe(true);
    expect(table.nowMarker).toEqual({ dayIndex: 3, hour: 21 });
    expect(weekTimetable([], weekStart(now, -1), now).nowMarker).toBeNull();
  });
});

describe("plans", () => {
  it("enforces plan limits with Korean explanations", () => {
    expect(limitProblem("basic", "courses", 3)).toBeNull();
    expect(limitProblem("free", "courses", 1)).toContain("1개까지");
    expect(limitProblem("free", "products", 0)).toContain("판매할 수 없어요");
    expect(limitProblem("pro", "products", 10_000)).toBeNull();
    expect(downgradeProblem("free", { courses: 4, products: 0 })).toContain("강의가 4개");
    expect(downgradeProblem("basic", { courses: 4, products: 4 })).toBeNull();
  });

  it("applies the yearly discount", () => {
    expect(planPrice("basic", "monthly")).toEqual({ perMonth: 29_000, perYear: 348_000 });
    expect(planPrice("basic", "yearly")).toEqual({ perMonth: 23_200, perYear: 278_400 });
  });
});

describe("inputs", () => {
  it("parses course forms and rejects a sale price above the list price", () => {
    const ok = courseInput.safeParse({
      title: "실전 React",
      description: "React를 처음부터 끝까지 배워요.",
      category: "programming",
      listPrice: "129,000",
      price: "89000",
      outcomes: "훅 이해하기\n\n  투두 앱 만들기 ",
    });
    expect(ok.success && ok.data).toMatchObject({ listPrice: 129_000, price: 89_000, outcomes: ["훅 이해하기", "투두 앱 만들기"] });

    const bad = courseInput.safeParse({
      title: "실전 React",
      description: "React를 처음부터 끝까지 배워요.",
      category: "programming",
      listPrice: "50000",
      price: "89000",
    });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues[0].path).toEqual(["price"]);
  });

  it("turns lesson durations into seconds and checkboxes into booleans", () => {
    const parsed = lessonInput.parse({
      sectionId: "0b9b3c3e-8e0e-4a53-8f0f-0e3c1f8c9a11",
      title: "useState",
      type: "video",
      duration: "20:15",
      isPreview: "on",
    });
    expect(parsed).toMatchObject({ duration: 1215, isPreview: true });
    expect(
      lessonInput.safeParse({ sectionId: "0b9b3c3e-8e0e-4a53-8f0f-0e3c1f8c9a11", title: "x", type: "video", duration: "soon" }).success,
    ).toBe(false);
  });

  it("only accepts the offered paces", () => {
    const base = { courseId: "0b9b3c3e-8e0e-4a53-8f0f-0e3c1f8c9a11", name: "김하늘", email: "Sky@Example.com" };
    expect(enrollInput.parse({ ...base, sessionsPerWeek: "3", minutesPerSession: "30" })).toMatchObject({
      email: "sky@example.com",
      sessionsPerWeek: 3,
    });
    expect(enrollInput.safeParse({ ...base, sessionsPerWeek: "4", minutesPerSession: "30" }).success).toBe(false);
  });
});

describe("curriculum draft", () => {
  it("builds a template from the course's outcomes, or its category", () => {
    const withOutcomes = templateDraft({ title: "실전 React", category: "programming", outcomes: ["훅 이해하기", "투두 앱 만들기"] });
    expect(withOutcomes.sections.map((s) => s.title)).toEqual(["시작하기", "훅 이해하기", "투두 앱 만들기", "마무리"]);
    expect(withOutcomes.sections[0].lessons.every((l) => l.isPreview)).toBe(true);

    const fromCategory = templateDraft({ title: "데이터 입문", category: "data", outcomes: [] });
    expect(fromCategory.sections).toHaveLength(5);
    expect(fromCategory.sections[1].title).toBe("데이터 불러오고 정리하기");
  });

  it("normalizes any draft into insertable limits", () => {
    const draft = normalizeDraft({
      sections: [
        { title: "  ", lessons: [{ title: "버려질 섹션", type: "video", minutes: 10, isPreview: false }] },
        {
          title: "본론",
          lessons: [
            { title: " 긴 레슨 ", type: "video", minutes: 999, isPreview: false },
            { title: "", type: "text", minutes: 5, isPreview: false },
            { title: "짧은 퀴즈", type: "quiz", minutes: 0.2, isPreview: true },
          ],
        },
        ...Array.from({ length: 8 }, (_, i) => ({ title: `추가 ${i}`, lessons: [{ title: "레슨", type: "text" as const, minutes: 5, isPreview: false }] })),
      ],
    });
    expect(draft.sections).toHaveLength(6);
    expect(draft.sections[0]).toEqual({
      title: "본론",
      lessons: [
        { title: "긴 레슨", type: "video", minutes: 180, isPreview: false },
        { title: "짧은 퀴즈", type: "quiz", minutes: 1, isPreview: true },
      ],
    });
  });
});
