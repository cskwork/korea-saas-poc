import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { z } from "zod";
import { getModuleContext } from "@/core/modules/context";
import { newsletterCommunity } from "../module";
import type { BoardActor } from "../domain/board";
import { publishDueIssues } from "./store/issues";
import { getPublication } from "./store/publication";
import { getSubscriber } from "./store/subscribers";

/**
 * Request-scoped module context. Scheduled issues whose time has passed are
 * published here, once per request, so "예약 발행" works without a cron job.
 */
export const moduleContext = cache(async () => {
  const context = await getModuleContext(newsletterCommunity);
  await publishDueIssues(context.db, context.workspaceId, new Date());
  return context;
});

/** The workspace owner acting in the studio. */
export const editorActor = cache(async (): Promise<BoardActor> => {
  const { db, workspaceId } = await moduleContext();
  const publication = await getPublication(db, workspaceId);
  return { role: "editor", name: publication.editorName };
});

/**
 * The public letter recognises a reader by a cookie set when they subscribe
 * (there is no login in this demo). It only ever points at a subscriber row of
 * the visitor's own workspace.
 */
export const READER_COOKIE = "nc_reader";
const READER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const currentReader = cache(async () => {
  const value = (await cookies()).get(READER_COOKIE)?.value;
  const id = z.uuid().safeParse(value);
  if (!id.success) return null;
  const { db, workspaceId } = await moduleContext();
  return getSubscriber(db, workspaceId, id.data);
});

export type Reader = NonNullable<Awaited<ReturnType<typeof currentReader>>>;

export async function readerActor(): Promise<BoardActor | null> {
  const reader = await currentReader();
  if (!reader) return null;
  return {
    role: "member",
    name: reader.name,
    subscriberId: reader.id,
    tier: reader.tier,
    active: reader.status === "active",
  };
}

export async function rememberReader(subscriberId: string) {
  (await cookies()).set({
    name: READER_COOKIE,
    value: subscriberId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/newsletter-community",
    maxAge: READER_COOKIE_MAX_AGE,
  });
}

export async function forgetReader() {
  (await cookies()).set({ name: READER_COOKIE, value: "", path: "/newsletter-community", maxAge: 0 });
}
