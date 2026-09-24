import { boolean, date, index, integer, pgSchema, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * 에듀마켓 tables (Postgres schema `online_education`).
 *
 * Every table is scoped to a workspace (the tenant). Payments keep a snapshot of
 * the item title so revenue history survives deleting a course or product.
 */
export const s = pgSchema("online_education");

export const courseStatus = s.enum("course_status", ["draft", "published"]);
export const courseCategory = s.enum("course_category", ["programming", "design", "data", "marketing"]);
export const courseColor = s.enum("course_color", [
  "sky",
  "pink",
  "mint",
  "tangerine",
  "lavender",
  "tomato",
  "lime",
  "lemon",
]);
export const lessonType = s.enum("lesson_type", ["video", "text", "quiz"]);
export const productType = s.enum("product_type", ["notion", "pdf", "sheet"]);
export const productStatus = s.enum("product_status", ["on_sale", "paused"]);
export const enrollmentStatus = s.enum("enrollment_status", ["active", "completed", "refunded"]);
export const paymentKind = s.enum("payment_kind", ["course", "product"]);
export const paymentStatus = s.enum("payment_status", ["paid", "refunded"]);
export const planTier = s.enum("plan_tier", ["free", "basic", "pro"]);
export const billingCycle = s.enum("billing_cycle", ["monthly", "yearly"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** One school (storefront + subscription plan) per workspace. */
export const schools = s.table("schools", {
  workspaceId: tenant().primaryKey(),
  name: text().notNull(),
  creatorName: text().notNull(),
  plan: planTier().notNull().default("basic"),
  billing: billingCycle().notNull().default("monthly"),
  planChangedAt: createdAt(),
});

export const courses = s.table(
  "courses",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    title: text().notNull(),
    description: text().notNull(),
    category: courseCategory().notNull(),
    color: courseColor().notNull(),
    /** 정가 (won). */
    listPrice: integer().notNull(),
    /** 판매가 (won), never above the list price. */
    price: integer().notNull(),
    /** "이런 걸 배워요" lines. */
    outcomes: text().array().notNull(),
    status: courseStatus().notNull().default("draft"),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt)],
);

export const sections = s.table(
  "sections",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text().notNull(),
    position: integer().notNull(),
  },
  (t) => [index().on(t.courseId, t.position)],
);

export const lessons = s.table(
  "lessons",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    sectionId: uuid()
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    title: text().notNull(),
    type: lessonType().notNull(),
    durationSeconds: integer().notNull(),
    isPreview: boolean().notNull().default(false),
    position: integer().notNull(),
  },
  (t) => [index().on(t.sectionId, t.position), index().on(t.courseId)],
);

/** Anyone who registered for a course or bought a product. */
export const learners = s.table(
  "learners",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    email: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [unique().on(t.workspaceId, t.email), index().on(t.workspaceId, t.createdAt)],
);

export const enrollments = s.table(
  "enrollments",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    learnerId: uuid()
      .notNull()
      .references(() => learners.id, { onDelete: "cascade" }),
    courseId: uuid()
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    status: enrollmentStatus().notNull().default("active"),
    /** 0–100. */
    progress: integer().notNull().default(0),
    /** The learner's chosen pace ("내 시간표"). */
    sessionsPerWeek: integer().notNull(),
    minutesPerSession: integer().notNull(),
    /** Planned finish day (Asia/Seoul) computed from runtime and pace at registration. */
    planFinishOn: date({ mode: "string" }).notNull(),
    enrolledAt: createdAt(),
    lastStudiedAt: timestamp({ withTimezone: true }),
    completedAt: timestamp({ withTimezone: true }),
  },
  (t) => [unique().on(t.learnerId, t.courseId), index().on(t.courseId), index().on(t.workspaceId, t.enrolledAt)],
);

export const products = s.table(
  "products",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    title: text().notNull(),
    type: productType().notNull(),
    description: text().notNull(),
    price: integer().notNull(),
    status: productStatus().notNull().default("on_sale"),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt)],
);

export const payments = s.table(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    learnerId: uuid().references(() => learners.id, { onDelete: "set null" }),
    kind: paymentKind().notNull(),
    courseId: uuid().references(() => courses.id, { onDelete: "set null" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    /** Title at the time of sale. */
    itemTitle: text().notNull(),
    amount: integer().notNull(),
    status: paymentStatus().notNull().default("paid"),
    paidAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    refundedAt: timestamp({ withTimezone: true }),
  },
  (t) => [index().on(t.workspaceId, t.paidAt), index().on(t.learnerId), index().on(t.courseId), index().on(t.productId)],
);

export const schema = {
  s,
  courseStatus,
  courseCategory,
  courseColor,
  lessonType,
  productType,
  productStatus,
  enrollmentStatus,
  paymentKind,
  paymentStatus,
  planTier,
  billingCycle,
  schools,
  courses,
  sections,
  lessons,
  learners,
  enrollments,
  products,
  payments,
};

export type Schema = typeof schema;
export type Course = typeof courses.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Learner = typeof learners.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type School = typeof schools.$inferSelect;
export type CourseColor = (typeof courseColor.enumValues)[number];
export type CourseCategory = (typeof courseCategory.enumValues)[number];
export type LessonType = (typeof lessonType.enumValues)[number];
export type ProductType = (typeof productType.enumValues)[number];
export type PlanTier = (typeof planTier.enumValues)[number];
export type BillingCycle = (typeof billingCycle.enumValues)[number];
