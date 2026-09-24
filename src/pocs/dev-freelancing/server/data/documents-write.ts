import { and, eq, like } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import { addDays, type DateKey } from "../../domain/dates";
import {
  canMoveEstimate,
  canMoveInvoice,
  conversionLines,
  isEstimateEditable,
  isInvoiceEditable,
  nextDocumentNumber,
  type ConversionShare,
  type EstimateStatus,
  type InvoiceStatus,
} from "../../domain/documents";
import { ESTIMATE_STATUS_LABEL, INVOICE_STATUS_LABEL } from "../../domain/labels";
import { computeTotals, type LineItem, type TaxMode } from "../../domain/money";
import { clients, estimateItems, estimates, invoiceItems, invoices, milestones, projects } from "../../db/schema";
import type { Db } from "../db";
import { findEstimate } from "./documents-read";
import { assertOwnedOrNull } from "./owned";

/** Mutations for 견적서 and 인보이스. Totals are always recomputed from lines; nothing is trusted from the client. */

interface DocumentInput {
  clientId: string | null;
  projectId: string | null;
  title: string;
  taxMode: TaxMode;
  discount: number;
  issuedOn: DateKey;
  notes: string;
  items: LineItem[];
}

export interface EstimateInput extends DocumentInput {
  validUntil: DateKey;
}

export interface InvoiceInput extends DocumentInput {
  dueOn: DateKey;
}

const ESTIMATE_MISSING = "견적서를 찾을 수 없어요.";
const INVOICE_MISSING = "인보이스를 찾을 수 없어요.";

async function assertParties(db: Db, workspaceId: string, input: Pick<DocumentInput, "clientId" | "projectId">) {
  await assertOwnedOrNull(db, workspaceId, clients, input.clientId, "선택한 고객을 찾을 수 없어요.");
  await assertOwnedOrNull(db, workspaceId, projects, input.projectId, "선택한 프로젝트를 찾을 수 없어요.");
}

function checkDiscount(input: DocumentInput) {
  const { subtotal } = computeTotals(input.items, { taxMode: input.taxMode });
  if (input.discount > subtotal) throw new UserError("할인은 항목 합계보다 클 수 없어요.");
}

async function estimateNumber(db: Db, workspaceId: string, day: DateKey) {
  const stem = `EST-${day.replaceAll("-", "")}-%`;
  const rows = await db
    .select({ number: estimates.number })
    .from(estimates)
    .where(and(eq(estimates.workspaceId, workspaceId), like(estimates.number, stem)));
  return nextDocumentNumber("EST", day, rows.map((r) => r.number));
}

async function invoiceNumber(db: Db, workspaceId: string, day: DateKey) {
  const stem = `INV-${day.replaceAll("-", "")}-%`;
  const rows = await db
    .select({ number: invoices.number })
    .from(invoices)
    .where(and(eq(invoices.workspaceId, workspaceId), like(invoices.number, stem)));
  return nextDocumentNumber("INV", day, rows.map((r) => r.number));
}

