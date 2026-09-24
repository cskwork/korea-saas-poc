"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction } from "@/core/actions";
import { getModuleContext, resetModuleData } from "@/core/modules/context";
import { STATUS_VERB } from "../domain/status";
import { formatDayLabel, formatMinute, seoulClock } from "../domain/time";
import {
  bookingUpdateSchema,
  customerSchema,
  customerUpdateSchema,
  idSchema,
  onlineBookingSchema,
  ownerBookingSchema,
  planSchema,
  serviceSchema,
  serviceUpdateSchema,
  shopSchema,
  statusChangeSchema,
} from "../domain/validation";
import { planById } from "../domain/plans";
import { microSaasModule } from "../module";
import {
  createOnlineBooking,
  createOwnerBooking,
  deleteBooking,
  setBookingStatus,
  updateBooking,
} from "./store/bookings";
import { createCustomer, deleteCustomer, updateCustomer } from "./store/customers";
import { createService, deleteService, setPlan, updateService, updateShop } from "./store/shop";

/**
 * Mutations for /micro-saas. Each one validates with zod, resolves the workspace on the
 * server (never from the client), delegates to a store function and revalidates the module.
 */

const ctx = () => getModuleContext(microSaasModule);
const refresh = () => revalidatePath("/micro-saas", "layout");

export const createBookingAction = formAction(ownerBookingSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  const { id } = await createOwnerBooking(db, workspaceId, input);
  refresh();
  return {
    data: { id },
    message: `${formatDayLabel(input.date)} ${formatMinute(input.time)} ${input.customerName}님 예약을 적었어요.`,
  };
});

export const updateBookingAction = formAction(bookingUpdateSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  await updateBooking(db, workspaceId, input);
  refresh();
  return { message: `예약을 ${formatDayLabel(input.date)} ${formatMinute(input.time)}(으)로 고쳤어요.` };
});

export const setBookingStatusAction = action(statusChangeSchema, async ({ id, status }) => {
  const { db, workspaceId } = await ctx();
  const before = await setBookingStatus(db, workspaceId, id, status);
  refresh();
  return {
    data: { previous: before.previous },
    message: `${formatMinute(before.startMinute)} ${before.customerName}님 예약을 ${STATUS_VERB[status]}`,
  };
});

/** Removes a booking written by mistake; with `returnTo` (a /micro-saas path) the page moves there. */
export const deleteBookingAction = action(
  z.object({ id: idSchema, returnTo: z.string().startsWith("/micro-saas").optional() }),
  async ({ id, returnTo }) => {
    const { db, workspaceId } = await ctx();
    await deleteBooking(db, workspaceId, id);
    refresh();
    if (returnTo) redirect(returnTo);
    return { message: "예약을 지웠어요." };
  },
);

/** The public booking page: strict slot check, lands as 대기, then shows the stamped receipt. */
export const bookOnlineAction = formAction(onlineBookingSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  const { id } = await createOnlineBooking(db, workspaceId, input, seoulClock());
  refresh();
  redirect(`/micro-saas/book?receipt=${id}`);
});

export const createCustomerAction = formAction(customerSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  const customer = await createCustomer(db, workspaceId, input);
  refresh();
  redirect(`/micro-saas/customers/${customer.id}`);
});

export const updateCustomerAction = formAction(customerUpdateSchema, async ({ id, ...input }) => {
  const { db, workspaceId } = await ctx();
  await updateCustomer(db, workspaceId, id, input);
  refresh();
  return { message: `${input.name}님 정보를 저장했어요.` };
});

export const deleteCustomerAction = action(z.object({ id: idSchema }), async ({ id }) => {
  const { db, workspaceId } = await ctx();
  await deleteCustomer(db, workspaceId, id);
  refresh();
  redirect("/micro-saas/customers");
});

export const updateShopAction = formAction(shopSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  await updateShop(db, workspaceId, input);
  refresh();
  return { message: "매장 정보를 저장했어요. 예약 가능 시간에 바로 반영돼요." };
});

export const createServiceAction = formAction(serviceSchema, async (input) => {
  const { db, workspaceId } = await ctx();
  const service = await createService(db, workspaceId, input);
  refresh();
  return { message: `‘${service.name}’ 서비스를 추가했어요.` };
});

export const updateServiceAction = formAction(serviceUpdateSchema, async ({ id, ...input }) => {
  const { db, workspaceId } = await ctx();
  const service = await updateService(db, workspaceId, id, input);
  refresh();
  return { message: `‘${service.name}’ 서비스를 저장했어요.` };
});

export const deleteServiceAction = action(z.object({ id: idSchema }), async ({ id }) => {
  const { db, workspaceId } = await ctx();
  const service = await deleteService(db, workspaceId, id);
  refresh();
  return { message: `‘${service.name}’ 서비스를 지웠어요. 지난 예약 기록은 그대로 남아요.` };
});

export const setPlanAction = action(planSchema, async ({ plan }) => {
  const { db, workspaceId } = await ctx();
  await setPlan(db, workspaceId, plan);
  refresh();
  return { message: `${planById(plan).name} 요금제로 바꿨어요. 데모라 결제는 진행되지 않아요.` };
});

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(microSaasModule);
  refresh();
  return { message: "샘플 데이터를 새로 만들었어요." };
});
