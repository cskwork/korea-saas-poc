import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
import type { z } from "zod";
import { UserError } from "@/core/actions";
import type { Database } from "@/core/db/connection";
import {
  courses,
  enrollments,
  learners,
  lessons,
  payments,
  products,
  schools,
  sections,
  type Schema,
} from "../db/schema";
import { nextCourseColor } from "../domain/catalog";
import type { CurriculumDraft } from "../domain/curriculum-draft";
import { dayKey } from "../domain/calendar";
import { toMinutes } from "../domain/duration";
import type {
  courseInput,
  enrollInput,
  lessonInput,
  planInput,
  productInput,
  purchaseInput,
  schoolInput,
  updateCourseInput,
  updateLessonInput,
  updateProductInput,
} from "../domain/inputs";
import { downgradeProblem, limitProblem } from "../domain/plans";
import { buildStudyPlan } from "../domain/study-plan";
import { readPlanUsage, readSchool } from "./reads";

/**
 * Mutations. Each takes the database and tenant explicitly (callable from
 * tests); `actions.ts` wraps them as validated server actions. Every update and
 * delete matches both `id` and `workspaceId`; foreign ids fail as not found.
 */

type Db = Database<Schema>;
type Direction = "up" | "down";

const NOT_FOUND = {
  course: "강의를 찾을 수 없어요. 이미 삭제되었을 수 있어요.",
  section: "섹션을 찾을 수 없어요. 이미 삭제되었을 수 있어요.",
  lesson: "레슨을 찾을 수 없어요. 이미 삭제되었을 수 있어요.",
  product: "상품을 찾을 수 없어요. 이미 삭제되었을 수 있어요.",
  payment: "결제 내역을 찾을 수 없어요.",
  learner: "수강생을 찾을 수 없어요.",
};

function ensure<T>(row: T | undefined, message: string): T {
  if (!row) throw new UserError(message);
  return row;
}

async function touchCourse(db: Db, workspaceId: string, courseId: string) {
  await db
    .update(courses)
    .set({ updatedAt: new Date() })
    .where(and(eq(courses.id, courseId), eq(courses.workspaceId, workspaceId)));
}

// Courses -------------------------------------------------------------------------

export async function createCourse(db: Db, workspaceId: string, input: z.infer<typeof courseInput>) {
  const [school, usage, used] = await Promise.all([
    readSchool(db, workspaceId),
    readPlanUsage(db, workspaceId),
    db.select({ color: courses.color }).from(courses).where(eq(courses.workspaceId, workspaceId)),
  ]);
  const problem = limitProblem(school.plan, "courses", usage.courses);
  if (problem) throw new UserError(problem);

  const [row] = await db
    .insert(courses)
    .values({
      workspaceId,
      title: input.title,
      description: input.description,
      category: input.category,
      color: input.color ?? nextCourseColor(used.map((c) => c.color)),
      listPrice: input.listPrice,
      price: input.price,
      outcomes: input.outcomes,
    })
    .returning({ id: courses.id });
  return row.id;
}

export async function updateCourse(db: Db, workspaceId: string, input: z.infer<typeof updateCourseInput>) {
  const [row] = await db
    .update(courses)
    .set({
      title: input.title,
      description: input.description,
      category: input.category,
      ...(input.color ? { color: input.color } : {}),
      listPrice: input.listPrice,
      price: input.price,
      outcomes: input.outcomes,
      updatedAt: new Date(),
    })
    .where(and(eq(courses.id, input.courseId), eq(courses.workspaceId, workspaceId)))
    .returning({ id: courses.id });
  ensure(row, NOT_FOUND.course);
}

