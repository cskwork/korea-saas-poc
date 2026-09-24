import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
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
  type CourseColor,
  type Schema,
} from "../db/schema";
import { addDays, addMonths, dayKey, monthKey, startOfDay } from "../domain/calendar";
import { toMinutes } from "../domain/duration";
import { planOf } from "../domain/plans";
import { monthlySeries, monthToDate, revenueByItem, revenueSplit, type RevenuePayment } from "../domain/revenue";
import { expectedProgress, paceStatus, type PaceStatus } from "../domain/study-plan";
import { weekStart, weekTimetable } from "../domain/week";

/**
 * Read models. Every function takes the database and the tenant explicitly so
 * it can run in tests; `queries.ts` binds them to the request's workspace.
 */

type Db = Database<Schema>;

const int = (expression: ReturnType<typeof sql>) => sql<number>`coalesce(${expression}, 0)::int`.mapWith(Number);

// School ----------------------------------------------------------------------

export async function readSchool(db: Db, workspaceId: string) {
  const [school] = await db.select().from(schools).where(eq(schools.workspaceId, workspaceId)).limit(1);
  return school ?? { workspaceId, name: "내 스쿨", creatorName: "강사", plan: "basic" as const, billing: "monthly" as const, planChangedAt: new Date(0) };
}

export async function readPlanUsage(db: Db, workspaceId: string) {
  const [[courseCount], [productCount], [studentCount]] = await Promise.all([
    db.select({ n: int(sql`count(*)`) }).from(courses).where(eq(courses.workspaceId, workspaceId)),
    db.select({ n: int(sql`count(*)`) }).from(products).where(eq(products.workspaceId, workspaceId)),
    db
      .select({ n: int(sql`count(distinct ${enrollments.learnerId})`) })
      .from(enrollments)
      .where(and(eq(enrollments.workspaceId, workspaceId), sql`${enrollments.status} <> 'refunded'`)),
  ]);
  return { courses: courseCount.n, products: productCount.n, students: studentCount.n };
}

// Courses -----------------------------------------------------------------------

export type CourseSort = "recent" | "students" | "revenue" | "title";

export interface CourseFilters {
  q?: string;
  status?: "draft" | "published";
  sort?: CourseSort;
}

export async function readCourseSummaries(db: Db, workspaceId: string, filters: CourseFilters = {}) {
  const [courseRows, sectionRows, lessonRows, studentStats, revenueStats] = await Promise.all([
    db.select().from(courses).where(eq(courses.workspaceId, workspaceId)).orderBy(desc(courses.createdAt)),
    db
      .select({ id: sections.id, courseId: sections.courseId })
      .from(sections)
      .where(eq(sections.workspaceId, workspaceId))
      .orderBy(asc(sections.position)),
    db
      .select({ sectionId: lessons.sectionId, seconds: lessons.durationSeconds, isPreview: lessons.isPreview })
      .from(lessons)
      .where(eq(lessons.workspaceId, workspaceId))
      .orderBy(asc(lessons.position)),
    db
      .select({ courseId: enrollments.courseId, students: int(sql`count(*)`) })
      .from(enrollments)
      .where(and(eq(enrollments.workspaceId, workspaceId), sql`${enrollments.status} <> 'refunded'`))
      .groupBy(enrollments.courseId),
    db
      .select({ courseId: payments.courseId, revenue: int(sql`sum(${payments.amount})`) })
      .from(payments)
      .where(and(eq(payments.workspaceId, workspaceId), eq(payments.kind, "course"), eq(payments.status, "paid")))
      .groupBy(payments.courseId),
  ]);

  const studentMap = new Map(studentStats.map((row) => [row.courseId, row.students]));
  const revenueMap = new Map(revenueStats.map((row) => [row.courseId, row.revenue]));

  const rows = courseRows.map((course) => {
    const own = sectionRows.filter((section) => section.courseId === course.id);
    /** Lesson seconds per section, in order: the course's timetable silhouette. */
    const shape = own.map((section) => lessonRows.filter((l) => l.sectionId === section.id).map((l) => l.seconds));
    const ownLessons = lessonRows.filter((l) => own.some((section) => section.id === l.sectionId));
    return {
      ...course,
      shape,
      sectionCount: own.length,
      lessonCount: ownLessons.length,
      runtimeSeconds: ownLessons.reduce((sum, l) => sum + l.seconds, 0),
      previewCount: ownLessons.filter((l) => l.isPreview).length,
      studentCount: studentMap.get(course.id) ?? 0,
      revenue: revenueMap.get(course.id) ?? 0,
    };
  });

  const q = filters.q?.trim().toLowerCase();
  const filtered = rows.filter(
    (row) =>
      (!filters.status || row.status === filters.status) &&
      (!q || row.title.toLowerCase().includes(q) || row.description.toLowerCase().includes(q)),
  );
  const sorters: Record<CourseSort, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    recent: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    students: (a, b) => b.studentCount - a.studentCount,
    revenue: (a, b) => b.revenue - a.revenue,
    title: (a, b) => a.title.localeCompare(b.title, "ko"),
  };
  return { all: rows, rows: filtered.sort(sorters[filters.sort ?? "recent"]) };
}

