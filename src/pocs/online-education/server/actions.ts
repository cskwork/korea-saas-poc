"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction, UserError } from "@/core/actions";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { dayLabel } from "../domain/calendar";
import {
  courseInput,
  courseStatusInput,
  enrollInput,
  idInput,
  lessonInput,
  moveInput,
  planInput,
  productInput,
  productStatusInput,
  purchaseInput,
  renameSectionInput,
  schoolInput,
  sectionInput,
  updateCourseInput,
  updateLessonInput,
  updateProductInput,
} from "../domain/inputs";
import { onlineEducation } from "../module";
import { draftCurriculum } from "./curriculum-ai";
import { readCourse } from "./reads";
import * as writes from "./writes";

/** Server actions: validated thin wrappers over `writes.ts`, bound to the visitor's workspace. */

const BASE = "/online-education";
const context = () => getModuleContext(onlineEducation);
const refresh = () => revalidatePath(BASE, "layout");

// Courses ----------------------------------------------------------------------------

export const createCourseAction = formAction(courseInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await writes.createCourse(db, workspaceId, input);
  refresh();
  redirect(`${BASE}/courses/${id}`);
});

export const updateCourseAction = formAction(updateCourseInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.updateCourse(db, workspaceId, input);
  refresh();
  return { message: "강의 정보를 저장했어요." };
});

export const setCourseStatusAction = action(courseStatusInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.setCourseStatus(db, workspaceId, input);
  refresh();
  return { message: input.status === "published" ? "강의를 게시했어요. 이제 스쿨에서 수강 신청을 받아요." : "강의를 비공개로 돌렸어요." };
});

export const deleteCourseAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const title = await writes.deleteCourse(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/courses?deleted=${encodeURIComponent(title)}`);
});

// Curriculum -------------------------------------------------------------------------

export const addSectionAction = formAction(sectionInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.addSection(db, workspaceId, input);
  refresh();
  return { message: "섹션을 추가했어요." };
});

export const renameSectionAction = formAction(renameSectionInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.renameSection(db, workspaceId, input);
  refresh();
  return { message: "섹션 이름을 바꿨어요." };
});

export const moveSectionAction = action(moveInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.moveSection(db, workspaceId, input);
  refresh();
});

export const deleteSectionAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const title = await writes.deleteSection(db, workspaceId, id);
  refresh();
  return { message: `"${title}" 섹션을 삭제했어요.` };
});

export const addLessonAction = formAction(lessonInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.addLesson(db, workspaceId, input);
  refresh();
  return { message: "레슨을 추가했어요." };
});

export const updateLessonAction = formAction(updateLessonInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.updateLesson(db, workspaceId, input);
  refresh();
  return { message: "레슨을 저장했어요." };
});

export const moveLessonAction = action(moveInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.moveLesson(db, workspaceId, input);
  refresh();
});

export const deleteLessonAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const title = await writes.deleteLesson(db, workspaceId, id);
  refresh();
  return { message: `"${title}" 레슨을 삭제했어요.` };
});

export const draftCurriculumAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const detail = await readCourse(db, workspaceId, id);
  if (!detail) throw new UserError("강의를 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  if (detail.sections.length > 0) throw new UserError("커리큘럼이 비어 있을 때만 초안을 넣을 수 있어요.");
  const { draft, source, notice } = await draftCurriculum(detail.course);
  const added = await writes.applyCurriculumDraft(db, workspaceId, id, draft);
  refresh();
  const summary = `섹션 ${added.sections}개, 레슨 ${added.lessons}개`;
  return {
    message:
      source === "claude"
        ? `Claude가 ${summary}로 초안을 짰어요. 제목과 길이를 내 강의에 맞게 다듬어 주세요.`
        : `기본 템플릿으로 ${summary} 초안을 넣었어요.${notice ? ` ${notice}` : ""} 제목과 길이를 다듬어 주세요.`,
  };
});

// School: registration and purchase -------------------------------------------------------

export interface EnrollResult {
  courseTitle: string;
  learnerName: string;
  amount: number;
  finishLabel: string | null;
  sessions: number;
}

export const enrollAction = formAction<typeof enrollInput, EnrollResult>(enrollInput, async (input) => {
  const { db, workspaceId } = await context();
  const receipt = await writes.enroll(db, workspaceId, input);
  refresh();
  return {
    message: `${receipt.learnerName}님, 수강 신청이 완료됐어요.`,
    data: {
      courseTitle: receipt.courseTitle,
      learnerName: receipt.learnerName,
      amount: receipt.amount,
      finishLabel: receipt.finishOn ? dayLabel(receipt.finishOn) : null,
      sessions: receipt.sessions,
    },
  };
});

export interface PurchaseResult {
  title: string;
  amount: number;
  learnerName: string;
}

export const purchaseAction = formAction<typeof purchaseInput, PurchaseResult>(purchaseInput, async (input) => {
  const { db, workspaceId } = await context();
  const result = await writes.purchaseProduct(db, workspaceId, input);
  refresh();
  return { message: `${result.learnerName}님, 구매가 완료됐어요.`, data: result };
});

// Students ---------------------------------------------------------------------------

export const refundPaymentAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const payment = await writes.refundPayment(db, workspaceId, id);
  refresh();
  return {
    message:
      payment.kind === "course"
        ? `"${payment.itemTitle}" 결제를 환불 처리하고 수강을 종료했어요.`
        : `"${payment.itemTitle}" 결제를 환불 처리했어요.`,
  };
});

export const deleteLearnerAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const name = await writes.deleteLearner(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/students?deleted=${encodeURIComponent(name)}`);
});

// Products ---------------------------------------------------------------------------

export const createProductAction = formAction(productInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.createProduct(db, workspaceId, input);
  refresh();
  redirect(`${BASE}/products?created=${encodeURIComponent(input.title)}`);
});

export const updateProductAction = formAction(updateProductInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.updateProduct(db, workspaceId, input);
  refresh();
  return { message: "상품 정보를 저장했어요." };
});

export const setProductStatusAction = action(productStatusInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.setProductStatus(db, workspaceId, input);
  refresh();
  return { message: input.status === "on_sale" ? "다시 판매를 시작했어요." : "판매를 멈췄어요. 스쿨에서 보이지 않아요." };
});

export const deleteProductAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const title = await writes.deleteProduct(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/products?deleted=${encodeURIComponent(title)}`);
});

// Plan, school, demo ------------------------------------------------------------------

export const changePlanAction = formAction(planInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.changePlan(db, workspaceId, input);
  refresh();
  return { message: "요금제를 바꿨어요. 데모라서 실제 결제는 일어나지 않아요." };
});

export const updateSchoolAction = formAction(schoolInput, async (input) => {
  const { db, workspaceId } = await context();
  await writes.updateSchool(db, workspaceId, input);
  refresh();
  return { message: "스쿨 정보를 저장했어요." };
});

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(onlineEducation);
  refresh();
  return { message: "데모 데이터를 처음 상태로 되돌렸어요." };
});
