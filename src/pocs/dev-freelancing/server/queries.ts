import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { seoulDateKey } from "@/core/format";
import { getModuleContext } from "@/core/modules/context";
import { addDays, type DateKey } from "../domain/dates";
import { devFreelancing } from "../module";
import { clientOptions, listClients, loadClient, type ClientFilter } from "./data/clients";
import { findEstimate, findInvoice, listEstimates, listInvoices } from "./data/documents-read";
import { loadOverview, loadRevenue, workCalendar } from "./data/insights";
import { getProfile } from "./data/profile";
import { loadBoard, loadProject } from "./data/projects";
import { loadPublicProfile } from "./data/public";
import { listPlans, listPortfolio, portfolioCandidates } from "./data/showcase";
import { getTimer, listEntries, pickerProjects, type EntryFilter } from "./data/time";

/**
 * Reads for DevFlow's routes. Every function resolves the visitor's workspace first; route ids are
 * validated here and anything missing or foreign becomes a 404.
 */

const context = cache(() => getModuleContext(devFreelancing));

/** Today's Seoul date, fixed for the duration of a request. */
export const today = cache((): DateKey => seoulDateKey());

function routeId(value: string): string {
  const parsed = z.uuid().safeParse(value);
  if (!parsed.success) notFound();
  return parsed.data;
}

/** What the workspace shell needs on every page: the running timer and the pickers for it. */
export const getShell = cache(async () => {
  const { db, workspaceId } = await context();
  const day = today();
  const [timer, projects, profile, open, todayEntries] = await Promise.all([
    getTimer(db, workspaceId),
    pickerProjects(db, workspaceId),
    getProfile(db, workspaceId),
    listInvoices(db, workspaceId),
    listEntries(db, workspaceId, { from: day, to: day }),
  ]);
  return {
    timer,
    projects,
    displayName: profile.displayName,
    todayMinutes: todayEntries.reduce((sum, entry) => sum + entry.minutes, 0),
    openInvoices: open.filter((invoice) => invoice.status !== "paid").length,
    activeProjects: projects.filter((project) => project.status === "progress" || project.status === "review").length,
  };
});

export async function getOverview() {
  const { db, workspaceId } = await context();
  return loadOverview(db, workspaceId, today());
}

export async function getBoard() {
  const { db, workspaceId } = await context();
  const [projects, clients] = await Promise.all([loadBoard(db, workspaceId), clientOptions(db, workspaceId)]);
  return { projects, clients, today: today() };
}

export async function getProject(id: string) {
  const { db, workspaceId } = await context();
  const [project, clients] = await Promise.all([loadProject(db, workspaceId, routeId(id)), clientOptions(db, workspaceId)]);
  if (!project) notFound();
  return { ...project, clients, today: today() };
}

export async function getClients(filter: ClientFilter) {
  const { db, workspaceId } = await context();
  const [clients, all] = await Promise.all([listClients(db, workspaceId, filter), listClients(db, workspaceId)]);
  return { clients, total: all.length, all };
}

export async function getClient(id: string) {
  const { db, workspaceId } = await context();
  const client = await loadClient(db, workspaceId, routeId(id));
  if (!client) notFound();
  return { ...client, today: today() };
}

export async function getDocuments() {
  const { db, workspaceId } = await context();
  const [estimates, invoices] = await Promise.all([listEstimates(db, workspaceId), listInvoices(db, workspaceId)]);
  return { estimates, invoices, today: today() };
}

/** Pickers and defaults for the estimate / invoice editors. */
export async function getDocumentEditorData() {
  const { db, workspaceId } = await context();
  const [clients, board, profile] = await Promise.all([
    clientOptions(db, workspaceId),
    loadBoard(db, workspaceId),
    getProfile(db, workspaceId),
  ]);
  return {
    clients,
    projects: board.map((p) => ({ id: p.id, title: p.title, clientId: p.clientId })),
    profile,
    today: today(),
  };
}

export async function getEstimate(id: string) {
  const { db, workspaceId } = await context();
  const [estimate, profile] = await Promise.all([findEstimate(db, workspaceId, routeId(id)), getProfile(db, workspaceId)]);
  if (!estimate) notFound();
  const invoices = (await listInvoices(db, workspaceId)).filter((invoice) => invoice.estimateId === estimate.id);
  return { estimate, profile, invoices, today: today() };
}

export async function getInvoice(id: string) {
  const { db, workspaceId } = await context();
  const [invoice, profile] = await Promise.all([findInvoice(db, workspaceId, routeId(id)), getProfile(db, workspaceId)]);
  if (!invoice) notFound();
  const estimate = invoice.estimateId ? await findEstimate(db, workspaceId, invoice.estimateId) : null;
  return { invoice, profile, estimate: estimate ? { id: estimate.id, number: estimate.number } : null, today: today() };
}

export interface TimeFilter {
  projectId?: string;
  day?: DateKey;
  range: "week" | "month" | "all";
}

export async function getTimePage(filter: TimeFilter) {
  const { db, workspaceId } = await context();
  const day = today();
  const entryFilter: EntryFilter = { projectId: filter.projectId };
  if (filter.day) {
    entryFilter.from = filter.day;
    entryFilter.to = filter.day;
  } else if (filter.range === "week") {
    entryFilter.from = addDays(day, -6);
  } else if (filter.range === "month") {
    entryFilter.from = addDays(day, -29);
  }
  const [entries, projects, board, { calendar }] = await Promise.all([
    listEntries(db, workspaceId, entryFilter, 300),
    pickerProjects(db, workspaceId),
    loadBoard(db, workspaceId),
    workCalendar(db, workspaceId, day, 52),
  ]);
  return { entries, projects, board, calendar, today: day };
}

export async function getRevenue() {
  const { db, workspaceId } = await context();
  return loadRevenue(db, workspaceId, today());
}

export async function getPortfolio() {
  const { db, workspaceId } = await context();
  const [items, candidates, board] = await Promise.all([
    listPortfolio(db, workspaceId),
    portfolioCandidates(db, workspaceId),
    loadBoard(db, workspaceId),
  ]);
  return { items, candidates, projects: board.map((p) => ({ id: p.id, title: p.title })) };
}

export async function getPlans() {
  const { db, workspaceId } = await context();
  return listPlans(db, workspaceId);
}

export async function getSettings() {
  const { db, workspaceId } = await context();
  return getProfile(db, workspaceId);
}

export async function getPublicProfile() {
  const { db, workspaceId } = await context();
  return loadPublicProfile(db, workspaceId, today());
}
