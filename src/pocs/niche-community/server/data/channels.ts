import "server-only";
import { and, asc, count, eq, max } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { channels, posts } from "../../db/schema";
import type { ChannelIconKey, ChannelInput } from "../../domain/inputs";
import { isOperator, type Viewer } from "../../domain/rules";
import type { Db } from "./db";
import type { ChannelSummary } from "../types";

export async function loadChannels(db: Db, workspaceId: string): Promise<ChannelSummary[]> {
  const rows = await db
    .select({
      id: channels.id,
      name: channels.name,
      description: channels.description,
      icon: channels.icon,
      access: channels.access,
      position: channels.position,
      postCount: count(posts.id),
      lastPostAt: max(posts.createdAt),
    })
    .from(channels)
    .leftJoin(posts, eq(posts.channelId, channels.id))
    .where(eq(channels.workspaceId, workspaceId))
    .groupBy(channels.id)
    .orderBy(asc(channels.position), asc(channels.createdAt));
  return rows.map((row) => ({ ...row, icon: row.icon as ChannelIconKey }));
}

function requireOperator(viewer: Viewer) {
  if (!isOperator(viewer)) throw new UserError("채널 관리는 운영자 명찰로만 할 수 있어요.");
}

async function nameTaken(db: Db, workspaceId: string, name: string, exceptId?: string) {
  const rows = await db
    .select({ id: channels.id })
    .from(channels)
    .where(and(eq(channels.workspaceId, workspaceId), eq(channels.name, name)));
  return rows.some((row) => row.id !== exceptId);
}

export async function createChannel(db: Db, workspaceId: string, viewer: Viewer, input: ChannelInput) {
  requireOperator(viewer);
  if (await nameTaken(db, workspaceId, input.name)) throw new UserError("같은 이름의 채널이 이미 있어요.");
  const [last] = await db.select({ value: max(channels.position) }).from(channels).where(eq(channels.workspaceId, workspaceId));
  const [created] = await db
    .insert(channels)
    .values({ workspaceId, ...input, position: (last?.value ?? -1) + 1 })
    .returning({ id: channels.id });
  return created.id;
}

export async function updateChannel(db: Db, workspaceId: string, viewer: Viewer, input: ChannelInput & { id: string }) {
  requireOperator(viewer);
  if (await nameTaken(db, workspaceId, input.name, input.id)) throw new UserError("같은 이름의 채널이 이미 있어요.");
  const { id, ...values } = input;
  const updated = await db
    .update(channels)
    .set(values)
    .where(and(eq(channels.id, id), eq(channels.workspaceId, workspaceId)))
    .returning({ id: channels.id });
  if (updated.length === 0) throw new UserError("채널을 찾을 수 없어요.");
  // A channel that becomes premium makes its posts premium-only as well.
  if (values.access === "premium") {
    await db.update(posts).set({ premiumOnly: true }).where(and(eq(posts.channelId, id), eq(posts.workspaceId, workspaceId)));
  }
}

/** Deletes the channel and, by cascade, its posts. Returns how many posts went with it. */
export async function deleteChannel(db: Db, workspaceId: string, viewer: Viewer, channelId: string) {
  requireOperator(viewer);
  const all = await loadChannels(db, workspaceId);
  const channel = all.find((row) => row.id === channelId);
  if (!channel) throw new UserError("채널을 찾을 수 없어요.");
  if (all.length === 1) throw new UserError("마지막 채널은 삭제할 수 없어요. 새 채널을 먼저 만들어 주세요.");
  await db.delete(channels).where(and(eq(channels.id, channelId), eq(channels.workspaceId, workspaceId)));
  return channel.postCount;
}

/** Swaps the channel with its neighbour in the agenda order. */
export async function moveChannel(db: Db, workspaceId: string, viewer: Viewer, channelId: string, direction: "up" | "down") {
  requireOperator(viewer);
  const all = await loadChannels(db, workspaceId);
  const index = all.findIndex((row) => row.id === channelId);
  if (index < 0) throw new UserError("채널을 찾을 수 없어요.");
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= all.length) return;
  const reordered = [...all];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  await db.transaction(async (tx) => {
    for (const [position, row] of reordered.entries()) {
      await tx
        .update(channels)
        .set({ position })
        .where(and(eq(channels.id, row.id), eq(channels.workspaceId, workspaceId)));
    }
  });
}
