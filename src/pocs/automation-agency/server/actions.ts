"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction, UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import {
  archiveInput,
  diagnosisInput,
  diagnosisStatusInput,
  idInput,
  maintenanceInput,
  packageInput,
  packageUpdateInput,
  profileInput,
  projectInput,
  projectUpdateInput,
  quoteInput,
  quoteStatusInput,
  quoteUpdateInput,
  workflowCreateInput,
  workflowSaveInput,
} from "../domain/inputs";
import { MAINTENANCE_LABEL, QUOTE_STATUS_LABEL } from "../domain/labels";
import { STAGE_LABEL } from "../domain/stages";
import { automationAgency } from "../module";
import { createPackage, setPackageArchived, updatePackage } from "./data/catalog";
import { createDiagnosis, deleteDiagnosis, setDiagnosisStatus } from "./data/diagnoses";
import { advanceProject, createProject, deleteProject, setMaintenanceStatus, updateProject } from "./data/projects";
import {
  convertQuoteToProject,
  createQuote,
  deleteQuote,
  saveProfile,
  setQuoteStatus,
  updateQuote,
} from "./data/quotes";
import { createWorkflow, deleteWorkflow, saveWorkflow } from "./data/workflows";

const BASE = "/automation-agency";
const GONE = "이미 삭제되었거나 찾을 수 없어요. 목록을 새로고침해 주세요.";

const context = () => getModuleContext(automationAgency);
const refresh = () => revalidatePath(BASE, "layout");

function found(ok: boolean | undefined): asserts ok {
  if (!ok) throw new UserError(GONE);
}

// --- Demo data ---------------------------------------------------------------

export const resetDemoAction = formAction(z.object({}), async () => {
  await resetModuleData(automationAgency);
  refresh();
  return { message: "샘플 데이터를 처음 상태로 되돌렸어요." };
});

// --- Catalogue ---------------------------------------------------------------

export const createPackageAction = formAction(packageInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await createPackage(db, workspaceId, input);
  refresh();
  redirect(`${BASE}/catalog/${id}?saved=1`);
});

export const updatePackageAction = formAction(packageUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  found(await updatePackage(db, workspaceId, id, input));
  refresh();
  return { message: "패키지 정보를 저장했어요." };
});

export const setPackageArchivedAction = formAction(archiveInput, async ({ id, archived }) => {
  const { db, workspaceId } = await context();
  found(await setPackageArchived(db, workspaceId, id, archived));
  refresh();
  return {
    message: archived ? "판매를 중지했어요. 기존 견적과 프로젝트에는 그대로 남아요." : "다시 판매 중으로 돌렸어요.",
  };
});

// --- Projects ----------------------------------------------------------------

export const createProjectAction = formAction(projectInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await createProject(db, workspaceId, input, seoulDateKey());
  refresh();
  redirect(`${BASE}/projects/${id}?saved=1`);
});

export const updateProjectAction = formAction(projectUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  found(await updateProject(db, workspaceId, id, input, seoulDateKey()));
  refresh();
  redirect(`${BASE}/projects/${id}?updated=1`);
});

export const advanceProjectAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const stage = await advanceProject(db, workspaceId, id, seoulDateKey());
  found(stage !== undefined);
  refresh();
  return {
    message:
      stage === "maintenance"
        ? "유지보수 순환선에 합류했어요. 월 유지보수가 오늘부터 집계돼요."
        : `‘${stage ? STAGE_LABEL[stage] : ""}’ 역에 도착했어요.`,
  };
});

export const setMaintenanceAction = formAction(maintenanceInput, async ({ id, maintenanceStatus }) => {
  const { db, workspaceId } = await context();
  found(await setMaintenanceStatus(db, workspaceId, id, maintenanceStatus, seoulDateKey()));
  refresh();
  return { message: `유지보수 상태를 ‘${MAINTENANCE_LABEL[maintenanceStatus]}’(으)로 바꿨어요.` };
});

export const deleteProjectAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  found(await deleteProject(db, workspaceId, id));
  refresh();
  redirect(`${BASE}/projects?deleted=1`);
});

// --- Quotes ------------------------------------------------------------------

export const createQuoteAction = formAction(quoteInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await createQuote(db, workspaceId, input);
  // A quote written from a diagnosis moves that lead forward.
  if (input.diagnosisId) await setDiagnosisStatus(db, workspaceId, input.diagnosisId, "quoted");
  refresh();
  redirect(`${BASE}/quotes/${id}?saved=1`);
});

export const updateQuoteAction = formAction(quoteUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  found(await updateQuote(db, workspaceId, id, input));
  refresh();
  redirect(`${BASE}/quotes/${id}?saved=1`);
});

export const setQuoteStatusAction = formAction(quoteStatusInput, async ({ id, status }) => {
  const { db, workspaceId } = await context();
  found(await setQuoteStatus(db, workspaceId, id, status));
  refresh();
  return { message: `견적 상태를 ‘${QUOTE_STATUS_LABEL[status]}’(으)로 바꿨어요.` };
});

export const deleteQuoteAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  found(await deleteQuote(db, workspaceId, id));
  refresh();
  redirect(`${BASE}/quotes?deleted=1`);
});

export const convertQuoteAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  const projectId = await convertQuoteToProject(db, workspaceId, id);
  found(projectId !== undefined);
  refresh();
  redirect(`${BASE}/projects/${projectId}?converted=1`);
});

export const saveProfileAction = formAction(profileInput, async (input) => {
  const { db, workspaceId } = await context();
  await saveProfile(db, workspaceId, input);
  refresh();
  return { message: "공급자 정보를 저장했어요. 모든 견적서에 반영돼요." };
});

// --- ROI diagnoses -------------------------------------------------------------

export const createDiagnosisAction = formAction(diagnosisInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await createDiagnosis(db, workspaceId, input);
  refresh();
  return { message: `‘${input.clientName}’ 진단을 저장했어요.`, data: id };
});

export const setDiagnosisStatusAction = formAction(diagnosisStatusInput, async ({ id, status }) => {
  const { db, workspaceId } = await context();
  found(await setDiagnosisStatus(db, workspaceId, id, status));
  refresh();
  return { message: "진단 상태를 바꿨어요." };
});

export const deleteDiagnosisAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  found(await deleteDiagnosis(db, workspaceId, id));
  refresh();
  return { message: "진단을 삭제했어요." };
});

// --- Workflows -----------------------------------------------------------------

export const createWorkflowAction = formAction(workflowCreateInput, async (input) => {
  const { db, workspaceId } = await context();
  const id = await createWorkflow(db, workspaceId, input);
  refresh();
  redirect(`${BASE}/workflows/${id}`);
});

export const saveWorkflowAction = action(workflowSaveInput, async (input) => {
  const { db, workspaceId } = await context();
  found(await saveWorkflow(db, workspaceId, input));
  refresh();
  return { message: "노선도를 저장했어요." };
});

export const deleteWorkflowAction = formAction(idInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  found(await deleteWorkflow(db, workspaceId, id));
  refresh();
  redirect(`${BASE}/workflows?deleted=1`);
});
