"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction, UserError } from "@/core/actions";
import { generateObject, type AiSource } from "@/core/ai";
import { seoulDateKey } from "@/core/format";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { draftEstimateFromBrief } from "../domain/estimate-draft";
import type { LineItem } from "../domain/money";
import { formatDuration } from "../domain/time";
import { devFreelancing } from "../module";
import * as clientsData from "./data/clients";
import * as docs from "./data/documents-write";
import { saveProfile as saveProfileData } from "./data/profile";
import * as projectsData from "./data/projects";
import { submitInquiry as submitInquiryData } from "./data/public";
import * as showcase from "./data/showcase";
import * as time from "./data/time";
import * as input from "./inputs";

/**
 * DevFlow server actions: validate with zod, run the data function for the visitor's workspace,
 * then revalidate the module. Every id is re-checked against the workspace in the data layer.
 */

const BASE = "/dev-freelancing";
const ctx = () => getModuleContext(devFreelancing);
const refresh = () => revalidatePath(BASE, "layout");

// --- Clients ---------------------------------------------------------------------------------

export const saveClient = formAction(input.clientInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  if (id) {
    await clientsData.updateClient(db, workspaceId, id, values);
    refresh();
    return { message: "고객 정보를 저장했어요." };
  }
  const created = await clientsData.createClient(db, workspaceId, values);
  refresh();
  redirect(`${BASE}/clients/${created}`);
});

export const deleteClient = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await clientsData.deleteClient(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/clients`);
});

export const addClientNote = formAction(input.noteInput, async ({ clientId, ...note }) => {
  const { db, workspaceId } = await ctx();
  await clientsData.addClientNote(db, workspaceId, clientId, note);
  refresh();
  return { message: "기록을 남겼어요." };
});

export const deleteClientNote = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await clientsData.deleteClientNote(db, workspaceId, id);
  refresh();
  return { message: "기록을 지웠어요." };
});

// --- Projects & milestones -------------------------------------------------------------------

export const saveProject = formAction(input.projectInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  if (id) {
    await projectsData.updateProject(db, workspaceId, id, values);
    refresh();
    return { message: "프로젝트를 저장했어요." };
  }
  await projectsData.createProject(db, workspaceId, values);
  refresh();
  return { message: `'${values.title}'을(를) 보드에 추가했어요.` };
});

export const deleteProject = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await projectsData.deleteProject(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/projects`);
});

export const moveProject = action(input.moveProjectInput, async ({ id, status, index }) => {
  const { db, workspaceId } = await ctx();
  await projectsData.moveProject(db, workspaceId, id, status, index);
  refresh();
});

export const saveMilestone = formAction(input.milestoneInput, async ({ id, projectId, ...values }) => {
  const { db, workspaceId } = await ctx();
  if (id) await projectsData.updateMilestone(db, workspaceId, id, values);
  else await projectsData.addMilestone(db, workspaceId, projectId, values);
  refresh();
  return { message: id ? "마일스톤을 고쳤어요." : "마일스톤을 추가했어요." };
});

export const toggleMilestone = action(input.toggleInput, async ({ id, done }) => {
  const { db, workspaceId } = await ctx();
  await projectsData.setMilestoneDone(db, workspaceId, id, done);
  refresh();
});

export const moveMilestone = action(input.directionInput, async ({ id, direction }) => {
  const { db, workspaceId } = await ctx();
  await projectsData.moveMilestone(db, workspaceId, id, direction);
  refresh();
});

export const deleteMilestone = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await projectsData.deleteMilestone(db, workspaceId, id);
  refresh();
  return { message: "마일스톤을 지웠어요." };
});

// --- Estimates & invoices --------------------------------------------------------------------

export const saveEstimate = formAction(input.estimateInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  const estimateId = id ?? (await docs.createEstimate(db, workspaceId, values));
  if (id) await docs.updateEstimate(db, workspaceId, id, values);
  refresh();
  redirect(`${BASE}/estimates/${estimateId}`);
});

export const setEstimateStatus = action(input.estimateStatusInput, async ({ id, status }) => {
  if (status === "invoiced") throw new UserError("인보이스 전환 버튼을 사용해 주세요.");
  const { db, workspaceId } = await ctx();
  await docs.setEstimateStatus(db, workspaceId, id, status);
  refresh();
});

export const deleteEstimate = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await docs.deleteEstimate(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/documents`);
});

export const convertEstimate = action(input.convertInput, async ({ id, share }) => {
  const { db, workspaceId } = await ctx();
  const invoiceId = await docs.convertEstimate(db, workspaceId, id, share, seoulDateKey());
  refresh();
  redirect(`${BASE}/invoices/${invoiceId}`);
});

export const createProjectFromEstimate = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  const projectId = await docs.createProjectFromEstimate(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/projects/${projectId}`);
});

export const saveInvoice = formAction(input.invoiceInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  const invoiceId = id ?? (await docs.createInvoice(db, workspaceId, values));
  if (id) await docs.updateInvoice(db, workspaceId, id, values);
  refresh();
  redirect(`${BASE}/invoices/${invoiceId}`);
});

export const setInvoiceStatus = action(input.invoiceStatusInput, async ({ id, status, paidOn }) => {
  const { db, workspaceId } = await ctx();
  await docs.setInvoiceStatus(db, workspaceId, id, status, { paidOn });
  refresh();
});

