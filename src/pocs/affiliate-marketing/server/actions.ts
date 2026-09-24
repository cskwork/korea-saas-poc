"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import { action, formAction } from "@/core/actions";
import { siteUrl } from "@/core/env";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { affiliateMarketing } from "../module";
import {
  articleRequestInput,
  conversionStatusInput,
  createLinkInput,
  createProgramInput,
  goalInput,
  idInput,
  linkStatusInput,
  recordConversionInput,
  socialRequestInput,
  updateArticleInput,
  updateLinkInput,
  updateProgramInput,
} from "../domain/inputs";
import { draftArticle, draftSocial } from "./ai";
import { deleteArticle, deleteSocialPost, updateArticle } from "./content";
import { deleteConversion, recordConversion, setConversionStatus } from "./conversions";
import { createArticleDraft, createSocialPost } from "./drafting";
import { createLink, deleteLink, setLinkStatus, updateLink } from "./links";
import { createProgram, deleteProgram, updateProgram } from "./programs";
import { setMonthlyGoal } from "./settings";

/** Thin server-action wrappers: validate, call the data function, revalidate. */

const ROOT = "/affiliate-marketing";
const context = () => getModuleContext(affiliateMarketing);
const refresh = () => revalidatePath(ROOT, "layout");

// ---------- Links ----------

export const createLinkAction = formAction(createLinkInput, async (input) => {
  const { db, workspaceId } = await context();
  const link = await createLink(db, workspaceId, input);
  refresh();
  redirect(`${ROOT}/links/${link.id}?created=1`);
});

export const updateLinkAction = formAction(updateLinkInput, async (input) => {
  const { db, workspaceId } = await context();
  if (!(await updateLink(db, workspaceId, input))) notFound();
  refresh();
  return { message: "링크 정보를 저장했어요." };
});

export const setLinkStatusAction = action(linkStatusInput, async ({ id, status }) => {
  const { db, workspaceId } = await context();
  if (!(await setLinkStatus(db, workspaceId, id, status))) notFound();
  refresh();
  return { message: "상태를 바꿨어요." };
});

export const deleteLinkAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  if (!(await deleteLink(db, workspaceId, id))) notFound();
  refresh();
  redirect(`${ROOT}/links?deleted=1`);
});

// ---------- Conversions ----------

export const recordConversionAction = formAction(recordConversionInput, async (input) => {
  const { db, workspaceId } = await context();
  const row = await recordConversion(db, workspaceId, input);
  refresh();
  return { message: `판매를 기록했어요. 수수료 ${new Intl.NumberFormat("ko-KR").format(row.commissionWon)}원` };
});

export const setConversionStatusAction = action(conversionStatusInput, async ({ id, status }) => {
  const { db, workspaceId } = await context();
  if (!(await setConversionStatus(db, workspaceId, id, status))) notFound();
  refresh();
  return { message: "상태를 바꿨어요." };
});

export const deleteConversionAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  if (!(await deleteConversion(db, workspaceId, id))) notFound();
  refresh();
  return { message: "판매 기록을 삭제했어요." };
});

// ---------- Goal ----------

export const setGoalAction = formAction(goalInput, async ({ goal }) => {
  const { db, workspaceId } = await context();
  await setMonthlyGoal(db, workspaceId, goal);
  refresh();
  return { message: "이번 달 목표를 바꿨어요." };
});

// ---------- Programs ----------

export const createProgramAction = formAction(createProgramInput, async (input) => {
  const { db, workspaceId } = await context();
  await createProgram(db, workspaceId, input);
  refresh();
  redirect(`${ROOT}/programs?saved=1`);
});

export const updateProgramAction = formAction(updateProgramInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  if (!(await updateProgram(db, workspaceId, id, input))) notFound();
  refresh();
  return { message: "프로그램 정보를 저장했어요." };
});

export const deleteProgramAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  if (!(await deleteProgram(db, workspaceId, id))) notFound();
  refresh();
  redirect(`${ROOT}/programs?deleted=1`);
});

// ---------- Content ----------

export const generateArticleAction = formAction(articleRequestInput, async (input) => {
  const { db, workspaceId } = await context();
  const result = await createArticleDraft(db, workspaceId, input, siteUrl(), draftArticle);
  refresh();
  redirect(`${ROOT}/content/${result.id}?created=1${result.notice ? "&fallback=1" : ""}`);
});

export const updateArticleAction = formAction(updateArticleInput, async ({ id, title, body }) => {
  const { db, workspaceId } = await context();
  if (!(await updateArticle(db, workspaceId, id, { title, body }))) notFound();
  refresh();
  return { message: "초안을 저장했어요." };
});

export const deleteArticleAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  if (!(await deleteArticle(db, workspaceId, id))) notFound();
  refresh();
  redirect(`${ROOT}/content?deleted=1`);
});

export const generateSocialAction = formAction(socialRequestInput, async (input) => {
  const { db, workspaceId } = await context();
  const result = await createSocialPost(db, workspaceId, input, siteUrl(), draftSocial);
  refresh();
  return {
    data: { id: result.id, source: result.source },
    message: result.notice ?? (result.source === "claude" ? "Claude가 게시물 4개를 썼어요." : "기본 템플릿으로 게시물 4개를 만들었어요."),
  };
});

export const deleteSocialPostAction = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  if (!(await deleteSocialPost(db, workspaceId, id))) notFound();
  refresh();
  return { message: "게시물 세트를 삭제했어요." };
});

// ---------- Demo data ----------

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(affiliateMarketing);
  refresh();
  return { message: "데모 데이터를 처음 상태로 되돌렸어요." };
});
