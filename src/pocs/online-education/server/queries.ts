import "server-only";
import { cache } from "react";
import { z } from "zod";
import { getModuleContext } from "@/core/modules/context";
import { onlineEducation } from "../module";
import {
  readCourse,
  readCourseSummaries,
  readDashboard,
  readPlan,
  readProduct,
  readProducts,
  readRevenue,
  readSchool,
  readStorefront,
  readStudent,
  readStudents,
  type CourseFilters,
  type CourseSort,
  type ProductSort,
  type StudentFilter,
  type StudentFilters,
  type StudentSort,
} from "./reads";

/** Request-bound reads for pages: resolve the visitor's workspace, then delegate to `reads.ts`. */

const context = cache(() => getModuleContext(onlineEducation));
const isId = (value: string) => z.uuid().safeParse(value).success;

type SearchParams = Record<string, string | string[] | undefined>;
const param = (params: SearchParams, key: string) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};
const oneOf = <T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined =>
  allowed.find((item) => item === value);

export const getSchool = cache(async () => {
  const { db, workspaceId } = await context();
  return readSchool(db, workspaceId);
});

export async function getDashboard(params: SearchParams) {
  const { db, workspaceId } = await context();
  const week = Number.parseInt(param(params, "week") ?? "0", 10);
  const offset = Number.isFinite(week) ? Math.min(0, Math.max(-52, week)) : 0;
  return readDashboard(db, workspaceId, new Date(), offset);
}

export async function getCourses(params: SearchParams) {
  const { db, workspaceId } = await context();
  const filters: CourseFilters = {
    q: param(params, "q")?.slice(0, 80),
    status: oneOf(param(params, "status"), ["draft", "published"] as const),
    sort: oneOf<CourseSort>(param(params, "sort"), ["recent", "students", "revenue", "title"]),
  };
  return { ...(await readCourseSummaries(db, workspaceId, filters)), filters };
}

/** A course of this workspace with its curriculum, or null (→ 404) for a missing/foreign/invalid id. */
export const getCourse = cache(async (courseId: string) => {
  if (!isId(courseId)) return null;
  const { db, workspaceId } = await context();
  return readCourse(db, workspaceId, courseId);
});

export async function getStudents(params: SearchParams) {
  const { db, workspaceId } = await context();
  const courseId = param(params, "course");
  const filters: StudentFilters = {
    q: param(params, "q")?.slice(0, 80),
    filter: oneOf<StudentFilter>(param(params, "filter"), ["all", "learning", "behind", "completed", "buyers"]),
    courseId: courseId && isId(courseId) ? courseId : undefined,
    sort: oneOf<StudentSort>(param(params, "sort"), ["recent", "paid", "progress", "name"]),
    page: Number.parseInt(param(params, "page") ?? "1", 10) || 1,
  };
  return { ...(await readStudents(db, workspaceId, new Date(), filters)), filters };
}

export const getStudent = cache(async (learnerId: string) => {
  if (!isId(learnerId)) return null;
  const { db, workspaceId } = await context();
  return readStudent(db, workspaceId, learnerId, new Date());
});

export async function getProducts(params: SearchParams) {
  const { db, workspaceId } = await context();
  const filters = {
    type: oneOf(param(params, "type"), ["notion", "pdf", "sheet"] as const),
    sort: oneOf<ProductSort>(param(params, "sort"), ["recent", "sales", "revenue", "price"]),
  };
  const [list, plan] = await Promise.all([readProducts(db, workspaceId, filters), readPlan(db, workspaceId)]);
  return { ...list, filters, plan };
}

export const getProduct = cache(async (productId: string) => {
  if (!isId(productId)) return null;
  const { db, workspaceId } = await context();
  return readProduct(db, workspaceId, productId);
});

export async function getRevenue(params: SearchParams) {
  const { db, workspaceId } = await context();
  const months = param(params, "months") === "6" ? 6 : 12;
  return { ...(await readRevenue(db, workspaceId, new Date(), months)), months };
}

export async function getPlan() {
  const { db, workspaceId } = await context();
  return readPlan(db, workspaceId);
}

export const getStorefront = cache(async () => {
  const { db, workspaceId } = await context();
  return readStorefront(db, workspaceId);
});