export const deleteInvoice = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await docs.deleteInvoice(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/documents?tab=invoices`);
});

export interface EstimateDraftResult {
  items: LineItem[];
  summary: string;
  source: AiSource;
  notice?: string;
}

const aiDraftSchema = z.object({
  summary: z.string().describe("한 문장 요약: 어떤 기준으로 나눴는지"),
  items: z
    .array(
      z.object({
        title: z.string().describe("기능 단위 항목명 (한국어, 30자 이내)"),
        hours: z.number().describe("1인 개발자 기준 예상 시간 (0.5 단위)"),
      }),
    )
    .describe("4~10개 항목. 기획/설계로 시작하고 QA/배포로 끝낸다."),
});

/** Splits a client's request into hour lines — Claude when configured, the keyword template otherwise. */
export const draftEstimate = action(input.draftInput, async ({ brief, hourlyRate }) => {
  await ctx();
  const fallback = draftEstimateFromBrief(brief, hourlyRate);
  const outcome = await generateObject({
    feature: "dev-freelancing.estimate-draft",
    system:
      "당신은 한국의 1인 웹·앱 외주 개발자를 돕는 견적 보조입니다. 고객 요청서를 기능 단위 견적 항목으로 나누고, " +
      "혼자 개발하는 사람 기준의 현실적인 시간을 0.5시간 단위로 붙입니다. 과장하지 말고, 요청서에 없는 기능은 넣지 않습니다.",
    prompt: `고객 요청서:\n"""\n${brief}\n"""\n\n견적 항목을 나눠 주세요.`,
    schema: aiDraftSchema,
    maxTokens: 1500,
    fallback: () => ({
      summary: fallback.summary,
      items: fallback.items.map((item) => ({ title: item.title, hours: item.quantity })),
    }),
  });
  const items: LineItem[] = outcome.data.items
    .filter((item) => item.title.trim() && item.hours > 0)
    .slice(0, 20)
    .map((item) => ({
      title: item.title.trim().slice(0, 120),
      unit: "hour",
      quantity: Math.max(0.5, Math.round(item.hours * 2) / 2),
      unitPrice: hourlyRate,
    }));
  const data: EstimateDraftResult = {
    items: items.length > 0 ? items : fallback.items,
    summary: outcome.data.summary,
    source: outcome.source,
    notice: outcome.notice,
  };
  return { data };
});

// --- Time ------------------------------------------------------------------------------------

export const startTimer = action(input.timerInput, async (values) => {
  const { db, workspaceId } = await ctx();
  await time.startTimer(db, workspaceId, values);
  refresh();
  return { message: "타이머를 시작했어요." };
});

export const stopTimer = action(z.object({}), async () => {
  const { db, workspaceId } = await ctx();
  const { minutes } = await time.stopTimer(db, workspaceId);
  refresh();
  return { message: `${formatDuration(minutes)}을 오늘 칸에 채웠어요.` };
});

export const discardTimer = action(z.object({}), async () => {
  const { db, workspaceId } = await ctx();
  await time.discardTimer(db, workspaceId);
  refresh();
  return { message: "기록하지 않고 타이머를 멈췄어요." };
});

export const saveEntry = formAction(input.entryInput, async ({ id, hours, ...values }) => {
  const { db, workspaceId } = await ctx();
  const entry = { ...values, minutes: hours };
  if (id) await time.updateEntry(db, workspaceId, id, entry);
  else await time.addEntry(db, workspaceId, entry);
  refresh();
  return { message: id ? "기록을 고쳤어요." : `${formatDuration(hours)}을 기록했어요.` };
});

export const deleteEntry = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await time.deleteEntry(db, workspaceId, id);
  refresh();
  return { message: "기록을 지웠어요." };
});

// --- Portfolio & price list ------------------------------------------------------------------

export const savePortfolioItem = formAction(input.portfolioInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  if (id) await showcase.updatePortfolioItem(db, workspaceId, id, values);
  else await showcase.createPortfolioItem(db, workspaceId, values);
  refresh();
  return { message: id ? "포트폴리오를 저장했어요." : "포트폴리오에 추가했어요." };
});

export const setPortfolioPublished = action(input.publishInput, async ({ id, published }) => {
  const { db, workspaceId } = await ctx();
  await showcase.setPortfolioPublished(db, workspaceId, id, published);
  refresh();
});

export const movePortfolioItem = action(input.directionInput, async ({ id, direction }) => {
  const { db, workspaceId } = await ctx();
  await showcase.movePortfolioItem(db, workspaceId, id, direction);
  refresh();
});

export const deletePortfolioItem = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await showcase.deletePortfolioItem(db, workspaceId, id);
  refresh();
  return { message: "포트폴리오에서 지웠어요." };
});

export const savePlan = formAction(input.planInput, async ({ id, ...values }) => {
  const { db, workspaceId } = await ctx();
  if (id) await showcase.updatePlan(db, workspaceId, id, values);
  else await showcase.createPlan(db, workspaceId, values);
  refresh();
  return { message: id ? "요금제를 저장했어요." : "요금제를 추가했어요." };
});

export const deletePlan = action(input.idInput, async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await showcase.deletePlan(db, workspaceId, id);
  refresh();
  return { message: "요금제를 지웠어요." };
});

// --- Settings & public -----------------------------------------------------------------------

export const saveProfile = formAction(input.profileInput, async (values) => {
  const { db, workspaceId } = await ctx();
  await saveProfileData(db, workspaceId, values);
  refresh();
  return { message: "설정을 저장했어요. 새 문서부터 적용돼요." };
});

export const resetDemo = action(z.object({}), async () => {
  await resetModuleData(devFreelancing);
  refresh();
  return { message: "샘플 데이터로 되돌렸어요." };
});

export const submitInquiry = formAction(input.inquiryInput, async (values) => {
  const { db, workspaceId } = await ctx();
  await submitInquiryData(db, workspaceId, values, seoulDateKey());
  refresh();
  return { message: "문의를 보냈어요. 남겨 주신 이메일로 답장이 갈 거예요." };
});
