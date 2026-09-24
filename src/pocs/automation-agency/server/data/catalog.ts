import "server-only";
import { and, asc, count, countDistinct, eq, ilike, isNotNull, or } from "drizzle-orm";
import { packages, projectPackages, quoteItems, type Industry, type PackageKind } from "../../db/schema";
import type { Db } from "../../db/types";
import type { PackageInput } from "../../domain/inputs";

export type PackageRow = typeof packages.$inferSelect;

export interface PackageWithUsage extends PackageRow {
  /** Projects that include the package. */
  projectCount: number;
  /** Quotes that list the package. */
  quoteCount: number;
}

export type CatalogSort = "popular" | "savings" | "price";

export interface CatalogFilter {
  industry?: Industry;
  kind?: PackageKind;
  q?: string;
  sort?: CatalogSort;
  includeArchived?: boolean;
}

/** Usage counts per package id, from real project and quote rows. */
export async function packageUsage(
  db: Db,
  workspaceId: string,
): Promise<Map<string, { projects: number; quotes: number }>> {
  const [byProject, byQuote] = await Promise.all([
    db
      .select({ packageId: projectPackages.packageId, n: count() })
      .from(projectPackages)
      .where(eq(projectPackages.workspaceId, workspaceId))
      .groupBy(projectPackages.packageId),
    db
      .select({ packageId: quoteItems.packageId, n: countDistinct(quoteItems.quoteId) })
      .from(quoteItems)
      .where(and(eq(quoteItems.workspaceId, workspaceId), isNotNull(quoteItems.packageId)))
      .groupBy(quoteItems.packageId),
  ]);
  const usage = new Map<string, { projects: number; quotes: number }>();
  for (const row of byProject) usage.set(row.packageId, { projects: row.n, quotes: 0 });
  for (const row of byQuote) {
    if (!row.packageId) continue;
    usage.set(row.packageId, { projects: usage.get(row.packageId)?.projects ?? 0, quotes: row.n });
  }
  return usage;
}

export async function listPackages(
  db: Db,
  workspaceId: string,
  filter: CatalogFilter = {},
): Promise<PackageWithUsage[]> {
  const conditions = [eq(packages.workspaceId, workspaceId)];
  if (!filter.includeArchived) conditions.push(eq(packages.archived, false));
  if (filter.industry) conditions.push(eq(packages.industry, filter.industry));
  if (filter.kind) conditions.push(eq(packages.kind, filter.kind));
  const q = filter.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    const match = or(ilike(packages.name, pattern), ilike(packages.summary, pattern));
    if (match) conditions.push(match);
  }

  const [rows, usage] = await Promise.all([
    db
      .select()
      .from(packages)
      .where(and(...conditions))
      .orderBy(asc(packages.createdAt), asc(packages.name)),
    packageUsage(db, workspaceId),
  ]);
  const withUsage = rows.map((row) => ({
    ...row,
    projectCount: usage.get(row.id)?.projects ?? 0,
    quoteCount: usage.get(row.id)?.quotes ?? 0,
  }));

  const sort = filter.sort ?? "popular";
  return withUsage.sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1;
    if (sort === "savings") return b.monthlyHoursSaved - a.monthlyHoursSaved;
    if (sort === "price") return a.setupFee - b.setupFee;
    return (
      b.projectCount * 2 + b.quoteCount - (a.projectCount * 2 + a.quoteCount) ||
      b.monthlyHoursSaved - a.monthlyHoursSaved
    );
  });
}

export async function getPackage(db: Db, workspaceId: string, id: string): Promise<PackageWithUsage | undefined> {
  const [row] = await db
    .select()
    .from(packages)
    .where(and(eq(packages.workspaceId, workspaceId), eq(packages.id, id)))
    .limit(1);
  if (!row) return undefined;
  const usage = (await packageUsage(db, workspaceId)).get(id);
  return { ...row, projectCount: usage?.projects ?? 0, quoteCount: usage?.quotes ?? 0 };
}

export interface PackageOption {
  id: string;
  name: string;
  setupFee: number;
  monthlyFee: number;
  monthlyHoursSaved: number;
  tools: string[];
  archived: boolean;
}

/** Compact list for pickers (quote lines, project packages, ROI presets). */
export async function packageOptions(db: Db, workspaceId: string): Promise<PackageOption[]> {
  return db
    .select({
      id: packages.id,
      name: packages.name,
      setupFee: packages.setupFee,
      monthlyFee: packages.monthlyFee,
      monthlyHoursSaved: packages.monthlyHoursSaved,
      tools: packages.tools,
      archived: packages.archived,
    })
    .from(packages)
    .where(eq(packages.workspaceId, workspaceId))
    .orderBy(asc(packages.archived), asc(packages.createdAt), asc(packages.name));
}

export async function createPackage(db: Db, workspaceId: string, input: PackageInput): Promise<string> {
  const [row] = await db
    .insert(packages)
    .values({ ...input, workspaceId })
    .returning({ id: packages.id });
  return row.id;
}

export async function updatePackage(db: Db, workspaceId: string, id: string, input: PackageInput): Promise<boolean> {
  const rows = await db
    .update(packages)
    .set(input)
    .where(and(eq(packages.workspaceId, workspaceId), eq(packages.id, id)))
    .returning({ id: packages.id });
  return rows.length > 0;
}

export async function setPackageArchived(db: Db, workspaceId: string, id: string, archived: boolean): Promise<boolean> {
  const rows = await db
    .update(packages)
    .set({ archived })
    .where(and(eq(packages.workspaceId, workspaceId), eq(packages.id, id)))
    .returning({ id: packages.id });
  return rows.length > 0;
}
