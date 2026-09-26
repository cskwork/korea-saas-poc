import "server-only";
import { cache } from "react";
import { z } from "zod";
import { aiStatus } from "@/core/ai";
import { seoulDateKey } from "@/core/format";
import { getModuleContext } from "@/core/modules/context";
import { CONTENT_KINDS, INDUSTRIES, type ContentKind } from "../domain/content";
import { contentAgency } from "../module";
import { loadDashboard } from "./store/dashboard";
import { DRAFT_SORTS, getDraftDetail, listDrafts, type DraftSort } from "./store/drafts";
import { getOrderDetail, listOpenOrders, listOrders } from "./store/orders";
import { currentPlan, ordersReceivedThisMonth, planHistory, recentInquiries } from "./store/plans";
import { findCaseForDraft, listCases } from "./store/portfolio";

/** Reads for the routes. Every one resolves the visitor's workspace first. */

const context = () => getModuleContext(contentAgency);
const isId = (value: string) => z.uuid().safeParse(value).success;

type SearchParam = string | string[] | undefined;
const single = (value: SearchParam) => (Array.isArray(value) ? value[0] : value);

/** Only known values survive from the URL. */
export function parseKind(value: SearchParam): ContentKind | undefined {
  const kind = single(value);
  return CONTENT_KINDS.find((k) => k === kind);
}

export function parseIndustry(value: SearchParam): string | undefined {
  const industry = single(value);
  return INDUSTRIES.find((i) => i === industry);
}

export function parseSort(value: SearchParam): DraftSort {
  const sort = single(value);
  return DRAFT_SORTS.find((s) => s === sort) ?? "recent";
}

export function parseQuery(value: SearchParam): string {
  return (single(value) ?? "").trim().slice(0, 60);
}

export function getAiMode() {
  return aiStatus().enabled ? "claude" : "template";
}

export async function getDashboard() {
  const { db, workspaceId } = await context();
  return loadDashboard(db, workspaceId);
}

export async function getOrderBoard(filters: { q: string; kind?: ContentKind }) {
  const { db, workspaceId } = await context();
  return { orders: await listOrders(db, workspaceId, filters), today: seoulDateKey() };
}

export const getOrder = cache(async (orderId: string) => {
  if (!isId(orderId)) return null;
  const { db, workspaceId } = await context();
  const detail = await getOrderDetail(db, workspaceId, orderId);
  if (!detail) return null;
  const [publishedCase, plan] = await Promise.all([
    detail.order.deliveredDraftId ? findCaseForDraft(db, workspaceId, detail.order.deliveredDraftId) : null,
    currentPlan(db, workspaceId),
  ]);
  return { ...detail, publishedCase, plan, today: seoulDateKey() };
});

export async function getOpenOrders() {
  const { db, workspaceId } = await context();
  return listOpenOrders(db, workspaceId);
}

export async function getNewOrderContext() {
  const { db, workspaceId } = await context();
  const today = seoulDateKey();
  const [plan, used] = await Promise.all([currentPlan(db, workspaceId), ordersReceivedThisMonth(db, workspaceId, today)]);
  return { plan, used, today };
}

export async function getDraftLibrary(filters: { q: string; kind?: ContentKind; sort: DraftSort }) {
  const { db, workspaceId } = await context();
  return listDrafts(db, workspaceId, filters);
}

export const getDraft = cache(async (draftId: string) => {
  if (!isId(draftId)) return null;
  const { db, workspaceId } = await context();
  const detail = await getDraftDetail(db, workspaceId, draftId);
  if (!detail) return null;
  const openOrders = await listOpenOrders(db, workspaceId);
  return { ...detail, openOrders };
});

export async function getCases(filters: { industry?: string; kind?: ContentKind }) {
  const { db, workspaceId } = await context();
  return listCases(db, workspaceId, filters);
}

export async function getPricing() {
  const { db, workspaceId } = await context();
  const today = seoulDateKey();
  const [plan, used, history, inquiries, open] = await Promise.all([
    currentPlan(db, workspaceId),
    ordersReceivedThisMonth(db, workspaceId, today),
    planHistory(db, workspaceId),
    recentInquiries(db, workspaceId),
    listOpenOrders(db, workspaceId),
  ]);
  const openKinds = CONTENT_KINDS.filter((kind) => open.some((o) => o.kind === kind));
  return { plan, used, history, inquiries, openKinds };
}
