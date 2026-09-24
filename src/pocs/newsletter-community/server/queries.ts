import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { seoulDateKey } from "@/core/format";
import { parseMarkup, previewBlocks } from "../domain/markup";
import { canRead } from "../domain/tiers";
import type { BoardCategory } from "../domain/board";
import { currentReader, editorActor, moduleContext, readerActor } from "./context";
import { categoryCounts, getPost, listPosts } from "./store/board";
import { deskOverview } from "./store/desk";
import {
  getIssue,
  getPublishedIssue,
  issueReport,
  issueStatusCounts,
  listIssues,
  listPublishedIssues,
  nextNumber,
  placeableSponsorships,
  recipientCounts,
  sponsorshipForIssue,
  type IssueFilter,
} from "./store/issues";
import { getPlans, getPublication } from "./store/publication";
import { revenueOverview } from "./store/revenue";
import {
  listSubscribers,
  subscriberCounts,
  subscribersForExport,
  type SubscriberFilter,
} from "./store/subscribers";

/** Reads for the routes. Every function resolves the workspace itself; ids from the URL are validated here. */

function requireId(id: string): string {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) notFound();
  return parsed.data;
}

export async function getPublicationSummary() {
  const { db, workspaceId } = await moduleContext();
  return getPublication(db, workspaceId);
}

// ---- studio ---------------------------------------------------------------

export async function getDesk() {
  const { db, workspaceId } = await moduleContext();
  const now = new Date();
  return deskOverview(db, workspaceId, await editorActor(), now, seoulDateKey(now));
}

export async function getIssueList(filter: IssueFilter) {
  const { db, workspaceId } = await moduleContext();
  const [issues, counts, upcomingNumber] = await Promise.all([
    listIssues(db, workspaceId, filter, new Date()),
    issueStatusCounts(db, workspaceId),
    nextNumber(db, workspaceId),
  ]);
  return { issues, counts, nextNumber: upcomingNumber };
}

export async function getNewIssueContext() {
  const { db, workspaceId } = await moduleContext();
  const [recipients, sponsorOptions, publication, upcomingNumber] = await Promise.all([
    recipientCounts(db, workspaceId),
    placeableSponsorships(db, workspaceId, null),
    getPublication(db, workspaceId),
    nextNumber(db, workspaceId),
  ]);
  return { recipients, sponsorOptions, publication, nextNumber: upcomingNumber };
}

export const getIssueForEditor = cache(async (rawId: string) => {
  const id = requireId(rawId);
  const { db, workspaceId } = await moduleContext();
  const issue = await getIssue(db, workspaceId, id);
  if (!issue) notFound();
  const now = new Date();
  const [recipients, sponsorOptions, publication, report, upcomingNumber] = await Promise.all([
    recipientCounts(db, workspaceId),
    placeableSponsorships(db, workspaceId, issue.id),
    getPublication(db, workspaceId),
    issueReport(db, workspaceId, issue, now),
    nextNumber(db, workspaceId),
  ]);
  return { issue, recipients, sponsorOptions, publication, report, nextNumber: upcomingNumber };
});

export async function getSubscribersPage(filter: SubscriberFilter, page: number) {
  const { db, workspaceId } = await moduleContext();
  const [list, counts] = await Promise.all([
    listSubscribers(db, workspaceId, filter, new Date(), page),
    subscriberCounts(db, workspaceId),
  ]);
  return { ...list, counts };
}

export async function getSubscribersForExport(filter: SubscriberFilter) {
  const { db, workspaceId } = await moduleContext();
  return subscribersForExport(db, workspaceId, filter);
}

export async function getRevenue() {
  const { db, workspaceId } = await moduleContext();
  return revenueOverview(db, workspaceId, seoulDateKey());
}

export async function getSettings() {
  const { db, workspaceId } = await moduleContext();
  const [publication, plans] = await Promise.all([getPublication(db, workspaceId), getPlans(db, workspaceId)]);
  return { publication, plans };
}

// ---- board (studio as editor, letter as reader) ---------------------------

export type BoardView = "studio" | "letter";

async function viewer(view: BoardView) {
  return view === "studio" ? editorActor() : readerActor();
}

export async function getBoard(view: BoardView, category: BoardCategory | undefined) {
  const { db, workspaceId } = await moduleContext();
  const actor = await viewer(view);
  const [posts, counts] = await Promise.all([
    listPosts(db, workspaceId, { category, viewer: actor }),
    categoryCounts(db, workspaceId),
  ]);
  return { posts, counts, actor };
}

export const getPostDetail = cache(async (view: BoardView, rawId: string) => {
  const id = requireId(rawId);
  const { db, workspaceId } = await moduleContext();
  const actor = await viewer(view);
  const post = await getPost(db, workspaceId, id, actor);
  if (!post) notFound();
  return { post, actor };
});

// ---- public letter --------------------------------------------------------

export async function getLetterHome() {
  const { db, workspaceId } = await moduleContext();
  const [publication, plans, issues, reader] = await Promise.all([
    getPublication(db, workspaceId),
    getPlans(db, workspaceId),
    listPublishedIssues(db, workspaceId),
    currentReader(),
  ]);
  return { publication, plans, issues, reader };
}

export async function getLetterPlans() {
  const { db, workspaceId } = await moduleContext();
  const [publication, plans, reader] = await Promise.all([
    getPublication(db, workspaceId),
    getPlans(db, workspaceId),
    currentReader(),
  ]);
  return { publication, plans, reader };
}

/** A published issue as a reader sees it: the full text when their tier allows, the preview otherwise. */
export const getLetterIssue = cache(async (number: number) => {
  const { db, workspaceId } = await moduleContext();
  const issue = await getPublishedIssue(db, workspaceId, number);
  if (!issue) notFound();
  const [publication, plans, reader, sponsor, issues] = await Promise.all([
    getPublication(db, workspaceId),
    getPlans(db, workspaceId),
    currentReader(),
    sponsorshipForIssue(db, workspaceId, issue.id),
    listPublishedIssues(db, workspaceId),
  ]);
  const tier = reader?.status === "active" ? reader.tier : null;
  const unlocked = canRead(tier, issue.audience);
  const blocks = parseMarkup(issue.body);
  const index = issues.findIndex((entry) => entry.id === issue.id);
  return {
    issue,
    publication,
    plans,
    reader,
    sponsor,
    unlocked,
    blocks: unlocked ? blocks : previewBlocks(blocks),
    newer: index > 0 ? issues[index - 1] : null,
    older: index >= 0 && index < issues.length - 1 ? issues[index + 1] : null,
  };
});