export async function setCourseStatus(
  db: Db,
  workspaceId: string,
  input: { courseId: string; status: "draft" | "published" },
  now = new Date(),
) {
  const [course] = await db
    .select({ id: courses.id, publishedAt: courses.publishedAt })
    .from(courses)
    .where(and(eq(courses.id, input.courseId), eq(courses.workspaceId, workspaceId)));
  ensure(course, NOT_FOUND.course);
  if (input.status === "published") {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int`.mapWith(Number) })
      .from(lessons)
      .where(eq(lessons.courseId, course.id));
    if (n === 0) throw new UserError("레슨이 하나 이상 있어야 게시할 수 있어요. 커리큘럼에 레슨을 먼저 추가해 주세요.");
  }
  await db
    .update(courses)
    .set({
      status: input.status,
      publishedAt: input.status === "published" ? (course.publishedAt ?? now) : course.publishedAt,
      updatedAt: now,
    })
    .where(and(eq(courses.id, course.id), eq(courses.workspaceId, workspaceId)));
}

export async function deleteCourse(db: Db, workspaceId: string, courseId: string) {
  const [row] = await db
    .delete(courses)
    .where(and(eq(courses.id, courseId), eq(courses.workspaceId, workspaceId)))
    .returning({ title: courses.title });
  return ensure(row, NOT_FOUND.course).title;
}

// Sections -----------------------------------------------------------------------

export async function addSection(db: Db, workspaceId: string, input: { courseId: string; title: string }) {
  const [course] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, input.courseId), eq(courses.workspaceId, workspaceId)));
  ensure(course, NOT_FOUND.course);
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${sections.position}), 0)::int`.mapWith(Number) })
    .from(sections)
    .where(eq(sections.courseId, course.id));
  const [row] = await db
    .insert(sections)
    .values({ workspaceId, courseId: course.id, title: input.title, position: max + 1 })
    .returning({ id: sections.id });
  await touchCourse(db, workspaceId, course.id);
  return row.id;
}

async function findSection(db: Db, workspaceId: string, sectionId: string) {
  const [section] = await db
    .select()
    .from(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.workspaceId, workspaceId)));
  return ensure(section, NOT_FOUND.section);
}

export async function renameSection(db: Db, workspaceId: string, input: { sectionId: string; title: string }) {
  const section = await findSection(db, workspaceId, input.sectionId);
  await db
    .update(sections)
    .set({ title: input.title })
    .where(and(eq(sections.id, section.id), eq(sections.workspaceId, workspaceId)));
  await touchCourse(db, workspaceId, section.courseId);
}

export async function moveSection(db: Db, workspaceId: string, input: { id: string; direction: Direction }) {
  await db.transaction(async (tx) => {
    const section = await findSection(tx as unknown as Db, workspaceId, input.id);
    const [neighbour] = await tx
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.courseId, section.courseId),
          input.direction === "up" ? lt(sections.position, section.position) : gt(sections.position, section.position),
        ),
      )
      .orderBy(input.direction === "up" ? desc(sections.position) : asc(sections.position))
      .limit(1);
    if (!neighbour) return;
    await tx.update(sections).set({ position: neighbour.position }).where(eq(sections.id, section.id));
    await tx.update(sections).set({ position: section.position }).where(eq(sections.id, neighbour.id));
  });
}

export async function deleteSection(db: Db, workspaceId: string, sectionId: string) {
  const [row] = await db
    .delete(sections)
    .where(and(eq(sections.id, sectionId), eq(sections.workspaceId, workspaceId)))
    .returning({ courseId: sections.courseId, title: sections.title });
  const deleted = ensure(row, NOT_FOUND.section);
  await touchCourse(db, workspaceId, deleted.courseId);
  return deleted.title;
}

// Lessons -------------------------------------------------------------------------

