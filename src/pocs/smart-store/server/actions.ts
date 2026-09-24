"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UserError, action, formAction } from "@/core/actions";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { CATEGORIES, SUPPLIER_LABEL } from "../domain/categories";
import { TITLE_MAX_LENGTH, splitHashtags, splitKeywords } from "../domain/listing-copy";
import { COURIERS } from "../domain/orders";
import { smartStore } from "../module";
import { clearCalculations, deleteCalculation, saveCalculation } from "./data/calculations";
import { removeSavedKeyword, saveKeyword } from "./data/keywords";
import { catalogListingDraft, deleteListing, getListing, insertListing, updateListing } from "./data/listings";
import { advanceOrder, cancelOrder, createTestOrder } from "./data/orders";
import { writeListingCopy } from "./copywriter";

const SLUG = "/smart-store";
const refresh = () => revalidatePath(SLUG, "layout");

const id = z.uuid({ error: "잘못된 요청이에요. 새로고침해 주세요." });
// Labels passed here all end in a vowel (매입가, 판매가, 배송비), hence 를/는/가.
const won = (label: string, min = 0) =>
  z.coerce
    .number({ error: `${label}를 숫자로 입력해 주세요.` })
    .int({ error: `${label}는 원 단위 정수로 입력해 주세요.` })
    .min(min, { error: `${label}는 ${min.toLocaleString("ko-KR")}원 이상이어야 해요.` })
    .max(100_000_000, { error: `${label}가 너무 커요.` });
const category = z.enum(CATEGORIES, { error: "카테고리를 골라 주세요." });

// ── Demo data ─────────────────────────────────────────────

export const resetDemoData = action(z.object({}), async () => {
  await resetModuleData(smartStore);
  refresh();
  return { message: "샘플 데이터를 처음 상태로 되돌렸어요." };
});

// ── Listings ──────────────────────────────────────────────

/** One click: AI (or template) copy for a catalogue item, then a new selling listing. */
export const listCatalogItem = formAction(z.object({ catalogItemId: id }), async ({ catalogItemId }) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const draft = await catalogListingDraft(db, workspaceId, catalogItemId);
  if (!draft) throw new UserError("도매 상품을 찾을 수 없어요.");
  if (draft.existingListingId) redirect(`${SLUG}/listings/${draft.existingListingId}`);

  const { copy, source, notice } = await writeListingCopy(draft.copyInput);
  const listingId = await insertListing(db, workspaceId, {
    catalogItemId: draft.item.id,
    originalName: draft.item.name,
    category: draft.item.category,
    supplier: draft.item.supplier,
    cost: draft.item.wholesalePrice,
    price: draft.item.suggestedPrice,
    shippingCost: draft.item.shippingCost,
    copy,
    copySource: source,
  });
  refresh();
  redirect(`${SLUG}/listings/${listingId}?created=${source}${notice ? "&notice=1" : ""}`);
});

const manualListingInput = z.object({
  originalName: z
    .string()
    .trim()
    .min(2, { error: "상품명을 2자 이상 입력해 주세요." })
    .max(100, { error: "상품명은 100자까지예요." }),
  category,
  cost: won("매입가", 100),
  price: won("판매가", 100),
  shippingCost: won("배송비"),
});

/** A product not in the catalogue, typed in by the seller. */
export const createManualListing = formAction(manualListingInput, async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const { copy, source, notice } = await writeListingCopy({ name: input.originalName, category: input.category });
  const listingId = await insertListing(db, workspaceId, {
    catalogItemId: null,
    originalName: input.originalName,
    category: input.category,
    supplier: null,
    cost: input.cost,
    price: input.price,
    shippingCost: input.shippingCost,
    copy,
    copySource: source,
  });
  refresh();
  redirect(`${SLUG}/listings/${listingId}?created=${source}${notice ? "&notice=1" : ""}`);
});

const listingEdit = z.object({
  id,
  title: z
    .string()
    .trim()
    .min(2, { error: "상품명을 입력해 주세요." })
    .max(TITLE_MAX_LENGTH, { error: `상품명은 ${TITLE_MAX_LENGTH}자까지 쓸 수 있어요.` }),
  description: z
    .string()
    .trim()
    .min(10, { error: "상세설명을 10자 이상 써 주세요." })
    .max(5_000, { error: "상세설명은 5,000자까지예요." }),
  keywords: z.string().default(""),
  hashtags: z.string().default(""),
  price: won("판매가", 100),
  cost: won("매입가"),
  shippingCost: won("배송비"),
});

export const saveListing = formAction(listingEdit, async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const current = await getListing(db, workspaceId, input.id);
  if (!current) throw new UserError("상품을 찾을 수 없어요. 이미 삭제되었을 수 있어요.");
  const rewritten = current.title !== input.title || current.description !== input.description;
  await updateListing(db, workspaceId, input.id, {
    title: input.title,
    description: input.description,
    keywords: splitKeywords(input.keywords),
    hashtags: splitHashtags(input.hashtags),
    price: input.price,
    cost: input.cost,
    shippingCost: input.shippingCost,
    ...(rewritten ? { copySource: "manual" as const } : {}),
  });
  refresh();
  return { message: "저장했어요." };
});

