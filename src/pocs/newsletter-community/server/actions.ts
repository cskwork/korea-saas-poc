"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction, UserError } from "@/core/actions";
import { formatMonthDay, formatNumber, seoulDateKey } from "@/core/format";
import { resetModuleData } from "@/core/modules/context";
import { newsletterCommunity } from "../module";
import { parseSubscriberCsv } from "../domain/csv";
import { seoulInstant } from "../domain/dates";
import { publishProblems } from "../domain/issues";
import { TIER_LABEL } from "../domain/tiers";
import { editorActor, forgetReader, moduleContext, readerActor, rememberReader } from "./context";
import {
  boardTargetInput,
  commentInput,
  csvImportInput,
  idInput,
  issueFormInput,
  likeInput,
  membershipSaleInput,
  pinInput,
  planInput,
  postInput,
  publicationInput,
  signupInput,
  sponsorshipInput,
  sponsorshipStatusInput,
  subscriberInput,
  subscriberUpdateInput,
  subscriptionChangeInput,
} from "./schemas";
import { addComment, createPost, deleteComment, deletePost, setLike, setPinned } from "./store/board";
import {
  createIssue,
  deleteIssue,
  placeSponsorship,
  publishIssue,
  scheduleIssue,
  unscheduleIssue,
  updateIssue,
} from "./store/issues";
import { updatePlan, updatePublication } from "./store/publication";
import {
  createMembershipSale,
  createSponsorship,
  deleteMembershipSale,
  deleteSponsorship,
  setSponsorshipStatus,
} from "./store/revenue";
import {
  changeSubscription,
  createSubscriber,
  deleteSubscriber,
  importSubscribers,
  longestStandingMember,
  signUp,
  updateSubscriber,
} from "./store/subscribers";

const BASE = "/newsletter-community";

function refresh() {
  revalidatePath(BASE, "layout");
}

// ---- issues ---------------------------------------------------------------

/** One form, four intents: save, schedule, unschedule, publish now. New issues are created first. */
export const saveIssue = formAction(issueFormInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  const now = new Date();
  const content = {
    title: input.title,
    lede: input.lede,
    body: input.body,
    category: input.category,
    audience: input.audience,
  };
  const scheduleAt =
    input.intent === "schedule" && input.scheduleDate && input.scheduleTime
      ? seoulInstant(input.scheduleDate, input.scheduleTime)
      : null;

  // Check the intent before anything is written, so a rejected publish never leaves a stray draft behind.
  if (input.intent === "publish" || input.intent === "schedule") {
    const [problem] = publishProblems(content);
    if (problem) throw new UserError(problem);
  }
  if (scheduleAt && scheduleAt.getTime() <= now.getTime() + 60_000) {
    throw new UserError("예약 시각은 지금보다 뒤로 골라 주세요.");
  }

  const created = !input.id;
  const id = input.id ?? (await createIssue(db, workspaceId, content, now));
  if (!created) await updateIssue(db, workspaceId, id, content, now);
  await placeSponsorship(db, workspaceId, id, input.sponsorshipId ?? null);

  let message = "원고를 저장했어요.";
  if (input.intent === "schedule" && scheduleAt) {
    await scheduleIssue(db, workspaceId, id, scheduleAt, now);
    message = `${formatMonthDay(scheduleAt)} ${input.scheduleTime}에 발행하도록 예약했어요.`;
  } else if (input.intent === "unschedule") {
    await unscheduleIssue(db, workspaceId, id, now);
    message = "예약을 풀고 초안으로 되돌렸어요.";
  } else if (input.intent === "publish") {
    const { number, recipients } = await publishIssue(db, workspaceId, id, now);
    message = `제${number}호를 ${formatNumber(recipients)}명에게 발송했어요.`;
  }

  refresh();
  if (created) redirect(`${BASE}/issues/${id}?done=${input.intent}`);
  return { message };
});

export const removeIssue = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await moduleContext();
  await deleteIssue(db, workspaceId, id);
  refresh();
  redirect(`${BASE}/issues?deleted=1`);
});

// ---- subscribers ----------------------------------------------------------

export const addSubscriber = formAction(subscriberInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  await createSubscriber(db, workspaceId, { ...input, source: "manual" }, seoulDateKey());
  refresh();
  return { message: `${input.name}님을 명부에 올렸어요.` };
});

export const editSubscriber = formAction(subscriberUpdateInput, async ({ id, ...input }) => {
  const { db, workspaceId } = await moduleContext();
  await updateSubscriber(db, workspaceId, id, input, seoulDateKey());
  refresh();
  return { message: `${input.name}님의 정보를 고쳤어요.` };
});

export const changeSubscriberPlan = action(subscriptionChangeInput, async ({ id, tier, status }) => {
  const { db, workspaceId } = await moduleContext();
  const updated = await changeSubscription(db, workspaceId, id, { tier, status }, seoulDateKey());
  refresh();
  const what = status ? (status === "active" ? "구독을 다시 시작했어요" : "구독을 해지 처리했어요") : `${TIER_LABEL[updated.tier]} 등급으로 바꿨어요`;
  return { message: `${updated.name}님의 ${what}.` };
});

export const removeSubscriber = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await moduleContext();
  await deleteSubscriber(db, workspaceId, id);
  refresh();
  return { message: "명부에서 지웠어요." };
});