async function nextLessonPosition(db: Db, sectionId: string) {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${lessons.position}), 0)::int`.mapWith(Number) })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));
  return max + 1;
}

export async function addLesson(db: Db, workspaceId: string, input: z.infer<typeof lessonInput>) {
  const section = await findSection(db, workspaceId, input.sectionId);
  const [row] = await db
    .insert(lessons)
    .values({
      workspaceId,
      courseId: section.courseId,
      sectionId: section.id,
      title: input.title,
      type: input.type,
      durationSeconds: input.duration,
      isPreview: input.isPreview,
      position: await nextLessonPosition(db, section.id),
    })
    .returning({ id: lessons.id });
  await touchCourse(db, workspaceId, section.courseId);
  return row.id;
}

async function findLesson(db: Db, workspaceId: string, lessonId: string) {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.workspaceId, workspaceId)));
  return ensure(lesson, NOT_FOUND.lesson);
}

export async function updateLesson(db: Db, workspaceId: string, input: z.infer<typeof updateLessonInput>) {
  const lesson = await findLesson(db, workspaceId, input.lessonId);
  let position = lesson.position;
  if (input.sectionId !== lesson.sectionId) {
    const target = await findSection(db, workspaceId, input.sectionId);
    if (target.courseId !== lesson.courseId) throw new UserError("같은 강의 안의 섹션으로만 옮길 수 있어요.");
    position = await nextLessonPosition(db, target.id);
  }
  await db
    .update(lessons)
    .set({
      sectionId: input.sectionId,
      title: input.title,
      type: input.type,
      durationSeconds: input.duration,
      isPreview: input.isPreview,
      position,
    })
    .where(and(eq(lessons.id, lesson.id), eq(lessons.workspaceId, workspaceId)));
  await touchCourse(db, workspaceId, lesson.courseId);
}

export async function moveLesson(db: Db, workspaceId: string, input: { id: string; direction: Direction }) {
  await db.transaction(async (tx) => {
    const lesson = await findLesson(tx as unknown as Db, workspaceId, input.id);
    const [neighbour] = await tx
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.sectionId, lesson.sectionId),
          input.direction === "up" ? lt(lessons.position, lesson.position) : gt(lessons.position, lesson.position),
        ),
      )
      .orderBy(input.direction === "up" ? desc(lessons.position) : asc(lessons.position))
      .limit(1);
    if (!neighbour) return;
    await tx.update(lessons).set({ position: neighbour.position }).where(eq(lessons.id, lesson.id));
    await tx.update(lessons).set({ position: lesson.position }).where(eq(lessons.id, neighbour.id));
  });
}

export async function deleteLesson(db: Db, workspaceId: string, lessonId: string) {
  const [row] = await db
    .delete(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.workspaceId, workspaceId)))
    .returning({ courseId: lessons.courseId, title: lessons.title });
  const deleted = ensure(row, NOT_FOUND.lesson);
  await touchCourse(db, workspaceId, deleted.courseId);
  return deleted.title;
}

// Registration and purchases (school) ----------------------------------------------------

async function upsertLearner(db: Db, workspaceId: string, input: { name: string; email: string }, now: Date) {
  const [learner] = await db
    .insert(learners)
    .values({ workspaceId, name: input.name, email: input.email, createdAt: now })
    .onConflictDoUpdate({ target: [learners.workspaceId, learners.email], set: { name: input.name } })
    .returning({ id: learners.id });
  return learner.id;
}

export interface EnrollmentReceipt {
  courseTitle: string;
  learnerName: string;
  amount: number;
  finishOn: string | null;
  sessions: number;
}

/** 수강 신청: a learner (by email), an enrollment with the chosen pace, and a payment record. */
export async function enroll(
  db: Db,
  workspaceId: string,
  input: z.infer<typeof enrollInput>,
  now = new Date(),
): Promise<EnrollmentReceipt> {
  return db.transaction(async (raw) => {
    const tx = raw as unknown as Db;
    const [course] = await tx
      .select()
      .from(courses)
      .where(and(eq(courses.id, input.courseId), eq(courses.workspaceId, workspaceId), eq(courses.status, "published")));
    if (!course) throw new UserError("지금은 수강 신청을 받지 않는 강의예요.");

    const ordered = await tx
      .select({ id: lessons.id, title: lessons.title, seconds: lessons.durationSeconds })
      .from(lessons)
      .innerJoin(sections, eq(lessons.sectionId, sections.id))
      .where(eq(lessons.courseId, course.id))
      .orderBy(asc(sections.position), asc(lessons.position));
    const pace = { sessionsPerWeek: input.sessionsPerWeek, minutesPerSession: input.minutesPerSession };
    const plan = buildStudyPlan(
      ordered.map((l) => ({ id: l.id, title: l.title, minutes: toMinutes(l.seconds) })),
      pace,
      dayKey(now),
    );
    const planFinishOn = plan.finishOn ?? dayKey(now);

    const learnerId = await upsertLearner(tx, workspaceId, input, now);
    const [existing] = await tx
      .select({ id: enrollments.id, status: enrollments.status })
      .from(enrollments)
      .where(and(eq(enrollments.learnerId, learnerId), eq(enrollments.courseId, course.id)));
    if (existing && existing.status !== "refunded") {
      throw new UserError("이미 이 강의를 수강 중인 이메일이에요. 다른 이메일로 신청하거나 기존 수강을 이어 가 주세요.");
    }

    const fresh = {
      status: "active" as const,
      progress: 0,
      ...pace,
      planFinishOn,
      enrolledAt: now,
      lastStudiedAt: null,
      completedAt: null,
    };
    if (existing) {
      await tx.update(enrollments).set(fresh).where(eq(enrollments.id, existing.id));
    } else {
      await tx.insert(enrollments).values({ workspaceId, learnerId, courseId: course.id, ...fresh });
    }
    if (course.price > 0) {
      await tx.insert(payments).values({
        workspaceId,
        learnerId,
        kind: "course",
        courseId: course.id,
        itemTitle: course.title,
        amount: course.price,
        paidAt: now,
      });
    }
    return {
      courseTitle: course.title,
      learnerName: input.name,
      amount: course.price,
      finishOn: plan.finishOn,
      sessions: plan.sessions.length,
    };
  });
}

export async function purchaseProduct(db: Db, workspaceId: string, input: z.infer<typeof purchaseInput>, now = new Date()) {
  return db.transaction(async (raw) => {
    const tx = raw as unknown as Db;
    const [product] = await tx
      .select()
      .from(products)
      .where(and(eq(products.id, input.productId), eq(products.workspaceId, workspaceId), eq(products.status, "on_sale")));
    if (!product) throw new UserError("지금은 판매하지 않는 상품이에요.");
    const learnerId = await upsertLearner(tx, workspaceId, input, now);
    await tx.insert(payments).values({
      workspaceId,
      learnerId,
      kind: "product",
      productId: product.id,
      itemTitle: product.title,
      amount: product.price,
      paidAt: now,
    });
    return { title: product.title, amount: product.price, learnerName: input.name };
  });
}

/** Marks a payment refunded; a refunded course payment also closes the enrollment. */
export async function refundPayment(db: Db, workspaceId: string, paymentId: string, now = new Date()) {
  return db.transaction(async (raw) => {
    const tx = raw as unknown as Db;
    const [payment] = await tx
      .select()
      .from(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.workspaceId, workspaceId)));
    ensure(payment, NOT_FOUND.payment);
    if (payment.status === "refunded") throw new UserError("이미 환불된 결제예요.");
    await tx.update(payments).set({ status: "refunded", refundedAt: now }).where(eq(payments.id, payment.id));
    if (payment.kind === "course" && payment.learnerId && payment.courseId) {
      await tx
        .update(enrollments)
        .set({ status: "refunded" })
        .where(
          and(
            eq(enrollments.learnerId, payment.learnerId),
            eq(enrollments.courseId, payment.courseId),
            eq(enrollments.workspaceId, workspaceId),
          ),
        );
    }
    return payment;
  });
}

export async function deleteLearner(db: Db, workspaceId: string, learnerId: string) {
  const [row] = await db
    .delete(learners)
    .where(and(eq(learners.id, learnerId), eq(learners.workspaceId, workspaceId)))
    .returning({ name: learners.name });
  return ensure(row, NOT_FOUND.learner).name;
}

// Products -------------------------------------------------------------------------

export async function createProduct(db: Db, workspaceId: string, input: z.infer<typeof productInput>) {
  const [school, usage] = await Promise.all([readSchool(db, workspaceId), readPlanUsage(db, workspaceId)]);
  const problem = limitProblem(school.plan, "products", usage.products);
  if (problem) throw new UserError(problem);
  const [row] = await db.insert(products).values({ workspaceId, ...input }).returning({ id: products.id });
  return row.id;
}

export async function updateProduct(db: Db, workspaceId: string, input: z.infer<typeof updateProductInput>) {
  const { productId, ...fields } = input;
  const [row] = await db
    .update(products)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(products.id, productId), eq(products.workspaceId, workspaceId)))
    .returning({ id: products.id });
  ensure(row, NOT_FOUND.product);
}

export async function setProductStatus(
  db: Db,
  workspaceId: string,
  input: { productId: string; status: "on_sale" | "paused" },
) {
  const [row] = await db
    .update(products)
    .set({ status: input.status, updatedAt: new Date() })
    .where(and(eq(products.id, input.productId), eq(products.workspaceId, workspaceId)))
    .returning({ id: products.id });
  ensure(row, NOT_FOUND.product);
}

export async function deleteProduct(db: Db, workspaceId: string, productId: string) {
  const [row] = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.workspaceId, workspaceId)))
    .returning({ title: products.title });
  return ensure(row, NOT_FOUND.product).title;
}

// School and plan ---------------------------------------------------------------------

export async function changePlan(db: Db, workspaceId: string, input: z.infer<typeof planInput>, now = new Date()) {
  const usage = await readPlanUsage(db, workspaceId);
  const problem = downgradeProblem(input.plan, usage);
  if (problem) throw new UserError(problem);
  await db
    .insert(schools)
    .values({ workspaceId, name: "내 스쿨", creatorName: "강사", plan: input.plan, billing: input.billing, planChangedAt: now })
    .onConflictDoUpdate({
      target: schools.workspaceId,
      set: { plan: input.plan, billing: input.billing, planChangedAt: now },
    });
}

export async function updateSchool(db: Db, workspaceId: string, input: z.infer<typeof schoolInput>) {
  await db
    .insert(schools)
    .values({ workspaceId, name: input.name, creatorName: input.creatorName })
    .onConflictDoUpdate({ target: schools.workspaceId, set: { name: input.name, creatorName: input.creatorName } });
}

// Curriculum draft ---------------------------------------------------------------------

/** Inserts a drafted curriculum into a course that has no sections yet. */
export async function applyCurriculumDraft(db: Db, workspaceId: string, courseId: string, draft: CurriculumDraft) {
  return db.transaction(async (raw) => {
    const tx = raw as unknown as Db;
    const [course] = await tx
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.workspaceId, workspaceId)));
    ensure(course, NOT_FOUND.course);
    const [{ n }] = await tx
      .select({ n: sql<number>`count(*)::int`.mapWith(Number) })
      .from(sections)
      .where(eq(sections.courseId, course.id));
    if (n > 0) throw new UserError("커리큘럼이 비어 있을 때만 초안을 넣을 수 있어요.");

    let lessonCount = 0;
    for (const [index, section] of draft.sections.entries()) {
      const [row] = await tx
        .insert(sections)
        .values({ workspaceId, courseId: course.id, title: section.title, position: index + 1 })
        .returning({ id: sections.id });
      await tx.insert(lessons).values(
        section.lessons.map((lesson, position) => ({
          workspaceId,
          courseId: course.id,
          sectionId: row.id,
          title: lesson.title,
          type: lesson.type,
          durationSeconds: lesson.minutes * 60,
          isPreview: lesson.isPreview,
          position: position + 1,
        })),
      );
      lessonCount += section.lessons.length;
    }
    await tx.update(courses).set({ updatedAt: new Date() }).where(eq(courses.id, course.id));
    return { sections: draft.sections.length, lessons: lessonCount };
  });
}
