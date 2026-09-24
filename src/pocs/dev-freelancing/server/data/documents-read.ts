import { and, desc, eq } from "drizzle-orm";
import type { DateKey } from "../../domain/dates";
import type { EstimateStatus, InvoiceStatus } from "../../domain/documents";
import { computeTotals, type DocumentTotals, type LineUnit, type TaxMode } from "../../domain/money";
import type { RevenueInvoice } from "../../domain/revenue";
import { estimates, invoices } from "../../db/schema";
import type { Db } from "../db";

/** Read models for 견적서 and 인보이스, with totals computed by the domain (never stored). */

export interface DocumentLine {
  id: string;
  title: string;
  unit: LineUnit;
  quantity: number;
  unitPrice: number;
}

interface Party {
  clientId: string | null;
  clientName: string | null;
  clientCompany: string | null;
  projectId: string | null;
  projectTitle: string | null;
}

export interface InvoiceSummary extends Party {
  id: string;
  number: string;
  title: string;
  status: InvoiceStatus;
  taxMode: TaxMode;
  discount: number;
  issuedOn: DateKey;
  dueOn: DateKey;
  paidOn: DateKey | null;
  sentAt: Date | null;
  notes: string;
  estimateId: string | null;
  lines: DocumentLine[];
  totals: DocumentTotals;
}

export interface EstimateSummary extends Party {
  id: string;
  number: string;
  title: string;
  status: EstimateStatus;
  taxMode: TaxMode;
  discount: number;
  issuedOn: DateKey;
  validUntil: DateKey;
  sentAt: Date | null;
  decidedAt: Date | null;
  notes: string;
  lines: DocumentLine[];
  totals: DocumentTotals;
  /** Supply amount already billed from this estimate. */
  invoicedSupply: number;
}

type LineRow = { id: string; title: string; unit: LineUnit; quantity: number; unitPrice: number };
const toLines = (rows: LineRow[]): DocumentLine[] =>
  rows.map(({ id, title, unit, quantity, unitPrice }) => ({ id, title, unit, quantity: Number(quantity), unitPrice }));

const party = (row: {
  clientId: string | null;
  projectId: string | null;
  client: { name: string; company: string } | null;
  project: { title: string } | null;
}): Party => ({
  clientId: row.clientId,
  clientName: row.client?.name ?? null,
  clientCompany: row.client?.company ?? null,
  projectId: row.projectId,
  projectTitle: row.project?.title ?? null,
});

function toInvoiceSummary(row: Awaited<ReturnType<typeof queryInvoices>>[number]): InvoiceSummary {
  const lines = toLines(row.items);
  return {
    ...party(row),
    id: row.id,
    number: row.number,
    title: row.title,
    status: row.status,
    taxMode: row.taxMode,
    discount: row.discount,
    issuedOn: row.issuedOn,
    dueOn: row.dueOn,
    paidOn: row.paidOn,
    sentAt: row.sentAt,
    notes: row.notes,
    estimateId: row.estimateId,
    lines,
    totals: computeTotals(lines, { discount: row.discount, taxMode: row.taxMode }),
  };
}

function queryInvoices(db: Db, workspaceId: string, id?: string) {
  return db.query.invoices.findMany({
    where: id ? and(eq(invoices.workspaceId, workspaceId), eq(invoices.id, id)) : eq(invoices.workspaceId, workspaceId),
    orderBy: [desc(invoices.issuedOn), desc(invoices.number)],
    with: {
      items: { orderBy: (t, o) => [o.asc(t.position)] },
      client: { columns: { name: true, company: true } },
      project: { columns: { title: true } },
    },
  });
}

function queryEstimates(db: Db, workspaceId: string, id?: string) {
  return db.query.estimates.findMany({
    where: id ? and(eq(estimates.workspaceId, workspaceId), eq(estimates.id, id)) : eq(estimates.workspaceId, workspaceId),
    orderBy: [desc(estimates.issuedOn), desc(estimates.number)],
    with: {
      items: { orderBy: (t, o) => [o.asc(t.position)] },
      client: { columns: { name: true, company: true } },
      project: { columns: { title: true } },
    },
  });
}

export async function listInvoices(db: Db, workspaceId: string): Promise<InvoiceSummary[]> {
  return (await queryInvoices(db, workspaceId)).map(toInvoiceSummary);
}

export async function findInvoice(db: Db, workspaceId: string, id: string): Promise<InvoiceSummary | null> {
  const [row] = await queryInvoices(db, workspaceId, id);
  return row ? toInvoiceSummary(row) : null;
}

export async function listEstimates(db: Db, workspaceId: string): Promise<EstimateSummary[]> {
  const [rows, billed] = await Promise.all([queryEstimates(db, workspaceId), invoicedSupplyByEstimate(db, workspaceId)]);
  return rows.map((row) => toEstimateSummary(row, billed.get(row.id) ?? 0));
}

export async function findEstimate(db: Db, workspaceId: string, id: string): Promise<EstimateSummary | null> {
  const [[row], billed] = await Promise.all([queryEstimates(db, workspaceId, id), invoicedSupplyByEstimate(db, workspaceId)]);
  return row ? toEstimateSummary(row, billed.get(row.id) ?? 0) : null;
}

function toEstimateSummary(row: Awaited<ReturnType<typeof queryEstimates>>[number], invoicedSupply: number): EstimateSummary {
  const lines = toLines(row.items);
  return {
    ...party(row),
    id: row.id,
    number: row.number,
    title: row.title,
    status: row.status,
    taxMode: row.taxMode,
    discount: row.discount,
    issuedOn: row.issuedOn,
    validUntil: row.validUntil,
    sentAt: row.sentAt,
    decidedAt: row.decidedAt,
    notes: row.notes,
    lines,
    totals: computeTotals(lines, { discount: row.discount, taxMode: row.taxMode }),
    invoicedSupply,
  };
}

/** Supply amount of every invoice made from each estimate. */
export async function invoicedSupplyByEstimate(db: Db, workspaceId: string): Promise<Map<string, number>> {
  const rows = await db.query.invoices.findMany({
    where: eq(invoices.workspaceId, workspaceId),
    columns: { estimateId: true, discount: true, taxMode: true },
    with: { items: { columns: { unit: true, quantity: true, unitPrice: true } } },
  });
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (!row.estimateId) continue;
    const lines = row.items.map((item) => ({ ...item, quantity: Number(item.quantity) }));
    const { supply } = computeTotals(lines, { discount: row.discount, taxMode: row.taxMode });
    totals.set(row.estimateId, (totals.get(row.estimateId) ?? 0) + supply);
  }
  return totals;
}

export function toRevenueInvoice(invoice: InvoiceSummary): RevenueInvoice {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    clientName: invoice.clientCompany || invoice.clientName || "고객 미지정",
    status: invoice.status,
    taxMode: invoice.taxMode,
    issuedOn: invoice.issuedOn,
    dueOn: invoice.dueOn,
    paidOn: invoice.paidOn,
    supply: invoice.totals.supply,
    vat: invoice.totals.vat,
    withholding: invoice.totals.withholding,
    payout: invoice.totals.payout,
  };
}