export const rewriteListingCopy = action(z.object({ id }), async ({ id: listingId }) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const listing = await getListing(db, workspaceId, listingId);
  if (!listing) throw new UserError("상품을 찾을 수 없어요.");
  const { copy, source, notice } = await writeListingCopy({
    name: listing.originalName,
    category: listing.category,
    supplierLabel: listing.supplier ? SUPPLIER_LABEL[listing.supplier] : undefined,
  });
  await updateListing(db, workspaceId, listingId, { ...copy, copySource: source });
  refresh();
  return { message: notice ?? (source === "claude" ? "Claude가 새로 썼어요." : "기본 템플릿으로 다시 썼어요.") };
});

export const setListingStatus = action(z.object({ id, status: z.enum(["selling", "paused"]) }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  await updateListing(db, workspaceId, input.id, { status: input.status });
  refresh();
  return { message: input.status === "selling" ? "다시 판매해요." : "판매를 멈췄어요. 새 주문이 들어오지 않아요." };
});

export const removeListing = action(z.object({ id }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  await deleteListing(db, workspaceId, input.id);
  refresh();
  redirect(`${SLUG}/listings?deleted=1`);
});

// ── Orders ────────────────────────────────────────────────

export const placeTestOrder = formAction(
  z.object({
    listingId: z.uuid({ error: "주문할 상품을 골라 주세요." }),
    quantity: z.coerce
      .number()
      .int()
      .min(1, { error: "수량은 1개 이상이에요." })
      .max(10, { error: "테스트 주문은 10개까지예요." }),
  }),
  async (input) => {
    const { db, workspaceId } = await getModuleContext(smartStore);
    const order = await createTestOrder(db, workspaceId, input);
    refresh();
    return { message: `${order.customerName}님의 테스트 주문이 신규주문으로 들어왔어요.` };
  },
);

/** 신규주문 → 발주확인 and 배송중 → 배송완료 (no extra input). */
export const advanceOrderStep = action(z.object({ id }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const order = await advanceOrder(db, workspaceId, input);
  refresh();
  return {
    message: order.status === "confirmed" ? "발주를 확인했어요. 송장이 나오면 입력해 주세요." : "배송 완료로 바꿨어요.",
  };
});

export const shipOrder = formAction(
  z.object({
    id,
    courier: z.enum(COURIERS, { error: "택배사를 골라 주세요." }),
    trackingNumber: z.string().trim().min(1, { error: "송장번호를 입력해 주세요." }),
  }),
  async (input) => {
    const { db, workspaceId } = await getModuleContext(smartStore);
    await advanceOrder(db, workspaceId, input);
    refresh();
    return { message: "송장을 등록했어요. 배송중으로 바뀌었어요." };
  },
);

export const cancelOrderAction = action(z.object({ id }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  await cancelOrder(db, workspaceId, input.id);
  refresh();
  return { message: "주문을 취소했어요." };
});

// ── Margin calculator ─────────────────────────────────────

export const saveCalculationAction = formAction(
  z.object({
    label: z.string().trim().max(40, { error: "메모는 40자까지예요." }).default(""),
    category,
    cost: won("매입가", 1),
    price: won("판매가", 1),
    shippingCost: won("배송비"),
    monthlyQuantity: z.coerce
      .number({ error: "월 판매량을 숫자로 입력해 주세요." })
      .int({ error: "월 판매량은 정수로 입력해 주세요." })
      .min(1, { error: "월 판매량은 1개 이상이에요." })
      .max(100_000, { error: "월 판매량이 너무 커요." }),
  }),
  async (input) => {
    const { db, workspaceId } = await getModuleContext(smartStore);
    await saveCalculation(db, workspaceId, { ...input, label: input.label || "이름 없는 계산" });
    refresh();
    return { message: "계산 기록에 남겼어요." };
  },
);

export const deleteCalculationAction = action(z.object({ id }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  await deleteCalculation(db, workspaceId, input.id);
  refresh();
  return { message: "기록을 지웠어요." };
});

export const clearCalculationsAction = action(z.object({}), async () => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  const removed = await clearCalculations(db, workspaceId);
  refresh();
  return { message: `기록 ${removed}건을 모두 지웠어요.` };
});

// ── Keywords ──────────────────────────────────────────────

export const saveKeywordAction = action(
  z.object({
    keyword: z
      .string()
      .trim()
      .min(1, { error: "키워드를 입력해 주세요." })
      .max(40, { error: "키워드는 40자까지예요." }),
  }),
  async (input) => {
    const { db, workspaceId } = await getModuleContext(smartStore);
    const added = await saveKeyword(db, workspaceId, input.keyword);
    refresh();
    return { message: added ? `"${input.keyword}" 키워드를 저장했어요.` : "이미 저장한 키워드예요." };
  },
);

export const removeKeywordAction = action(z.object({ id }), async (input) => {
  const { db, workspaceId } = await getModuleContext(smartStore);
  await removeSavedKeyword(db, workspaceId, input.id);
  refresh();
  return { message: "저장한 키워드에서 뺐어요." };
});
