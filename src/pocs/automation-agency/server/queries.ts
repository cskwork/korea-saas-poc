import "server-only";
import { seoulDateKey } from "@/core/format";
import { getModuleContext } from "@/core/modules/context";
import { automationAgency } from "../module";
import { getPackage, listPackages, packageOptions, type CatalogFilter } from "./data/catalog";
import { getDashboard } from "./data/dashboard";
import { getDiagnosis, listDiagnoses } from "./data/diagnoses";
import { getProject, listProjects, projectOptions, stageCounts, type ProjectFilter } from "./data/projects";
import { getProfile, getQuote, listQuotes, quoteStatusCounts, type QuoteFilter } from "./data/quotes";
import { getWorkflow, listWorkflows } from "./data/workflows";

/**
 * Reads for the routes. Each resolves the visitor's workspace (seeding demo data on
 * the first visit) and delegates to a `(db, workspaceId, …)` data function.
 */
const context = () => getModuleContext(automationAgency);

export async function fetchDashboard() {
  const { db, workspaceId } = await context();
  return getDashboard(db, workspaceId, seoulDateKey());
}

export async function fetchPackages(filter: CatalogFilter) {
  const { db, workspaceId } = await context();
  return listPackages(db, workspaceId, filter);
}

export async function fetchPackage(id: string) {
  const { db, workspaceId } = await context();
  return getPackage(db, workspaceId, id);
}

export async function fetchPackageOptions() {
  const { db, workspaceId } = await context();
  return packageOptions(db, workspaceId);
}

export async function fetchProjects(filter: ProjectFilter) {
  const { db, workspaceId } = await context();
  const [projects, counts] = await Promise.all([listProjects(db, workspaceId, filter), stageCounts(db, workspaceId)]);
  return { projects, counts };
}

export async function fetchProject(id: string) {
  const { db, workspaceId } = await context();
  return getProject(db, workspaceId, id);
}

export async function fetchProjectOptions() {
  const { db, workspaceId } = await context();
  return projectOptions(db, workspaceId);
}

export async function fetchQuotes(filter: QuoteFilter) {
  const { db, workspaceId } = await context();
  const [quotes, counts] = await Promise.all([listQuotes(db, workspaceId, filter), quoteStatusCounts(db, workspaceId)]);
  return { quotes, counts };
}

export async function fetchQuote(id: string) {
  const { db, workspaceId } = await context();
  return getQuote(db, workspaceId, id);
}

export async function fetchProfile() {
  const { db, workspaceId } = await context();
  return getProfile(db, workspaceId);
}

export async function fetchDiagnoses() {
  const { db, workspaceId } = await context();
  return listDiagnoses(db, workspaceId);
}

export async function fetchDiagnosis(id: string) {
  const { db, workspaceId } = await context();
  return getDiagnosis(db, workspaceId, id);
}

export async function fetchWorkflows() {
  const { db, workspaceId } = await context();
  return listWorkflows(db, workspaceId);
}

export async function fetchWorkflow(id: string) {
  const { db, workspaceId } = await context();
  return getWorkflow(db, workspaceId, id);
}