const lineRows = (workspaceId: string, items: LineItem[]) =>
  items.map((item, position) => ({
    workspaceId,
    position,
    title: item.title,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));

// ---------------------------------------------------------------------------------------------
// Estimates

export async function createEstimate(db: Db, workspaceId: string, input: EstimateInput): Promise<string> {
  await assertParties(db, workspaceId, input);
  checkDiscount(input);
  return db.transaction(async (tx) => {
    const number = await estimateNumber(tx as unknown as Db, workspaceId, input.issuedOn);
    const [row] = await tx
      .insert(estimates)
      .values({
        workspaceId,
        number,
        clientId: input.clientId,
        projectId: input.projectId,
        title: input.title,
        taxMode: input.taxMode,
        discount: input.discount,
        issuedOn: input.issuedOn,
        validUntil: input.validUntil,
        notes: input.notes,
      })
      .returning({ id: estimates.id });
    await tx.insert(estimateItems).values(lineRows(workspaceId, input.items).map((line) => ({ ...line, estimateId: row.id })));
    return row.id;
  });
}

async function estimateStatus(db: Db, workspaceId: string, id: string): Promise<EstimateStatus> {
  const [row] = await db
    .select({ status: estimates.status })
    .from(estimates)
    .where(and(eq(estimates.id, id), eq(estimates.workspaceId, workspaceId)));
  if (!row) throw new UserError(ESTIMATE_MISSING);
  return row.status;
}

export async function updateEstimate(db: Db, workspaceId: string, id: string, input: EstimateInput): Promise<void> {
  const status = await estimateStatus(db, workspaceId, id);
  if (!isEstimateEditable(status)) throw new UserError("발송한 견적서는 '작성 중'으로 되돌린 뒤 고칠 수 있어요.");
  await assertParties(db, workspaceId, input);
  checkDiscount(input);
  await db.transaction(async (tx) => {
    await tx
      .update(estimates)
      .set({
        clientId: input.clientId,
        projectId: input.projectId,
        title: input.title,
        taxMode: input.taxMode,
        discount: input.discount,
        issuedOn: input.issuedOn,
        validUntil: input.validUntil,
        notes: input.notes,
      })
      .where(and(eq(estimates.id, id), eq(estimates.workspaceId, workspaceId)));
    await tx.delete(estimateItems).where(and(eq(estimateItems.estimateId, id), eq(estimateItems.workspaceId, workspaceId)));
    await tx.insert(estimateItems).values(lineRows(workspaceId, input.items).map((line) => ({ ...line, estimateId: id })));
  });
}

export async function setEstimateStatus(db: Db, workspaceId: string, id: string, to: EstimateStatus, now = new Date()): Promise<void> {
  const from = await estimateStatus(db, workspaceId, id);
  if (!canMoveEstimate(from, to)) {
    throw new UserError(`'${ESTIMATE_STATUS_LABEL[from]}' 견적서는 '${ESTIMATE_STATUS_LABEL[to]}'(으)로 바꿀 수 없어요.`);
  }
  const decided = to === "accepted" || to === "declined";
  await db
    .update(estimates)
    .set({
      status: to,
      ...(to === "sent" ? { sentAt: now } : {}),
      ...(to === "draft" ? { sentAt: null } : {}),
      decidedAt: decided ? now : null,
    })
    .where(and(eq(estimates.id, id), eq(estimates.workspaceId, workspaceId)));
}

export async function deleteEstimate(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(estimates)
    .where(and(eq(estimates.id, id), eq(estimates.workspaceId, workspaceId)))
    .returning({ id: estimates.id });
  if (deleted.length === 0) throw new UserError(ESTIMATE_MISSING);
}

/** Makes an invoice from an accepted estimate (전액, 착수금 or 잔금) and marks the estimate 청구됨. */
export async function convertEstimate(
  db: Db,
  workspaceId: string,
  id: string,
  share: ConversionShare,
  today: DateKey = seoulDateKey(),
): Promise<string> {
  const estimate = await findEstimate(db, workspaceId, id);
  if (!estimate) throw new UserError(ESTIMATE_MISSING);
  if (estimate.status !== "accepted" && estimate.status !== "invoiced") {
    throw new UserError("수락된 견적서만 인보이스로 바꿀 수 있어요.");
  }
  const plan = conversionLines(
    { title: estimate.title, items: estimate.lines, discount: estimate.discount, taxMode: estimate.taxMode },
    estimate.invoicedSupply,
    share,
  );
  if (!plan) throw new UserError("이 견적서는 이미 전액 청구했어요.");

  const suffix = share === "full" ? "" : share === "balance" ? " · 잔금" : ` · 착수금 ${share === "advance30" ? 30 : 50}%`;
  return db.transaction(async (tx) => {
    const number = await invoiceNumber(tx as unknown as Db, workspaceId, today);
    const [row] = await tx
      .insert(invoices)
      .values({
        workspaceId,
        number,
        clientId: estimate.clientId,
        projectId: estimate.projectId,
        estimateId: estimate.id,
        title: `${estimate.title}${suffix}`,
        taxMode: estimate.taxMode,
        discount: plan.discount,
        issuedOn: today,
        dueOn: addDays(today, 14),
        notes: `${estimate.number} 기준`,
      })
      .returning({ id: invoices.id });
    await tx.insert(invoiceItems).values(lineRows(workspaceId, plan.items).map((line) => ({ ...line, invoiceId: row.id })));
    await tx
      .update(estimates)
      .set({ status: "invoiced" })
      .where(and(eq(estimates.id, estimate.id), eq(estimates.workspaceId, workspaceId)));
    return row.id;
  });
}

/** Opens a project from an estimate: budget = supply amount, one milestone per line. */
export async function createProjectFromEstimate(db: Db, workspaceId: string, id: string): Promise<string> {
  const estimate = await findEstimate(db, workspaceId, id);
  if (!estimate) throw new UserError(ESTIMATE_MISSING);
  if (estimate.projectId) throw new UserError("이미 프로젝트와 연결된 견적서예요.");

  const status = estimate.status === "accepted" || estimate.status === "invoiced" ? "progress" : "inquiry";
  return db.transaction(async (tx) => {
    const column = await tx
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.workspaceId, workspaceId), eq(projects.status, status)));
    const [project] = await tx
      .insert(projects)
      .values({
        workspaceId,
        clientId: estimate.clientId,
        title: estimate.title,
        description: estimate.notes,
        status,
        budget: estimate.totals.supply,
        position: column.length,
      })
      .returning({ id: projects.id });
    if (estimate.lines.length > 0) {
      await tx.insert(milestones).values(
        estimate.lines.map((line, position) => ({
          workspaceId,
          projectId: project.id,
          title: line.title,
          estimatedHours: line.unit === "hour" ? line.quantity : null,
          position,
        })),
      );
    }
    await tx
      .update(estimates)
      .set({ projectId: project.id })
      .where(and(eq(estimates.id, estimate.id), eq(estimates.workspaceId, workspaceId)));
    return project.id;
  });
}

