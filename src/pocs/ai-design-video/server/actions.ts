"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction, UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { STATUS_INFO } from "../domain/catalog";
import * as inputs from "../domain/inputs";
import { aiDesignVideo } from "../module";
import { draftBrief } from "./ai";
import * as orderData from "./order-data";
import * as studioData from "./studio-data";

const BASE = "/ai-design-video";
const context = () => getModuleContext(aiDesignVideo);
const refresh = () => revalidatePath(BASE, "layout");

// ── Orders ───────────────────────────────────────────────────────────────────

export const createOrderAction = formAction(inputs.orderInput, async (input) => {
  const { db, workspaceId } = await context();
  const order = await orderData.createOrder(db, workspaceId, input, seoulDateKey());
  refresh();
  redirect(`${BASE}/orders/${order.id}`);
});

export const updateOrderAction = formAction(inputs.orderUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  await orderData.updateOrder(db, workspaceId, id, input);
  refresh();
  redirect(`${BASE}/orders/${id}`);
});

export const deleteOrderAction = action(inputs.orderIdInput, async ({ orderId }) => {
  const { db, workspaceId } = await context();
  await orderData.deleteOrder(db, workspaceId, orderId);
  refresh();
  redirect(`${BASE}/orders`);
});

export const transitionOrderAction = action(inputs.transitionInput, async ({ orderId, to }) => {
  const { db, workspaceId } = await context();
  await orderData.transitionOrder(db, workspaceId, orderId, to);
  refresh();
  return { message: `${STATUS_INFO[to].label} 단계로 옮겼어요.` };
});

export const requestRevisionAction = formAction(inputs.revisionInput, async (input) => {
  const { db, workspaceId } = await context();
  const plan = await orderData.requestRevision(db, workspaceId, input);
  refresh();
  return {
    message:
      plan.extraFee > 0
        ? `수정 ${plan.round}차를 추가 수정으로 기록했어요. 추가 비용 ${plan.extraFee.toLocaleString("ko-KR")}원이 금액에 더해졌어요.`
        : `수정 ${plan.round}차를 기록했어요.`,
  };
});

// ── AI brief ─────────────────────────────────────────────────────────────────

export const generateBriefAction = action(inputs.orderIdInput, async ({ orderId }) => {
  const { db, workspaceId } = await context();
  const order = await orderData.findOrder(db, workspaceId, orderId);
  if (!order) throw new UserError("주문을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  const drafted = await draftBrief({
    type: order.type,
    title: order.title,
    clientName: order.clientName,
    brief: order.brief,
    quantity: order.quantity,
  });
  await orderData.saveBrief(db, workspaceId, order.id, drafted.content, drafted.source);
  refresh();
  return {
    message:
      drafted.notice ??
      (drafted.source === "claude" ? "Claude가 새 콘티를 만들었어요." : "기본 템플릿으로 새 콘티를 만들었어요."),
  };
});

export const deleteBriefAction = action(inputs.briefIdInput, async ({ briefId }) => {
  const { db, workspaceId } = await context();
  await orderData.deleteBrief(db, workspaceId, briefId);
  refresh();
  return { message: "콘티를 삭제했어요." };
});

// ── Portfolio ────────────────────────────────────────────────────────────────

export const createPortfolioAction = formAction(inputs.portfolioInput, async (input) => {
  const { db, workspaceId } = await context();
  const item = await studioData.createPortfolioItem(db, workspaceId, input);
  refresh();
  redirect(`${BASE}/portfolio/${item.id}`);
});

export const updatePortfolioAction = formAction(inputs.portfolioUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await context();
  await studioData.updatePortfolioItem(db, workspaceId, id, input);
  refresh();
  redirect(`${BASE}/portfolio/${id}`);
});

export const deletePortfolioAction = action(inputs.portfolioIdInput, async ({ id }) => {
  const { db, workspaceId } = await context();
  await studioData.deletePortfolioItem(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/portfolio`);
});

// ── Studio settings ──────────────────────────────────────────────────────────

export const setGoalAction = formAction(inputs.goalInput, async ({ monthlyGoal }) => {
  const { db, workspaceId } = await context();
  await studioData.setMonthlyGoal(db, workspaceId, monthlyGoal);
  refresh();
  return { message: "이번 달 목표를 바꿨어요." };
});

export const updatePackageAction = formAction(inputs.packageUpdateInput, async (input) => {
  const { db, workspaceId } = await context();
  const pkg = await studioData.updatePackage(db, workspaceId, input);
  refresh();
  return { message: `${pkg.name} 조건을 저장했어요. 이미 받은 주문의 금액은 바뀌지 않아요.` };
});

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(aiDesignVideo);
  refresh();
  return { message: "샘플 데이터를 처음 상태로 되돌렸어요." };
});
