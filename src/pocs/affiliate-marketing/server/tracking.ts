import "server-only";
import { eq } from "drizzle-orm";
import { clicks, links } from "../db/schema";
import type { Channel, Device } from "../domain/catalog";
import type { Db } from "./db";

/**
 * The public side of a short link. Codes are globally unique, so the lookup is
 * deliberately not workspace-scoped: anyone who clicks a marketer's link is
 * redirected, and the click is recorded in the link owner's workspace.
 */
export async function resolveCode(db: Db, code: string) {
  const [row] = await db
    .select({ id: links.id, workspaceId: links.workspaceId, destinationUrl: links.destinationUrl, status: links.status, productName: links.productName })
    .from(links)
    .where(eq(links.code, code))
    .limit(1);
  return row ?? null;
}

export interface ClickEvent {
  linkId: string;
  workspaceId: string;
  channel: Channel;
  referrerHost: string | null;
  device: Device;
  at?: Date;
}

export async function recordClick(db: Db, event: ClickEvent) {
  await db.insert(clicks).values({
    linkId: event.linkId,
    workspaceId: event.workspaceId,
    channel: event.channel,
    referrerHost: event.referrerHost,
    device: event.device,
    clickedAt: event.at ?? new Date(),
  });
}