export type CourseSummary = Awaited<ReturnType<typeof readCourseSummaries>>["rows"][number];

/** A course with its ordered curriculum, or null when it is not in this workspace. */
export async function readCourse(db: Db, workspaceId: string, courseId: string) {
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.workspaceId, workspaceId)))
    .limit(1);
  if (!course) return null;

  const [sectionRows, lessonRows, [students], [revenue]] = await Promise.all([
    db.select().from(sections).where(eq(sections.courseId, course.id)).orderBy(asc(sections.position)),
    db.select().from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.position)),
    db
      .select({ n: int(sql`count(*)`) })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, course.id), sql`${enrollments.status} <> 'refunded'`)),
    db
      .select({ n: int(sql`sum(${payments.amount})`) })
      .from(payments)
      .where(and(eq(payments.courseId, course.id), eq(payments.workspaceId, workspaceId), eq(payments.status, "paid"))),
  ]);

  const curriculum = sectionRows.map((section) => ({
    ...section,
    lessons: lessonRows.filter((lesson) => lesson.sectionId === section.id),
  }));
  const allLessons = curriculum.flatMap((section) => section.lessons);
  return {
    course,
    sections: curriculum,
    stats: {
      sectionCount: curriculum.length,
      lessonCount: allLessons.length,
      runtimeSeconds: allLessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0),
      previewCount: allLessons.filter((lesson) => lesson.isPreview).length,
      studentCount: students.n,
      revenue: revenue.n,
    },
    /** Lessons in curriculum order, as the study planner consumes them. */
    planLessons: allLessons.map((lesson) => ({ id: lesson.id, title: lesson.title, minutes: toMinutes(lesson.durationSeconds) })),
  };
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof readCourse>>>;

// Payments ----------------------------------------------------------------------

async function readRevenuePayments(db: Db, workspaceId: string, since?: Date): Promise<RevenuePayment[]> {
  return db
    .select({
      kind: payments.kind,
      amount: payments.amount,
      status: payments.status,
      paidAt: payments.paidAt,
      courseId: payments.courseId,
      productId: payments.productId,
      itemTitle: payments.itemTitle,
    })
    .from(payments)
    .where(and(eq(payments.workspaceId, workspaceId), since ? gte(payments.paidAt, since) : undefined));
}

// Dashboard ----------------------------------------------------------------------

