import { circulation } from "../../domain/revenue";
import type { BoardActor } from "../../domain/board";
import { listPosts } from "./board";
import { listIssues, recipientCounts } from "./issues";
import { revenueOverview, subscriberFacts } from "./revenue";
import { subscriberCounts } from "./subscribers";
import type { Db } from "./db";

const CIRCULATION_WEEKS = 26;
const RECENT_ISSUES = 6;

/** The editor's desk: the next issue, the lineup, the colophon figures and the board digest. */
export async function deskOverview(db: Db, workspaceId: string, editor: BoardActor, now: Date, today: string) {
  const [lineup, recipients, revenue, facts, counts, board] = await Promise.all([
    listIssues(db, workspaceId, {}, now),
    recipientCounts(db, workspaceId),
    revenueOverview(db, workspaceId, today),
    subscriberFacts(db, workspaceId),
    subscriberCounts(db, workspaceId),
    listPosts(db, workspaceId, { viewer: editor, limit: 4 }),
  ]);
  const upcoming = lineup.filter((issue) => issue.status !== "published");
  const published = lineup.filter((issue) => issue.status === "published");
  const lastNumber = published[0]?.number ?? 0;
  const nextIssue = upcoming[0] ?? null;
  return {
    nextIssue,
    nextNumber: lastNumber + 1,
    upcoming,
    recent: published.slice(0, RECENT_ISSUES),
    publishedCount: published.length,
    recipients,
    revenue,
    counts,
    circulation: circulation(facts, today, CIRCULATION_WEEKS),
    board,
  };
}

export type DeskOverview = Awaited<ReturnType<typeof deskOverview>>;
