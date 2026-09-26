"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UserError, action, formAction } from "@/core/actions";
import type { AiSource } from "@/core/ai";
import { seoulDateKey } from "@/core/format";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { KIND_LABEL, LENGTH_LABEL, TONE_LABEL, type ContentKind } from "../domain/content";
import {
  caseEditInput,
  caseIdInput,
  draftIdInput,
  editDraftInput,
  generateInput,
  inquiryIdInput,
  inquiryInput,
  linkDraftInput,
  moveOrderInput,
  orderEditInput,
  orderIdInput,
  orderInput,
  publishCaseInput,
  regenerateInput,
  restoreVersionInput,
  selectPlanInput,
} from "../domain/inputs";
import { PLANS } from "../domain/plans";
import { contentAgency } from "../module";
import { writeDraft } from "./generate";
import { addVersion, createDraft, deleteDraft, findDraft, linkDraftToOrder, restoreVersion } from "./store/drafts";
import { createOrder, deleteOrder, findOrder, moveOrder, updateOrder } from "./store/orders";
import { createInquiry, deleteInquiry, selectPlan } from "./store/plans";
import { deleteCase, publishCase, updateCase } from "./store/portfolio";

const BASE = "/ai-content-agency";
const context = () => getModuleContext(contentAgency);
const refresh = () => revalidatePath(BASE, "layout");

const TEMPLATE_NOTES = "기본 템플릿은 상세 요청까지 반영하지 못해요. 검수할 때 직접 반영해 주세요.";

/** Which writer produced the words, plus anything worth telling the operator about it. */
function describeSource(source: AiSource, notice: string | undefined, hadNotes: boolean): string | undefined {
  if (notice) return notice;
  if (source === "template" && hadNotes) return TEMPLATE_NOTES;
  return undefined;
}

// ------------------------------------------------------------------ orders

export const createOrderAction = formAction(orderInput, async (input) => {
  const { db, workspaceId } = await context();
  const { id } = await createOrder(db, workspaceId, input, seoulDateKey());
  refresh();
  redirect(`${BASE}/orders/${id}`);
});

export const updateOrderAction = formAction(orderEditInput, async (input) => {
  const { db, workspaceId } = await context();
  await updateOrder(db, workspaceId, input);
  refresh();
  return { message: "의뢰 내용을 고쳤어요." };
});

export const moveOrderAction = action(moveOrderInput, async (input) => {
  const { db, workspaceId } = await context();
  const result = await moveOrder(db, workspaceId, input);
  refresh();
  return { message: result.message };
});

export const deleteOrderAction = action(orderIdInput, async ({ orderId }) => {
  const { db, workspaceId } = await context();
  await deleteOrder(db, workspaceId, orderId);
  refresh();
  redirect(`${BASE}/orders`);
});

/** One click on an order: AI writes a 시안 from the request as it stands. */
export const draftFromOrderAction = action(orderIdInput, async ({ orderId }) => {
  const { db, workspaceId } = await context();
  const order = await findOrder(db, workspaceId, orderId);
  if (!order) throw new UserError("의뢰를 찾을 수 없어요.");
  const outcome = await writeDraft({ ...order, notes: order.brief });
  const { id } = await createDraft(db, workspaceId, {
    kind: order.kind,
    topic: order.topic,
    tone: order.tone,
    length: order.length,
    keywords: order.keywords,
    orderId: order.id,
    content: outcome.data,
    source: outcome.source,
    note: "의뢰서로 처음 작성",
  });
  refresh();
  redirect(`${BASE}/drafts/${id}?fresh=1`);
});

// ------------------------------------------------------------------ drafts

export interface GeneratedDraft {
  draftId: string;
  kind: ContentKind;
  title: string;
  body: string;
  source: AiSource;
  notice?: string;
  version: number;
}

export const generateDraftAction = formAction<typeof generateInput, GeneratedDraft>(generateInput, async (input) => {
  const { db, workspaceId } = await context();
  const order = input.orderId ? await findOrder(db, workspaceId, input.orderId) : null;
  if (input.orderId && !order) throw new UserError("연결할 의뢰를 찾을 수 없어요.");
  const notes = [order?.brief, input.notes].filter(Boolean).join("\n");
  const outcome = await writeDraft({
    ...input,
    clientName: order?.clientName,
    industry: order?.industry,
    notes,
  });
  const { id } = await createDraft(db, workspaceId, {
    kind: input.kind,
    topic: input.topic,
    tone: input.tone,
    length: input.length,
    keywords: input.keywords,
    orderId: order?.id ?? null,
    content: outcome.data,
    source: outcome.source,
    note: "처음 작성",
  });
  refresh();
  return {
    message: `${KIND_LABEL[input.kind]} 시안을 원고함에 저장했어요.`,
    data: {
      draftId: id,
      kind: input.kind,
      ...outcome.data,
      source: outcome.source,
      notice: describeSource(outcome.source, outcome.notice, Boolean(input.notes)),
      version: 1,
    },
  };
});