export async function readDashboard(db: Db, workspaceId: string, now: Date, weekOffset: number) {
  const monday = weekStart(now, weekOffset);
  const weekFrom = startOfDay(monday);
  const weekTo = startOfDay(addDays(monday, 7));
  const lastMonthStart = startOfDay(`${addMonths(monthKey(now), -1)}-01`);

  const [weekRows, recentPayments, recent, courseSummaries, school] = await Promise.all([
    db
      .select({
        id: payments.id,
        kind: payments.kind,
        amount: payments.amount,
        paidAt: payments.paidAt,
        itemTitle: payments.itemTitle,
        color: courses.color,
      })
      .from(payments)
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .where(
        and(
          eq(payments.workspaceId, workspaceId),
          eq(payments.status, "paid"),
          gte(payments.paidAt, weekFrom),
          lt(payments.paidAt, weekTo),
        ),
      ),
    readRevenuePayments(db, workspaceId, lastMonthStart),
    db
      .select({
        id: enrollments.id,
        enrolledAt: enrollments.enrolledAt,
        learnerId: learners.id,
        learnerName: learners.name,
        courseTitle: courses.title,
        color: courses.color,
        sessionsPerWeek: enrollments.sessionsPerWeek,
        minutesPerSession: enrollments.minutesPerSession,
      })
      .from(enrollments)
      .innerJoin(learners, eq(enrollments.learnerId, learners.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.workspaceId, workspaceId))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(6),
    readCourseSummaries(db, workspaceId),
    readSchool(db, workspaceId),
  ]);

  const timetable = weekTimetable(
    weekRows.map((row) => ({ ...row, color: row.kind === "course" ? row.color : null })),
    monday,
    now,
  );
  const thisMonth = recentPayments.filter((p) => monthKey(p.paidAt) === monthKey(now));

  const colorOf = new Map(courseSummaries.all.map((course) => [course.id, course.color]));
  const courseShares = revenueByItem(thisMonth)
    .filter((item) => item.kind === "course" && item.revenue > 0)
    .map((item) => ({ key: item.key, title: item.title, revenue: item.revenue, color: item.id ? (colorOf.get(item.id) ?? null) : null }));

  return {
    school,
    timetable,
    weekOffset,
    month: monthToDate(recentPayments, now),
    split: revenueSplit(thisMonth),
    courseShares,
    courses: courseSummaries.all,
    drafts: courseSummaries.all.filter((course) => course.status === "draft"),
    recentEnrollments: recent,
  };
}

// Students ------------------------------------------------------------------------

export type StudentFilter = "all" | "learning" | "behind" | "completed" | "buyers";
export type StudentSort = "recent" | "paid" | "progress" | "name";
export const STUDENTS_PAGE_SIZE = 30;

export interface StudentFilters {
  q?: string;
  filter?: StudentFilter;
  courseId?: string;
  sort?: StudentSort;
  page?: number;
}

export async function readStudents(db: Db, workspaceId: string, now: Date, filters: StudentFilters = {}) {
  const today = dayKey(now);
  const [learnerRows, enrollmentRows, paidRows, courseRows] = await Promise.all([
    db.select().from(learners).where(eq(learners.workspaceId, workspaceId)),
    db
      .select({
        id: enrollments.id,
        learnerId: enrollments.learnerId,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        enrolledAt: enrollments.enrolledAt,
        planFinishOn: enrollments.planFinishOn,
        courseTitle: courses.title,
        color: courses.color,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.workspaceId, workspaceId))
      .orderBy(asc(enrollments.enrolledAt)),
    db
      .select({ learnerId: payments.learnerId, paid: int(sql`sum(${payments.amount})`), purchases: int(sql`count(*)`) })
      .from(payments)
      .where(and(eq(payments.workspaceId, workspaceId), eq(payments.status, "paid")))
      .groupBy(payments.learnerId),
    db
      .select({ id: courses.id, title: courses.title, color: courses.color })
      .from(courses)
      .where(eq(courses.workspaceId, workspaceId))
      .orderBy(asc(courses.createdAt)),
  ]);

  const paidMap = new Map(paidRows.map((row) => [row.learnerId, row]));
  const enrollmentsByLearner = new Map<string, StudentEnrollment[]>();
  for (const row of enrollmentRows) {
    const expected = expectedProgress(dayKey(row.enrolledAt), row.planFinishOn, today);
    const entry: StudentEnrollment = { ...row, expected, pace: paceStatus({ status: row.status, progress: row.progress, expected }) };
    enrollmentsByLearner.set(row.learnerId, [...(enrollmentsByLearner.get(row.learnerId) ?? []), entry]);
  }

  const rows = learnerRows.map((learner) => {
    const own = enrollmentsByLearner.get(learner.id) ?? [];
    const live = own.filter((e) => e.status !== "refunded");
    return {
      ...learner,
      enrollments: own,
      totalPaid: paidMap.get(learner.id)?.paid ?? 0,
      purchases: paidMap.get(learner.id)?.purchases ?? 0,
      averageProgress: live.length > 0 ? Math.round(live.reduce((sum, e) => sum + e.progress, 0) / live.length) : null,
      isBehind: live.some((e) => e.pace === "behind"),
      isLearning: live.some((e) => e.status === "active"),
      hasCompleted: live.some((e) => e.pace === "completed"),
    };
  });

  const liveEnrollments = enrollmentRows.filter((e) => e.status !== "refunded");
  const summary = {
    learners: rows.length,
    students: rows.filter((row) => row.enrollments.some((e) => e.status !== "refunded")).length,
    averageProgress:
      liveEnrollments.length > 0
        ? Math.round(liveEnrollments.reduce((sum, e) => sum + e.progress, 0) / liveEnrollments.length)
        : 0,
    behind: rows.filter((row) => row.isBehind).length,
    totalPaid: rows.reduce((sum, row) => sum + row.totalPaid, 0),
  };

  const q = filters.q?.trim().toLowerCase();
  const filter = filters.filter ?? "all";
  const matches = rows.filter((row) => {
    if (q && !row.name.toLowerCase().includes(q) && !row.email.includes(q)) return false;
    if (filters.courseId && !row.enrollments.some((e) => e.courseId === filters.courseId)) return false;
    switch (filter) {
      case "learning":
        return row.isLearning;
      case "behind":
        return row.isBehind;
      case "completed":
        return row.hasCompleted;
      case "buyers":
        return row.enrollments.length === 0;
      default:
        return true;
    }
  });
  const sorters: Record<StudentSort, (a: (typeof rows)[number], b: (typeof rows)[number]) => number> = {
    recent: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    paid: (a, b) => b.totalPaid - a.totalPaid,
    progress: (a, b) => (b.averageProgress ?? -1) - (a.averageProgress ?? -1),
    name: (a, b) => a.name.localeCompare(b.name, "ko"),
  };
  matches.sort(sorters[filters.sort ?? "recent"]);

  const pageCount = Math.max(1, Math.ceil(matches.length / STUDENTS_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page ?? 1), pageCount);
  return {
    summary,
    courses: courseRows,
    total: matches.length,
    page,
    pageCount,
    rows: matches.slice((page - 1) * STUDENTS_PAGE_SIZE, page * STUDENTS_PAGE_SIZE),
  };
}

