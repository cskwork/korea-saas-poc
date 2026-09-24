import type { Database } from "@/core/db/connection";
import { addMonths, dayKey, daysInMonth, monthKey, seoulInstant, seoulParts } from "../domain/calendar";
import { parseDuration, toMinutes } from "../domain/duration";
import { buildStudyPlan, expectedProgress, type Pace } from "../domain/study-plan";
import {
  courses,
  enrollments,
  learners,
  lessons,
  payments,
  products,
  schema,
  schools,
  sections,
} from "./schema";
import { FIRST_LEARNERS, GIVEN_NAMES, SEED_COURSES, SEED_PRODUCTS, SEED_SCHOOL, SURNAMES } from "./seed-content";

type Db = Database<typeof schema>;
type NewLearner = typeof learners.$inferInsert;
type NewEnrollment = typeof enrollments.$inferInsert;
type NewPayment = typeof payments.$inferInsert;

const DAY_MS = 86_400_000;

/** Small deterministic PRNG so every workspace gets the same shaped story. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)];
  const weighted = <T>(items: readonly { value: T; weight: number }[]) => {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = next() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return items[items.length - 1].value;
  };
  return { next, int, pick, weighted };
}

/** Evening-heavy purchase hours (Seoul), as solo-creator sales usually are. */
const HOUR_WEIGHTS = [
  { value: 8, weight: 1 },
  { value: 9, weight: 1.5 },
  { value: 10, weight: 2 },
  { value: 11, weight: 2 },
  { value: 12, weight: 3.5 },
  { value: 13, weight: 3 },
  { value: 14, weight: 2 },
  { value: 15, weight: 2 },
  { value: 16, weight: 2 },
  { value: 17, weight: 2.5 },
  { value: 18, weight: 3 },
  { value: 19, weight: 4 },
  { value: 20, weight: 5.5 },
  { value: 21, weight: 6.5 },
  { value: 22, weight: 6 },
  { value: 23, weight: 3.5 },
];

const PACE_WEIGHTS: { value: Pace; weight: number }[] = [
  { value: { sessionsPerWeek: 3, minutesPerSession: 30 }, weight: 6 },
  { value: { sessionsPerWeek: 2, minutesPerSession: 45 }, weight: 3 },
  { value: { sessionsPerWeek: 5, minutesPerSession: 20 }, weight: 3 },
  { value: { sessionsPerWeek: 3, minutesPerSession: 60 }, weight: 2 },
  { value: { sessionsPerWeek: 7, minutesPerSession: 20 }, weight: 1 },
  { value: { sessionsPerWeek: 2, minutesPerSession: 30 }, weight: 2 },
];

/** Inserts in chunks (Postgres caps bind parameters per statement). */
async function insertChunked<T>(rows: T[], insert: (chunk: T[]) => Promise<unknown>, size = 200) {
  for (let i = 0; i < rows.length; i += size) await insert(rows.slice(i, i + size));
}

/**
 * Demo data for a new workspace, relative to `now` (Asia/Seoul): four courses
 * (one draft), four digital products and twelve months of registrations and
 * sales growing month over month, with a few refunds.
 */
