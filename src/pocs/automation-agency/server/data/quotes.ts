import "server-only";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { UserError } from "@/core/actions";
import {
  agencyProfiles,
  packages,
  projectPackages,
  projects,
  quoteItems,
  quotes,
  type QuoteStatus,
} from "../../db/schema";
import type { Db } from "../../db/types";
import { addDays } from "../../domain/dates";
import { daysBetween } from "../../domain/dashboard";
import type { ProfileInput, QuoteInput } from "../../domain/inputs";
import { nextQuoteNumber, quoteTotals, type QuoteTotals } from "../../domain/quote";

export type QuoteRow = typeof quotes.$inferSelect;
export type QuoteItemRow = typeof quoteItems.$inferSelect;

export interface QuoteWithTotals extends QuoteRow {
  items: QuoteItemRow[];
  totals: QuoteTotals;
}

export interface QuoteFilter {
  status?: QuoteStatus;
  q?: string;
}

async function itemsByQuote(db: Db, workspaceId: string, quoteIds: string[]) {
  const map = new Map<string, QuoteItemRow[]>();
  if (quoteIds.length === 0) return map;
  const rows = await db
    .select()
    .from(quoteItems)
    .where(and(eq(quoteItems.workspaceId, workspaceId), inArray(quoteItems.quoteId, quoteIds)))
    .orderBy(asc(quoteItems.position));
  for (const row of rows) map.set(row.quoteId, [...(map.get(row.quoteId) ?? []), row]);
  return map;
}

function withTotals(row: QuoteRow, items: QuoteItemRow[]): QuoteWithTotals {
  return { ...row, items, totals: quoteTotals(items) };
}

export async function listQuotes(db: Db, workspaceId: string, filter: QuoteFilter = {}): Promise<QuoteWithTotals[]> {
  const conditions = [eq(quotes.workspaceId, workspaceId)];
  if (filter.status) conditions.push(eq(quotes.status, filter.status));
  const q = filter.q?.trim();
  if (q) conditions.push(ilike(quotes.clientName, `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`));
  const rows = await db
    .select()
    .from(quotes)
    .where(and(...conditions))
    .orderBy(desc(quotes.issuedOn), desc(quotes.number));
  const items = await itemsByQuote(
    db,
    workspaceId,
    rows.map((row) => row.id),
  );
  return rows.map((row) => withTotals(row, items.get(row.id) ?? []));
}

/** Quote count per status (for the status filter). */
export async function quoteStatusCounts(db: Db, workspaceId: string): Promise<Record<QuoteStatus, number>> {
  const rows = await db.select({ status: quotes.status }).from(quotes).where(eq(quotes.workspaceId, workspaceId));
  const counts: Record<QuoteStatus, number> = { draft: 0, sent: 0, accepted: 0, declined: 0 };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export interface QuoteDetail extends QuoteWithTotals {
  projectId: string | null;
  validDays: number;
}

export async function getQuote(db: Db, workspaceId: string, id: string): Promise<QuoteDetail | undefined> {
  const [row] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.workspaceId, workspaceId), eq(quotes.id, id)))
    .limit(1);
  if (!row) return undefined;
  const [items, project] = await Promise.all([
    itemsByQuote(db, workspaceId, [id]),
    db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.quoteId, id)))
      .limit(1),
  ]);
  return {
    ...withTotals(row, items.get(id) ?? []),
    projectId: project[0]?.id ?? null,
    validDays: daysBetween(row.issuedOn, row.validUntil),
  };
}

/** Keeps package references only when they point at the workspace's own packages. */
async function ownPackageIds(db: Db, workspaceId: string, ids: (string | null)[]): Promise<Set<string>> {
  const wanted = [...new Set(ids.filter((id): id is string => id !== null))];
  if (wanted.length === 0) return new Set();
  const rows = await db
    .select({ id: packages.id })
    .from(packages)
    .where(and(eq(packages.workspaceId, workspaceId), inArray(packages.id, wanted)));
  return new Set(rows.map((row) => row.id));
}