export interface RewrittenDraft {
  version: number;
  title: string;
  body: string;
  source: AiSource;
  notice?: string;
}

export const regenerateDraftAction = formAction<typeof regenerateInput, RewrittenDraft>(regenerateInput, async (input) => {
  const { db, workspaceId } = await context();
  const draft = await findDraft(db, workspaceId, input.draftId);
  if (!draft) throw new UserError("원고를 찾을 수 없어요.");
  const order = draft.orderId ? await findOrder(db, workspaceId, draft.orderId) : null;
  const notes = [order?.brief, input.notes].filter(Boolean).join("\n");
  const outcome = await writeDraft(
    {
      kind: draft.kind,
      topic: draft.topic,
      tone: input.tone,
      length: input.length,
      keywords: input.keywords,
      clientName: order?.clientName,
      industry: order?.industry,
      notes,
      previousTitle: draft.title,
    },
    draft.currentVersion,
  );
  const { version } = await addVersion(db, workspaceId, draft.id, {
    content: outcome.data,
    source: outcome.source,
    note: `다시 쓰기: ${TONE_LABEL[input.tone]} · ${LENGTH_LABEL[input.length]}`,
    brief: { tone: input.tone, length: input.length, keywords: input.keywords },
  });
  refresh();
  return {
    message: `v${version}로 다시 썼어요.`,
    data: { version, ...outcome.data, source: outcome.source, notice: describeSource(outcome.source, outcome.notice, Boolean(input.notes)) },
  };
});

export const editDraftAction = formAction(editDraftInput, async (input) => {
  const { db, workspaceId } = await context();
  const { version } = await addVersion(db, workspaceId, input.draftId, {
    content: { title: input.title, body: input.body },
    source: "edit",
    note: input.note || "직접 수정",
  });
  refresh();
  return { message: `v${version}로 저장했어요.` };
});

export const restoreVersionAction = action(restoreVersionInput, async (input) => {
  const { db, workspaceId } = await context();
  const { version } = await restoreVersion(db, workspaceId, input.draftId, input.version);
  refresh();
  return { message: `v${input.version}의 내용을 v${version}로 되살렸어요.` };
});

export const linkDraftAction = formAction(linkDraftInput, async (input) => {
  const { db, workspaceId } = await context();
  await linkDraftToOrder(db, workspaceId, input.draftId, input.orderId);
  refresh();
  return { message: input.orderId ? "의뢰에 연결했어요." : "의뢰 연결을 풀었어요." };
});

export const deleteDraftAction = action(draftIdInput, async ({ draftId }) => {
  const { db, workspaceId } = await context();
  await deleteDraft(db, workspaceId, draftId);
  refresh();
  redirect(`${BASE}/drafts`);
});

// ------------------------------------------------------------------ cases, plans, demo

export const publishCaseAction = formAction(publishCaseInput, async (input) => {
  const { db, workspaceId } = await context();
  await publishCase(db, workspaceId, input);
  refresh();
  return { message: "사례 게시판에 올렸어요." };
});

export const deleteCaseAction = action(caseIdInput, async ({ caseId }) => {
  const { db, workspaceId } = await context();
  await deleteCase(db, workspaceId, caseId);
  refresh();
  return { message: "사례를 내렸어요." };
});

export const updateCaseAction = formAction(caseEditInput, async (input) => {
  const { db, workspaceId } = await context();
  await updateCase(db, workspaceId, input);
  refresh();
  return { message: "사례를 고쳤어요." };
});

export const selectPlanAction = action(selectPlanInput, async ({ plan }) => {
  const { db, workspaceId } = await context();
  await selectPlan(db, workspaceId, plan);
  refresh();
  return { message: `${PLANS[plan].name} 요금제로 바꿨어요.` };
});

export const inquiryAction = formAction(inquiryInput, async (input) => {
  const { db, workspaceId } = await context();
  await createInquiry(db, workspaceId, input);
  refresh();
  return { message: "견적 문의를 남겼어요. 데모라서 실제로 연락이 가지는 않아요." };
});

export const deleteInquiryAction = action(inquiryIdInput, async ({ inquiryId }) => {
  const { db, workspaceId } = await context();
  await deleteInquiry(db, workspaceId, inquiryId);
  refresh();
  return { message: "문의를 거뒀어요." };
});

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(contentAgency);
  refresh();
  return { message: "데모 데이터를 처음 상태로 되돌렸어요." };
});