// ---------------------------------------------------------------------------------------------
// Invoices

export async function createInvoice(db: Db, workspaceId: string, input: InvoiceInput): Promise<string> {
  await assertParties(db, workspaceId, input);
  checkDiscount(input);
  return db.transaction(async (tx) => {
    const number = await invoiceNumber(tx as unknown as Db, workspaceId, input.issuedOn);
    const [row] = await tx
      .insert(invoices)
      .values({
        workspaceId,
        number,
        clientId: input.clientId,
        projectId: input.projectId,
        title: input.title,
        taxMode: input.taxMode,
        discount: input.discount,
        issuedOn: input.issuedOn,
        dueOn: input.dueOn,
        notes: input.notes,
      })
      .returning({ id: invoices.id });
    await tx.insert(invoiceItems).values(lineRows(workspaceId, input.items).map((line) => ({ ...line, invoiceId: row.id })));
    return row.id;
  });
}

async function invoiceStatus(db: Db, workspaceId: string, id: string): Promise<InvoiceStatus> {
  const [row] = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
  if (!row) throw new UserError(INVOICE_MISSING);
  return row.status;
}

export async function updateInvoice(db: Db, workspaceId: string, id: string, input: InvoiceInput): Promise<void> {
  const status = await invoiceStatus(db, workspaceId, id);
  if (!isInvoiceEditable(status)) throw new UserError("발송한 인보이스는 '발행'으로 되돌린 뒤 고칠 수 있어요.");
  await assertParties(db, workspaceId, input);
  checkDiscount(input);
  await db.transaction(async (tx) => {
    await tx
      .update(invoices)
      .set({
        clientId: input.clientId,
        projectId: input.projectId,
        title: input.title,
        taxMode: input.taxMode,
        discount: input.discount,
        issuedOn: input.issuedOn,
        dueOn: input.dueOn,
        notes: input.notes,
      })
      .where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
    await tx.delete(invoiceItems).where(and(eq(invoiceItems.invoiceId, id), eq(invoiceItems.workspaceId, workspaceId)));
    await tx.insert(invoiceItems).values(lineRows(workspaceId, input.items).map((line) => ({ ...line, invoiceId: id })));
  });
}

export async function setInvoiceStatus(
  db: Db,
  workspaceId: string,
  id: string,
  to: InvoiceStatus,
  options: { paidOn?: DateKey; now?: Date } = {},
): Promise<void> {
  const from = await invoiceStatus(db, workspaceId, id);
  if (!canMoveInvoice(from, to)) {
    throw new UserError(`'${INVOICE_STATUS_LABEL[from]}' 인보이스는 '${INVOICE_STATUS_LABEL[to]}'(으)로 바꿀 수 없어요.`);
  }
  const now = options.now ?? new Date();
  const paidOn = options.paidOn ?? seoulDateKey(now);
  await db
    .update(invoices)
    .set({
      status: to,
      paidOn: to === "paid" ? paidOn : null,
      ...(to === "awaiting" && from === "issued" ? { sentAt: now } : {}),
      ...(to === "issued" ? { sentAt: null } : {}),
    })
    .where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
}

export async function deleteInvoice(db: Db, workspaceId: string, id: string): Promise<void> {
  const [row] = await db
    .select({ estimateId: invoices.estimateId })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
  if (!row) throw new UserError(INVOICE_MISSING);
  await db.transaction(async (tx) => {
    await tx.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.workspaceId, workspaceId)));
    if (!row.estimateId) return;
    // An estimate with no invoices left goes back to 수락됨 so it can be billed again.
    const remaining = await tx
      .select({ id: invoices.id })
      .from(invoices)
      .where(and(eq(invoices.workspaceId, workspaceId), eq(invoices.estimateId, row.estimateId)))
      .limit(1);
    if (remaining.length === 0) {
      await tx
        .update(estimates)
        .set({ status: "accepted" })
        .where(and(eq(estimates.id, row.estimateId), eq(estimates.workspaceId, workspaceId), eq(estimates.status, "invoiced")));
    }
  });
}