export const importSubscribersCsv = formAction(csvImportInput, async ({ file }) => {
  const { db, workspaceId } = await moduleContext();
  const parsed = parseSubscriberCsv(await file.text());
  if (parsed.rows.length === 0 && parsed.errors.length > 0 && parsed.errors[0].line === 1) {
    throw new UserError(parsed.errors[0].message);
  }
  const { added, skipped } = await importSubscribers(db, workspaceId, parsed.rows, seoulDateKey());
  refresh();
  const parts = [`${formatNumber(added)}명을 새로 올렸어요`];
  if (skipped > 0) parts.push(`이미 있는 이메일 ${formatNumber(skipped)}명은 건너뛰었어요`);
  if (parsed.errors.length > 0) parts.push(`${formatNumber(parsed.errors.length)}줄은 읽지 못했어요`);
  return { message: `${parts.join(", ")}.`, data: { errors: parsed.errors.slice(0, 8) } };
});

// ---- board ----------------------------------------------------------------

async function boardActor(as: "editor" | "reader") {
  return as === "editor" ? editorActor() : readerActor();
}

const boardBase = (as: "editor" | "reader") => (as === "editor" ? `${BASE}/board` : `${BASE}/letter/board`);

export const writePost = formAction(postInput, async ({ as, ...input }) => {
  const { db, workspaceId } = await moduleContext();
  const id = await createPost(db, workspaceId, await boardActor(as), input, new Date());
  refresh();
  redirect(`${boardBase(as)}/${id}`);
});

export const removePost = action(boardTargetInput, async ({ as, id }) => {
  const { db, workspaceId } = await moduleContext();
  await deletePost(db, workspaceId, await boardActor(as), id);
  refresh();
  redirect(boardBase(as));
});

export const pinPost = action(pinInput, async ({ id, pinned }) => {
  const { db, workspaceId } = await moduleContext();
  await setPinned(db, workspaceId, await editorActor(), id, pinned);
  refresh();
  return { message: pinned ? "맨 위에 고정했어요." : "고정을 풀었어요." };
});

export const writeComment = formAction(commentInput, async ({ as, postId, body }) => {
  const { db, workspaceId } = await moduleContext();
  await addComment(db, workspaceId, await boardActor(as), postId, body, new Date());
  refresh();
  return { message: "댓글을 달았어요." };
});

export const removeComment = action(boardTargetInput, async ({ as, id }) => {
  const { db, workspaceId } = await moduleContext();
  await deleteComment(db, workspaceId, await boardActor(as), id);
  refresh();
  return { message: "댓글을 지웠어요." };
});

export const likePost = action(likeInput, async ({ as, postId, liked }) => {
  const { db, workspaceId } = await moduleContext();
  const result = await setLike(db, workspaceId, await boardActor(as), postId, liked);
  refresh();
  return { data: result };
});

// ---- revenue --------------------------------------------------------------

export const addSponsorship = formAction(sponsorshipInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  await createSponsorship(db, workspaceId, input);
  refresh();
  return { message: `${input.sponsorName} 광고를 장부에 적었어요.` };
});

export const changeSponsorshipStatus = action(sponsorshipStatusInput, async ({ id, status }) => {
  const { db, workspaceId } = await moduleContext();
  await setSponsorshipStatus(db, workspaceId, id, status);
  refresh();
  return { message: "광고 계약 상태를 바꿨어요." };
});

export const removeSponsorship = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await moduleContext();
  await deleteSponsorship(db, workspaceId, id);
  refresh();
  return { message: "광고 계약을 지웠어요." };
});

export const addMembershipSale = formAction(membershipSaleInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  await createMembershipSale(db, workspaceId, input);
  refresh();
  return { message: `${input.item} 매출을 적었어요.` };
});

export const removeMembershipSale = action(idInput, async ({ id }) => {
  const { db, workspaceId } = await moduleContext();
  await deleteMembershipSale(db, workspaceId, id);
  refresh();
  return { message: "멤버십 매출을 지웠어요." };
});

// ---- settings -------------------------------------------------------------

export const savePublication = formAction(publicationInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  await updatePublication(db, workspaceId, input);
  refresh();
  return { message: "레터 정보를 저장했어요." };
});

export const savePlan = formAction(planInput, async (input) => {
  const { db, workspaceId } = await moduleContext();
  await updatePlan(db, workspaceId, input);
  refresh();
  return { message: `${input.name} 플랜을 저장했어요.` };
});

export const resetDemo = action(z.object({}), async () => {
  await resetModuleData(newsletterCommunity);
  await forgetReader();
  refresh();
  return { message: "샘플 데이터로 처음 상태를 되돌렸어요." };
});

// ---- public letter --------------------------------------------------------

export const subscribe = formAction(signupInput, async ({ returnTo, ...input }) => {
  const { db, workspaceId } = await moduleContext();
  const { subscriber, created } = await signUp(db, workspaceId, input, seoulDateKey());
  await rememberReader(subscriber.id);
  refresh();
  if (returnTo) redirect(returnTo);
  return {
    message: created
      ? `${subscriber.name}님, ${TIER_LABEL[subscriber.tier]} 구독을 시작했어요.`
      : `다시 만나 반가워요. ${TIER_LABEL[subscriber.tier]} 구독자로 기억할게요.`,
  };
});

/** Demo shortcut: read the letter as the longest-standing active 프로 member of the sample list. */
export const readAsSampleMember = action(z.object({}), async () => {
  const { db, workspaceId } = await moduleContext();
  const member = await longestStandingMember(db, workspaceId, "pro");
  if (!member) throw new UserError("프로 구독자가 없어요. 설정에서 샘플 데이터를 되돌려 주세요.");
  await rememberReader(member.id);
  refresh();
  return { message: `샘플 프로 독자 ${member.name}님으로 읽고 있어요.` };
});

export const stopReading = action(z.object({}), async () => {
  await forgetReader();
  refresh();
  return { message: "이 브라우저에서 독자 기록을 지웠어요." };
});
