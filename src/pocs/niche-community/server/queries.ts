import "server-only";
import { z } from "zod";
import { parseFeedQuery } from "../domain/inputs";
import { isOperator, postingAllowance } from "../domain/rules";
import { getCommunity } from "./context";
import { loadChannels } from "./data/channels";
import { loadDashboard } from "./data/dashboard";
import { loadMeetup, loadMeetups, loadNextMeetup } from "./data/meetups";
import { loadDirectory, loadProfile, type DirectoryFilter } from "./data/members";
import { loadMembership } from "./data/membership";
import { countPostsToday, loadFeed, loadMemberPosts, loadNeighbors, loadPost, loadSlideTitles } from "./data/posts";
import { loadPersonaOptions } from "./data/viewer";

/**
 * Reads for the routes under /niche-community. Each resolves the tenant and the
 * demo persona, then delegates to the data functions in ./data.
 */

type SearchParams = Record<string, string | string[] | undefined>;

const isId = (value: string) => z.uuid().safeParse(value).success;

export async function getShell() {
  const { db, workspaceId, viewer } = await getCommunity();
  return { viewer, personas: await loadPersonaOptions(db, workspaceId) };
}

export async function getViewer() {
  return (await getCommunity()).viewer;
}

export async function getFeedPage(searchParams: SearchParams) {
  const { db, workspaceId, viewer } = await getCommunity();
  const now = new Date();
  const query = parseFeedQuery(searchParams);
  const [feed, channels, postsToday, nextMeetup, profile, popular] = await Promise.all([
    loadFeed(db, workspaceId, viewer, query),
    loadChannels(db, workspaceId),
    countPostsToday(db, workspaceId, viewer.id, now),
    loadNextMeetup(db, workspaceId, viewer, now),
    loadProfile(db, workspaceId, viewer.id, now),
    loadFeed(db, workspaceId, viewer, { channelId: null, sort: "popular", q: "", limit: 3 }),
  ]);
  return {
    now,
    query,
    feed,
    channels,
    viewer,
    allowance: postingAllowance(viewer, postsToday),
    nextMeetup,
    nextBadge: profile?.next ?? null,
    popular: popular.items,
  };
}

export async function getPostPage(id: string, searchParams: SearchParams) {
  if (!isId(id)) return null;
  const { db, workspaceId, viewer } = await getCommunity();
  const query = parseFeedQuery(searchParams);
  const [post, neighbors, channels] = await Promise.all([
    loadPost(db, workspaceId, viewer, id),
    loadNeighbors(db, workspaceId, viewer, query, id),
    loadChannels(db, workspaceId),
  ]);
  if (!post) return null;
  const titles = await loadSlideTitles(
    db,
    workspaceId,
    [neighbors?.previousId, neighbors?.nextId].filter((value): value is string => Boolean(value)),
  );
  const titleOf = (slideId: string | null | undefined) => titles.find((row) => row.id === slideId) ?? null;
  return {
    now: new Date(),
    post,
    neighbors,
    query,
    channels,
    viewer,
    previous: titleOf(neighbors?.previousId),
    next: titleOf(neighbors?.nextId),
  };
}

export async function getMeetupsPage() {
  const { db, workspaceId, viewer } = await getCommunity();
  const now = new Date();
  const [meetups, next] = await Promise.all([loadMeetups(db, workspaceId, viewer), loadNextMeetup(db, workspaceId, viewer, now)]);
  return { now, viewer, next, meetups };
}

export async function getMeetupPage(id: string) {
  if (!isId(id)) return null;
  const { db, workspaceId, viewer } = await getCommunity();
  const meetup = await loadMeetup(db, workspaceId, viewer, id);
  return meetup ? { now: new Date(), viewer, meetup } : null;
}

const DIRECTORY_FILTERS: readonly DirectoryFilter[] = ["all", "premium", "free", "operator"];

export async function getMembersPage(searchParams: SearchParams) {
  const { db, workspaceId, viewer } = await getCommunity();
  const rawFilter = Array.isArray(searchParams.tier) ? searchParams.tier[0] : searchParams.tier;
  const filter = DIRECTORY_FILTERS.find((value) => value === rawFilter) ?? "all";
  const rawSearch = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const search = (rawSearch ?? "").trim().slice(0, 30);
  const now = new Date();
  return { now, viewer, filter, search, ...(await loadDirectory(db, workspaceId, filter, search, now)) };
}

export async function getMemberPage(id: string) {
  if (!isId(id)) return null;
  const { db, workspaceId, viewer } = await getCommunity();
  const now = new Date();
  const [profile, posts] = await Promise.all([
    loadProfile(db, workspaceId, id, now),
    loadMemberPosts(db, workspaceId, viewer, id),
  ]);
  return profile ? { now, viewer, profile, posts, isViewer: viewer.id === id } : null;
}

export async function getMembershipPage() {
  const { db, workspaceId, viewer } = await getCommunity();
  const now = new Date();
  const [membership, personas] = await Promise.all([
    loadMembership(db, workspaceId, viewer.id, now),
    loadPersonaOptions(db, workspaceId),
  ]);
  return { now, viewer, membership, personas };
}

/** Operator pages return `operator: false` (and no data) for other personas. */
export async function getDashboardPage() {
  const { db, workspaceId, viewer } = await getCommunity();
  if (!isOperator(viewer)) return { viewer, operator: false as const };
  const now = new Date();
  return { viewer, operator: true as const, now, data: await loadDashboard(db, workspaceId, now) };
}

export async function getChannelAdminPage() {
  const { db, workspaceId, viewer } = await getCommunity();
  if (!isOperator(viewer)) return { viewer, operator: false as const };
  return { viewer, operator: true as const, now: new Date(), channels: await loadChannels(db, workspaceId) };
}

export async function getOperatorPersona() {
  const { db, workspaceId } = await getCommunity();
  return (await loadPersonaOptions(db, workspaceId)).find((persona) => persona.role === "operator") ?? null;
}