export async function seedOnlineEducation(db: Db, workspaceId: string, now: Date = new Date()): Promise<void> {
  const random = createRandom(20260924);
  const today = dayKey(now);
  const currentMonth = monthKey(now);
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);

  await db.insert(schools).values({ workspaceId, ...SEED_SCHOOL, plan: "basic", billing: "monthly", planChangedAt: ago(150) });

  // Catalogue ---------------------------------------------------------------
  const courseRows = SEED_COURSES.map((course) => {
    const createdAt = ago(course.createdDaysAgo);
    return {
      seed: course,
      row: {
        id: crypto.randomUUID(),
        workspaceId,
        title: course.title,
        description: course.description,
        category: course.category,
        color: course.color,
        listPrice: course.listPrice,
        price: course.price,
        outcomes: course.outcomes,
        status: course.published ? ("published" as const) : ("draft" as const),
        publishedAt: course.published ? new Date(createdAt.getTime() + 6 * DAY_MS) : null,
        createdAt,
        updatedAt: course.published ? new Date(createdAt.getTime() + 6 * DAY_MS) : ago(2),
      },
    };
  });
  await db.insert(courses).values(courseRows.map((c) => c.row));

  const sectionRows: (typeof sections.$inferInsert)[] = [];
  const lessonRows: (typeof lessons.$inferInsert)[] = [];
  const planLessons = new Map<string, { id: string; title: string; minutes: number }[]>();
  for (const { seed, row } of courseRows) {
    const ordered: { id: string; title: string; minutes: number }[] = [];
    seed.sections.forEach((section, sectionIndex) => {
      const sectionId = crypto.randomUUID();
      sectionRows.push({ id: sectionId, workspaceId, courseId: row.id, title: section.title, position: sectionIndex + 1 });
      section.lessons.forEach((lesson, lessonIndex) => {
        const durationSeconds = parseDuration(lesson.duration) ?? 600;
        const id = crypto.randomUUID();
        lessonRows.push({
          id,
          workspaceId,
          courseId: row.id,
          sectionId,
          title: lesson.title,
          type: lesson.type,
          durationSeconds,
          isPreview: lesson.preview ?? false,
          position: lessonIndex + 1,
        });
        ordered.push({ id, title: lesson.title, minutes: toMinutes(durationSeconds) });
      });
    });
    planLessons.set(row.id, ordered);
  }
  await db.insert(sections).values(sectionRows);
  await db.insert(lessons).values(lessonRows);

  const productRows = SEED_PRODUCTS.map((product) => ({
    seed: product,
    row: {
      id: crypto.randomUUID(),
      workspaceId,
      title: product.title,
      type: product.type,
      description: product.description,
      price: product.price,
      status: "on_sale" as const,
      createdAt: seoulInstant(`${addMonths(currentMonth, -product.launchedMonthsAgo)}-01`, 10),
      updatedAt: seoulInstant(`${addMonths(currentMonth, -product.launchedMonthsAgo)}-01`, 10),
    },
  }));
  await db.insert(products).values(productRows.map((p) => p.row));

  // People and money ----------------------------------------------------------
  const learnerRows: NewLearner[] = [];
  const enrollmentRows: NewEnrollment[] = [];
  const paymentRows: NewPayment[] = [];
  const enrolled = new Map<string, Set<string>>();
  let nameIndex = 0;

  const newLearner = (at: Date): NewLearner & { id: string } => {
    const first = FIRST_LEARNERS[nameIndex];
    const [surname, surnameRoman] = random.pick(SURNAMES);
    const [given, givenRoman] = random.pick(GIVEN_NAMES);
    const row = {
      id: crypto.randomUUID(),
      workspaceId,
      name: first?.name ?? `${surname}${given}`,
      email: first?.email ?? `${givenRoman}.${surnameRoman}${nameIndex}@example.com`,
      createdAt: at,
    };
    nameIndex += 1;
    learnerRows.push(row);
    return row;
  };

  /** A purchase moment inside `month`, never after `now`. */
  const momentIn = (month: string): Date => {
    const isCurrent = month === currentMonth;
    const lastDay = isCurrent ? seoulParts(now).day : daysInMonth(month);
    // A growing school sells more lately: weight this month's days toward today.
    const days = Array.from({ length: lastDay }, (_, i) => ({ value: i + 1, weight: isCurrent ? (i + 1) ** 1.5 : 1 }));
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const day = random.weighted(days);
      const at = seoulInstant(`${month}-${String(day).padStart(2, "0")}`, random.weighted(HOUR_WEIGHTS), random.int(0, 59));
      if (at.getTime() <= now.getTime() - 5 * 60_000) return at;
    }
    // Early on the first day of a month: fall back to "a little while ago".
    return new Date(now.getTime() - random.int(10, 120) * 60_000);
  };

  const refundAt = (paidAt: Date) =>
    new Date(Math.min(now.getTime() - 60_000, paidAt.getTime() + random.int(1, 4) * DAY_MS + random.int(0, 600) * 60_000));

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo -= 1) {
    const month = addMonths(currentMonth, -monthsAgo);
    const step = 11 - monthsAgo;
    const elapsed =
      month === currentMonth ? (seoulParts(now).day - 1 + seoulParts(now).hour / 24) / daysInMonth(month) : 1;
    const courseSales = Math.max(0, Math.round((5 + 2.1 * step + random.int(-2, 2)) * elapsed));
    const productSales = Math.max(0, Math.round((14 + 4.6 * step + random.int(-3, 3)) * elapsed));

    const sellable = courseRows.filter(
      ({ seed }) => seed.launchedMonthsAgo !== null && seed.launchedMonthsAgo >= monthsAgo,
    );
    for (let i = 0; i < courseSales && sellable.length > 0; i += 1) {
      const { row: course } = random.weighted(sellable.map((c) => ({ value: c, weight: c.seed.weight })));
      const paidAt = momentIn(month);
      const existing = learnerRows.filter(
        (l) => (l.createdAt as Date) < paidAt && !enrolled.get(l.id as string)?.has(course.id),
      );
      const learner = existing.length > 0 && random.next() < 0.2 ? random.pick(existing) : newLearner(paidAt);
      const learnerId = learner.id as string;
      enrolled.set(learnerId, (enrolled.get(learnerId) ?? new Set()).add(course.id));

      const refunded = random.next() < 0.04;
      const pace = random.weighted(PACE_WEIGHTS);
      const enrolledOn = dayKey(paidAt);
      const plan = buildStudyPlan(planLessons.get(course.id) ?? [], pace, enrolledOn);
      const finishOn = plan.finishOn ?? enrolledOn;
      const expected = expectedProgress(enrolledOn, finishOn, today);
      const drive = random.weighted([
        { value: 0.3 + random.next() * 0.3, weight: 2 },
        { value: 0.75 + random.next() * 0.3, weight: 5 },
        { value: 1.05 + random.next() * 0.25, weight: 3 },
      ]);
      const progress = refunded ? random.int(0, 12) : Math.min(100, Math.round(expected * 100 * drive));
      const completed = !refunded && progress >= 100;
      const studiedAt = progress > 0 ? Math.min(now.getTime() - 3_600_000, paidAt.getTime() + (now.getTime() - paidAt.getTime()) * (0.4 + random.next() * 0.6)) : null;

      enrollmentRows.push({
        workspaceId,
        learnerId,
        courseId: course.id,
        status: refunded ? "refunded" : completed ? "completed" : "active",
        progress,
        sessionsPerWeek: pace.sessionsPerWeek,
        minutesPerSession: pace.minutesPerSession,
        planFinishOn: finishOn,
        enrolledAt: paidAt,
        lastStudiedAt: studiedAt ? new Date(studiedAt) : null,
        completedAt: completed && studiedAt ? new Date(studiedAt) : null,
      });
      paymentRows.push({
        workspaceId,
        learnerId,
        kind: "course",
        courseId: course.id,
        itemTitle: course.title,
        amount: course.price,
        status: refunded ? "refunded" : "paid",
        paidAt,
        refundedAt: refunded ? refundAt(paidAt) : null,
      });
    }

    const onSale = productRows.filter(({ seed }) => seed.launchedMonthsAgo >= monthsAgo);
    for (let i = 0; i < productSales && onSale.length > 0; i += 1) {
      const { row: product } = random.weighted(onSale.map((p) => ({ value: p, weight: p.seed.weight })));
      const paidAt = momentIn(month);
      const existing = learnerRows.filter((l) => (l.createdAt as Date) < paidAt);
      const learner = existing.length > 0 && random.next() < 0.55 ? random.pick(existing) : newLearner(paidAt);
      const refunded = random.next() < 0.02;
      paymentRows.push({
        workspaceId,
        learnerId: learner.id,
        kind: "product",
        productId: product.id,
        itemTitle: product.title,
        amount: product.price,
        status: refunded ? "refunded" : "paid",
        paidAt,
        refundedAt: refunded ? refundAt(paidAt) : null,
      });
    }
  }

  await insertChunked(learnerRows, (chunk) => db.insert(learners).values(chunk));
  await insertChunked(enrollmentRows, (chunk) => db.insert(enrollments).values(chunk));
  await insertChunked(paymentRows, (chunk) => db.insert(payments).values(chunk));
}