export interface StudentEnrollment {
  id: string;
  learnerId: string;
  courseId: string;
  status: "active" | "completed" | "refunded";
  progress: number;
  enrolledAt: Date;
  planFinishOn: string;
  courseTitle: string;
  color: CourseColor;
  expected: number;
  pace: PaceStatus;
}

export type StudentRow = Awaited<ReturnType<typeof readStudents>>["rows"][number];

export async function readStudent(db: Db, workspaceId: string, learnerId: string, now: Date) {
  const [learner] = await db
    .select()
    .from(learners)
    .where(and(eq(learners.id, learnerId), eq(learners.workspaceId, workspaceId)))
    .limit(1);
  if (!learner) return null;
  const today = dayKey(now);
  const [enrollmentRows, paymentRows] = await Promise.all([
    db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        status: enrollments.status,
        progress: enrollments.progress,
        sessionsPerWeek: enrollments.sessionsPerWeek,
        minutesPerSession: enrollments.minutesPerSession,
        planFinishOn: enrollments.planFinishOn,
        enrolledAt: enrollments.enrolledAt,
        lastStudiedAt: enrollments.lastStudiedAt,
        completedAt: enrollments.completedAt,
        courseTitle: courses.title,
        color: courses.color,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.learnerId, learner.id))
      .orderBy(desc(enrollments.enrolledAt)),
    db
      .select()
      .from(payments)
      .where(and(eq(payments.learnerId, learner.id), eq(payments.workspaceId, workspaceId)))
      .orderBy(desc(payments.paidAt)),
  ]);
  return {
    learner,
    enrollments: enrollmentRows.map((row) => {
      const expected = expectedProgress(dayKey(row.enrolledAt), row.planFinishOn, today);
      return { ...row, expected, pace: paceStatus({ status: row.status, progress: row.progress, expected }) };
    }),
    payments: paymentRows,
    totalPaid: paymentRows.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
  };
}

export type StudentDetail = NonNullable<Awaited<ReturnType<typeof readStudent>>>;

// Products -----------------------------------------------------------------------

export type ProductSort = "recent" | "sales" | "revenue" | "price";