async function writeItems(db: Db, workspaceId: string, quoteId: string, input: QuoteInput) {
  const own = await ownPackageIds(
    db,
    workspaceId,
    input.lines.map((line) => line.packageId),
  );
  await db.insert(quoteItems).values(
    input.lines.map((line, position) => ({
      workspaceId,
      quoteId,
      packageId: line.packageId && own.has(line.packageId) ? line.packageId : null,
      name: line.name,
      complexity: line.complexity,
      quantity: line.quantity,
      unitSetupFee: line.unitSetupFee,
      unitMonthlyFee: line.unitMonthlyFee,
      position,
    })),
  );
}

export async function createQuote(db: Db, workspaceId: string, input: QuoteInput): Promise<string> {
  return db.transaction(async (tx) => {
    const existing = await tx.select({ number: quotes.number }).from(quotes).where(eq(quotes.workspaceId, workspaceId));
    const number = nextQuoteNumber(
      existing.map((row) => row.number),
      Number(input.issuedOn.slice(0, 4)),
    );
    const [row] = await tx
      .insert(quotes)
      .values({
        workspaceId,
        number,
        clientName: input.clientName,
        contactName: input.contactName,
        issuedOn: input.issuedOn,
        validUntil: addDays(input.issuedOn, input.validDays),
        notes: input.notes,
      })
      .returning({ id: quotes.id });
    await writeItems(tx, workspaceId, row.id, input);
    return row.id;
  });
}

export async function updateQuote(db: Db, workspaceId: string, id: string, input: QuoteInput): Promise<boolean> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .update(quotes)
      .set({
        clientName: input.clientName,
        contactName: input.contactName,
        issuedOn: input.issuedOn,
        validUntil: addDays(input.issuedOn, input.validDays),
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(quotes.workspaceId, workspaceId), eq(quotes.id, id)))
      .returning({ id: quotes.id });
    if (rows.length === 0) return false;
    await tx.delete(quoteItems).where(and(eq(quoteItems.workspaceId, workspaceId), eq(quoteItems.quoteId, id)));
    await writeItems(tx, workspaceId, id, input);
    return true;
  });
}

export async function setQuoteStatus(db: Db, workspaceId: string, id: string, status: QuoteStatus): Promise<boolean> {
  const rows = await db
    .update(quotes)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(quotes.workspaceId, workspaceId), eq(quotes.id, id)))
    .returning({ id: quotes.id });
  return rows.length > 0;
}

export async function deleteQuote(db: Db, workspaceId: string, id: string): Promise<boolean> {
  const rows = await db
    .delete(quotes)
    .where(and(eq(quotes.workspaceId, workspaceId), eq(quotes.id, id)))
    .returning({ id: quotes.id });
  return rows.length > 0;
}

/**
 * Turns an accepted quote into a project at the first station (대기), carrying its
 * packages and fees. Idempotent: returns the existing project when already converted.
 */
export async function convertQuoteToProject(db: Db, workspaceId: string, id: string): Promise<string | undefined> {
  const quote = await getQuote(db, workspaceId, id);
  if (!quote) return undefined;
  if (quote.projectId) return quote.projectId;
  if (quote.status !== "accepted") throw new UserError("수락된 견적만 프로젝트로 전환할 수 있어요.");
  const packageIds = [...new Set(quote.items.flatMap((item) => (item.packageId ? [item.packageId] : [])))];
  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({
        workspaceId,
        clientName: quote.clientName,
        notes: `${quote.number} 견적에서 전환${quote.notes ? `\n${quote.notes}` : ""}`,
        setupFee: quote.totals.setup.supply,
        monthlyFee: quote.totals.monthly.supply,
        quoteId: quote.id,
      })
      .returning({ id: projects.id });
    if (packageIds.length > 0) {
      await tx
        .insert(projectPackages)
        .values(packageIds.map((packageId) => ({ workspaceId, projectId: project.id, packageId })));
    }
    return project.id;
  });
}

// --- Supplier profile (공급자) ----------------------------------------------

export type AgencyProfile = typeof agencyProfiles.$inferSelect;

export async function getProfile(db: Db, workspaceId: string): Promise<AgencyProfile | undefined> {
  const [row] = await db.select().from(agencyProfiles).where(eq(agencyProfiles.workspaceId, workspaceId)).limit(1);
  return row;
}

export async function saveProfile(db: Db, workspaceId: string, input: ProfileInput): Promise<void> {
  await db
    .insert(agencyProfiles)
    .values({ ...input, workspaceId })
    .onConflictDoUpdate({ target: agencyProfiles.workspaceId, set: { ...input, updatedAt: new Date() } });
}
