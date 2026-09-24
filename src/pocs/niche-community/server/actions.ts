"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { action, formAction } from "@/core/actions";
import { resetModuleData } from "@/core/modules/context";
import {
  channelInput,
  channelMoveInput,
  channelUpdateInput,
  commentInput,
  idInput,
  meetupInput,
  meetupUpdateInput,
  postInput,
  postUpdateInput,
  profileInput,
  tierChangeInput,
} from "../domain/inputs";
import { PREMIUM_PRICE_WON } from "../domain/rules";
import { formatWon } from "@/core/format";
import { nicheCommunity } from "../module";
import { openCommunity } from "./context";
import { createChannel, deleteChannel, moveChannel, updateChannel } from "./data/channels";
import { createMeetup, deleteMeetup, setRsvp, updateMeetup } from "./data/meetups";
import { updateProfile } from "./data/members";
import { changeTier } from "./data/membership";
import { addComment, createPost, deleteComment, deletePost, setPinned, toggleLike, updatePost } from "./data/posts";
import { switchPersona } from "./data/viewer";

/**
 * Mutations for /niche-community. Each validates its input, runs the matching data
 * function for the current tenant and persona, then revalidates the module's routes.
 */

const BASE = "/niche-community";
const refresh = () => revalidatePath(BASE, "layout");

/* ---- persona ---- */

export const switchPersonaAction = action(z.object({ memberId: z.uuid() }), async ({ memberId }) => {
  const { db, workspaceId } = await openCommunity();
  const member = await switchPersona(db, workspaceId, memberId);
  refresh();
  return { message: `${member.nickname} 명찰로 바꿨어요.` };
});

/* ---- posts ---- */

export const createPostAction = formAction(postInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  const id = await createPost(db, workspaceId, viewer, input, new Date());
  refresh();
  return { data: { id }, message: "슬라이드를 게시했어요." };
});

export const updatePostAction = formAction(postUpdateInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await updatePost(db, workspaceId, viewer, input, new Date());
  refresh();
  return { message: "수정한 내용을 저장했어요." };
});

export const deletePostAction = action(idInput, async ({ id }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await deletePost(db, workspaceId, viewer, id);
  refresh();
  redirect(BASE);
});

export const setPinnedAction = action(z.object({ id: z.uuid(), pinned: z.boolean() }), async ({ id, pinned }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await setPinned(db, workspaceId, viewer, id, pinned);
  refresh();
  return { message: pinned ? "공지로 고정했어요." : "공지 고정을 풀었어요." };
});

export const toggleLikeAction = action(idInput, async ({ id }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  const result = await toggleLike(db, workspaceId, viewer, id);
  refresh();
  return { data: result };
});

export const addCommentAction = formAction(commentInput, async ({ postId, body }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await addComment(db, workspaceId, viewer, postId, body);
  refresh();
  return { message: "댓글을 남겼어요." };
});

export const deleteCommentAction = action(idInput, async ({ id }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await deleteComment(db, workspaceId, viewer, id);
  refresh();
  return { message: "댓글을 삭제했어요." };
});

/* ---- channels (operator) ---- */

export const createChannelAction = formAction(channelInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await createChannel(db, workspaceId, viewer, input);
  refresh();
  return { message: `‘${input.name}’ 채널을 열었어요.` };
});

export const updateChannelAction = formAction(channelUpdateInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await updateChannel(db, workspaceId, viewer, input);
  refresh();
  return { message: "채널을 수정했어요." };
});

export const deleteChannelAction = action(idInput, async ({ id }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  const removedPosts = await deleteChannel(db, workspaceId, viewer, id);
  refresh();
  return { message: removedPosts ? `채널과 게시글 ${removedPosts}개를 삭제했어요.` : "채널을 삭제했어요." };
});

export const moveChannelAction = action(channelMoveInput, async ({ id, direction }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await moveChannel(db, workspaceId, viewer, id, direction);
  refresh();
});

/* ---- meetups ---- */

export const createMeetupAction = formAction(meetupInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  const id = await createMeetup(db, workspaceId, viewer, input, new Date());
  refresh();
  return { data: { id }, message: "모임을 열었어요." };
});

export const updateMeetupAction = formAction(meetupUpdateInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await updateMeetup(db, workspaceId, viewer, input);
  refresh();
  return { message: "모임 정보를 저장했어요." };
});

export const deleteMeetupAction = action(idInput, async ({ id }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await deleteMeetup(db, workspaceId, viewer, id);
  refresh();
  redirect(`${BASE}/meetups`);
});

export const rsvpAction = action(z.object({ id: z.uuid(), going: z.boolean() }), async ({ id, going }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await setRsvp(db, workspaceId, viewer, id, going, new Date());
  refresh();
  return { message: going ? "참석 신청했어요. 모임에서 만나요!" : "참석 신청을 취소했어요." };
});

/* ---- members and membership ---- */

export const updateProfileAction = formAction(profileInput, async (input) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await updateProfile(db, workspaceId, viewer.id, input);
  refresh();
  return { message: "프로필을 저장했어요." };
});

export const changeTierAction = action(tierChangeInput, async ({ change }) => {
  const { db, workspaceId, viewer } = await openCommunity();
  await changeTier(db, workspaceId, viewer, change, new Date());
  refresh();
  return {
    message:
      change === "upgrade"
        ? `프리미엄 멤버가 됐어요. ${formatWon(PREMIUM_PRICE_WON)} 결제 기록이 남았어요 (데모 결제).`
        : "무료 플랜으로 바꿨어요. 대외비 채널은 다시 잠겨요.",
  };
});

/* ---- demo ---- */

export const resetDemoAction = action(z.object({}), async () => {
  await resetModuleData(nicheCommunity);
  refresh();
  return { message: "데모 데이터를 처음 상태로 되돌렸어요." };
});