export async function readProducts(
  db: Db,
  workspaceId: string,
  filters: { type?: "notion" | "pdf" | "sheet"; sort?: ProductSort } = {},
) {
  const [productRows, stats] = await Promise.all([
    db.select().from(products).where(eq(products.workspaceId, workspaceId)).orderBy(desc(products.createdAt)),
    db
      .select({
        productId: payments.productId,
        sales: int(sql`count(*) filter (where ${payments.status} = 'paid')`),
        revenue: int(sql`sum(${payments.amount}) filter (where ${payments.status} = 'paid')`),
        refunds: int(sql`count(*) filter (where ${payments.status} = 'refunded')`),
        lastSoldAt: sql<Date | null>`max(${payments.paidAt})`.mapWith(payments.paidAt),
      })
      .from(payments)
      .where(and(eq(payments.workspaceId, workspaceId), eq(payments.kind, "product")))
      .groupBy(payments.productId),
  ]);
  const statMap = new Map(stats.map((row) => [row.productId, row]));
  const all = productRows.map((product) => ({
    ...product,
    sales: statMap.get(product.id)?.sales ?? 0,
    revenue: statMap.get(product.id)?.revenue ?? 0,
    refunds: statMap.get(product.id)?.refunds ?? 0,
    lastSoldAt: statMap.get(product.id)?.lastSoldAt ?? null,
  }));
  const sorters: Record<ProductSort, (a: (typeof all)[number], b: (typeof all)[number]) => number> = {
    recent: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    sales: (a, b) => b.sales - a.sales,
    revenue: (a, b) => b.revenue - a.revenue,
    price: (a, b) => b.price - a.price,
  };
  const rows = all.filter((p) => !filters.type || p.type === filters.type).sort(sorters[filters.sort ?? "recent"]);
  return {
    all,
    rows,
    totals: {
      count: all.length,
      sales: all.reduce((sum, p) => sum + p.sales, 0),
      revenue: all.reduce((sum, p) => sum + p.revenue, 0),
    },
  };
}

export type ProductRow = Awaited<ReturnType<typeof readProducts>>["rows"][number];

export async function readProduct(db: Db, workspaceId: string, productId: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.workspaceId, workspaceId)))
    .limit(1);
  if (!product) return null;
  const [stats] = await db
    .select({
      sales: int(sql`count(*) filter (where ${payments.status} = 'paid')`),
      revenue: int(sql`sum(${payments.amount}) filter (where ${payments.status} = 'paid')`),
    })
    .from(payments)
    .where(and(eq(payments.productId, product.id), eq(payments.workspaceId, workspaceId)));
  return { product, sales: stats?.sales ?? 0, revenue: stats?.revenue ?? 0 };
}

// Revenue ------------------------------------------------------------------------

export async function readRevenue(db: Db, workspaceId: string, now: Date, months: number) {
  const [all, courseRows] = await Promise.all([
    readRevenuePayments(db, workspaceId),
    db
      .select({ id: courses.id, title: courses.title, color: courses.color })
      .from(courses)
      .where(eq(courses.workspaceId, workspaceId)),
  ]);
  const series = monthlySeries(all, now, months);
  const firstMonth = series[0]?.month ?? monthKey(now);
  const inRange = all.filter((p) => monthKey(p.paidAt) >= firstMonth);
  return {
    series,
    month: monthToDate(all, now),
    lifetime: revenueSplit(all),
    period: revenueSplit(inRange),
    items: revenueByItem(inRange),
    refunds: inRange.filter((p) => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0),
    courseColors: Object.fromEntries(courseRows.map((c) => [c.id, c.color])) as Record<string, CourseColor>,
    courseTitles: Object.fromEntries(courseRows.map((c) => [c.id, c.title])) as Record<string, string>,
  };
}

export type RevenueReport = Awaited<ReturnType<typeof readRevenue>>;

// School (public) ------------------------------------------------------------------

export async function readStorefront(db: Db, workspaceId: string) {
  const [school, summaries, productList] = await Promise.all([
    readSchool(db, workspaceId),
    readCourseSummaries(db, workspaceId),
    readProducts(db, workspaceId),
  ]);
  return {
    school,
    courses: summaries.all.filter((course) => course.status === "published"),
    products: productList.all.filter((product) => product.status === "on_sale"),
  };
}

export async function readPlan(db: Db, workspaceId: string) {
  const [school, usage] = await Promise.all([readSchool(db, workspaceId), readPlanUsage(db, workspaceId)]);
  return { school, usage, plan: planOf(school.plan) };
}
