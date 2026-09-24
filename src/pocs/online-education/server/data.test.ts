import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetModule, seedModuleIfNeeded } from "@/core/modules/lifecycle";
import { createTestDatabase, type TestDatabase } from "@/core/testing/database";
import { courses, enrollments, lessons, payments, schema, type Schema } from "../db/schema";
import { seedOnlineEducation } from "../db/seed";
import { templateDraft } from "../domain/curriculum-draft";
import { courseInput, enrollInput, lessonInput } from "../domain/inputs";
import { onlineEducation } from "../module";
import {
  readCourse,
  readCourseSummaries,
  readDashboard,
  readPlanUsage,
  readProducts,
  readRevenue,
  readStorefront,
  readStudent,
  readStudents,
} from "./reads";
import {
  addLesson,
  addSection,
  applyCurriculumDraft,
  changePlan,
  createCourse,
  createProduct,
  deleteCourse,
  enroll,
  moveLesson,
  purchaseProduct,
  refundPayment,
  setCourseStatus,
  updateLesson,
} from "./writes";

const NOW = new Date("2026-09-24T12:00:00Z"); // Thu 21:00 in Seoul

describe("에듀마켓 data layer", () => {
  let t: TestDatabase<Schema>;
  let other: string;

  beforeAll(async () => {
    t = await createTestDatabase(schema);
    await seedOnlineEducation(t.db, t.workspaceId, NOW);
    other = await t.createWorkspace();
    await seedOnlineEducation(t.db, other, NOW);
  });
  afterAll(() => t.close());

  it("seeds a living school: courses, a draft, twelve months of growing revenue", async () => {
    const { all } = await readCourseSummaries(t.db, t.workspaceId);
    expect(all).toHaveLength(4);
    expect(all.filter((c) => c.status === "draft").map((c) => c.title)).toEqual(["파이썬 데이터 분석 입문"]);
    expect(all.every((c) => c.lessonCount > 0)).toBe(true);

    const revenue = await readRevenue(t.db, t.workspaceId, NOW, 12);
    expect(revenue.series).toHaveLength(12);
    expect(revenue.series[10].total).toBeGreaterThan(revenue.series[0].total * 2);
    const seeded = await t.db.select({ paidAt: payments.paidAt }).from(payments).where(eq(payments.workspaceId, t.workspaceId));
    expect(seeded.length).toBeGreaterThan(300);
    expect(seeded.every((p) => p.paidAt.getTime() <= NOW.getTime())).toBe(true);

    const dashboard = await readDashboard(t.db, t.workspaceId, NOW, 0);
    expect(dashboard.timetable.count).toBeGreaterThan(0);
    expect(dashboard.recentEnrollments.length).toBeGreaterThan(0);
    expect(dashboard.drafts).toHaveLength(1);
  });

  it("builds a curriculum: sections, lessons, reorder, move between sections", async () => {
    const courseId = await createCourse(
      t.db,
      t.workspaceId,
      courseInput.parse({
        title: "노션으로 만드는 1인 사업 시스템",
        description: "노션 하나로 고객, 일정, 매출을 관리하는 법을 배워요.",
        category: "marketing",
        listPrice: "49000",
        price: "39000",
        outcomes: "고객 데이터베이스 만들기",
      }),
    );
    const first = await addSection(t.db, t.workspaceId, { courseId, title: "시작하기" });
    const second = await addSection(t.db, t.workspaceId, { courseId, title: "운영하기" });
    const lesson = (title: string, sectionId: string) =>
      addLesson(t.db, t.workspaceId, lessonInput.parse({ sectionId, title, type: "video", duration: "10:00" }));
    const a = await lesson("A", first);
    const b = await lesson("B", first);
    await moveLesson(t.db, t.workspaceId, { id: b, direction: "up" });

    let detail = await readCourse(t.db, t.workspaceId, courseId);
    expect(detail?.sections[0].lessons.map((l) => l.title)).toEqual(["B", "A"]);
    expect(detail?.course.color).toBe("lavender");

    await updateLesson(
      t.db,
      t.workspaceId,
      { ...lessonInput.parse({ sectionId: second, title: "A (퀴즈)", type: "quiz", duration: "5", isPreview: "on" }), lessonId: a },
    );
    detail = await readCourse(t.db, t.workspaceId, courseId);
    expect(detail?.sections[1].lessons).toMatchObject([{ title: "A (퀴즈)", type: "quiz", durationSeconds: 300, isPreview: true }]);
    expect(detail?.stats).toMatchObject({ sectionCount: 2, lessonCount: 2, runtimeSeconds: 900, previewCount: 1 });

    await setCourseStatus(t.db, t.workspaceId, { courseId, status: "published" }, NOW);
    const storefront = await readStorefront(t.db, t.workspaceId);
    expect(storefront.courses.map((c) => c.id)).toContain(courseId);
  });

  it("fills an empty course from a curriculum draft, once", async () => {
    const input = courseInput.parse({
      title: "데이터 시각화 첫걸음",
      description: "차트 하나로 말하는 법을 배워요.",
      category: "data",
      listPrice: "39000",
      price: "39000",
      outcomes: "좋은 차트 고르기\n색으로 강조하기",
    });
    const courseId = await createCourse(t.db, t.workspaceId, input);
    const draft = templateDraft({ ...input, outcomes: input.outcomes });
    await expect(applyCurriculumDraft(t.db, t.workspaceId, courseId, draft)).resolves.toEqual({ sections: 4, lessons: 10 });
    const detail = await readCourse(t.db, t.workspaceId, courseId);
    expect(detail?.sections.map((s) => s.title)).toEqual(["시작하기", "좋은 차트 고르기", "색으로 강조하기", "마무리"]);
    expect(detail?.stats.previewCount).toBe(2);
    await expect(applyCurriculumDraft(t.db, t.workspaceId, courseId, draft)).rejects.toThrow("비어 있을 때만");
    await deleteCourse(t.db, t.workspaceId, courseId);
  });

  it("refuses to publish an empty course", async () => {
    const courseId = await createCourse(
      t.db,
      t.workspaceId,
      courseInput.parse({ title: "빈 강의", description: "아직 레슨이 없는 강의예요.", category: "data", listPrice: "0", price: "0" }),
    );
    await expect(setCourseStatus(t.db, t.workspaceId, { courseId, status: "published" })).rejects.toThrow("레슨이 하나 이상");
    await deleteCourse(t.db, t.workspaceId, courseId);
  });

  it("registers a student with a pace, records the payment, and blocks double registration", async () => {
    const { all } = await readCourseSummaries(t.db, t.workspaceId);
    const react = all.find((c) => c.title === "실전 React 완전 정복");
    expect(react).toBeDefined();
    const input = enrollInput.parse({
      courseId: react?.id,
      name: "테스트 수강생",
      email: "new.student@example.com",
      sessionsPerWeek: "3",
      minutesPerSession: "30",
    });
    const receipt = await enroll(t.db, t.workspaceId, input, NOW);
    expect(receipt).toMatchObject({ amount: 89_000, courseTitle: "실전 React 완전 정복" });
    expect(receipt.finishOn && receipt.finishOn > "2026-09-24").toBe(true);

    await expect(enroll(t.db, t.workspaceId, input, NOW)).rejects.toThrow("이미 이 강의를 수강 중");

    const students = await readStudents(t.db, t.workspaceId, NOW, { q: "new.student" });
    expect(students.rows).toHaveLength(1);
    const student = await readStudent(t.db, t.workspaceId, students.rows[0].id, NOW);
    expect(student?.enrollments[0]).toMatchObject({ status: "active", progress: 0, sessionsPerWeek: 3, pace: "on_track" });
    expect(student?.totalPaid).toBe(89_000);

    // Refunding closes the enrollment and takes the money out of revenue.
    const before = await readRevenue(t.db, t.workspaceId, NOW, 1);
    await refundPayment(t.db, t.workspaceId, student?.payments[0].id ?? "", NOW);
    const after = await readRevenue(t.db, t.workspaceId, NOW, 1);
    expect(after.series[0].total).toBe(before.series[0].total - 89_000);
    const [enrollment] = await t.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.learnerId, students.rows[0].id), eq(enrollments.courseId, react?.id ?? "")));
    expect(enrollment.status).toBe("refunded");
    await expect(refundPayment(t.db, t.workspaceId, student?.payments[0].id ?? "", NOW)).rejects.toThrow("이미 환불");

    // A refunded learner may register again.
    await expect(enroll(t.db, t.workspaceId, input, NOW)).resolves.toMatchObject({ amount: 89_000 });
  });

  it("refuses registration for drafts", async () => {
    const { all } = await readCourseSummaries(t.db, t.workspaceId);
    const draft = all.find((c) => c.status === "draft");
    await expect(
      enroll(
        t.db,
        t.workspaceId,
        enrollInput.parse({ courseId: draft?.id, name: "김초안", email: "draft@example.com", sessionsPerWeek: "2", minutesPerSession: "45" }),
        NOW,
      ),
    ).rejects.toThrow("수강 신청을 받지 않는");
  });

  it("sells products and enforces plan limits", async () => {
    const { rows } = await readProducts(t.db, t.workspaceId, { sort: "sales" });
    const top = rows[0];
    await purchaseProduct(t.db, t.workspaceId, { productId: top.id, name: "구매자", email: "buyer@example.com" }, NOW);
    const after = await readProducts(t.db, t.workspaceId);
    expect(after.all.find((p) => p.id === top.id)?.sales).toBe(top.sales + 1);

    // Basic allows five products: the seed has four.
    await createProduct(t.db, t.workspaceId, { title: "강의 수익 계산 시트", type: "sheet", description: "월 정산액을 계산하는 시트예요.", price: 19_000 });
    await expect(
      createProduct(t.db, t.workspaceId, { title: "여섯 번째 상품", type: "pdf", description: "한도를 넘는 상품이에요.", price: 1_000 }),
    ).rejects.toThrow("5개까지");

    await expect(changePlan(t.db, t.workspaceId, { plan: "free", billing: "monthly" })).rejects.toThrow("바꿀 수 없어요");
    await changePlan(t.db, t.workspaceId, { plan: "pro", billing: "yearly" });
    expect((await readPlanUsage(t.db, t.workspaceId)).products).toBe(5);
  });

  it("keeps tenants apart", async () => {
    const mine = await readCourseSummaries(t.db, t.workspaceId);
    const course = mine.all[0];
    expect(await readCourse(t.db, other, course.id)).toBeNull();
    await expect(deleteCourse(t.db, other, course.id)).rejects.toThrow("강의를 찾을 수 없어요");
    const [lesson] = await t.db.select().from(lessons).where(eq(lessons.workspaceId, t.workspaceId)).limit(1);
    await expect(moveLesson(t.db, other, { id: lesson.id, direction: "down" })).rejects.toThrow("레슨을 찾을 수 없어요");
    expect((await readCourseSummaries(t.db, other)).all).toHaveLength(4);
  });

  it("keeps revenue history when a course is deleted", async () => {
    const before = await readRevenue(t.db, other, NOW, 12);
    const [figma] = await t.db
      .select()
      .from(courses)
      .where(and(eq(courses.workspaceId, other), eq(courses.title, "피그마 UI/UX 디자인 마스터")));
    await deleteCourse(t.db, other, figma.id);
    const after = await readRevenue(t.db, other, NOW, 12);
    expect(after.lifetime.total).toBe(before.lifetime.total);
    expect(after.items.find((i) => i.title === "피그마 UI/UX 디자인 마스터")?.id).toBeNull();
  });

  it("resets through the platform lifecycle", async () => {
    const workspaceId = await t.createWorkspace();
    expect(await seedModuleIfNeeded(t.db, onlineEducation, workspaceId)).toBe(true);
    await deleteCourse(t.db, workspaceId, (await readCourseSummaries(t.db, workspaceId)).all[0].id);
    await resetModule(t.db, onlineEducation, workspaceId);
    expect((await readCourseSummaries(t.db, workspaceId)).all).toHaveLength(4);
  });
});
