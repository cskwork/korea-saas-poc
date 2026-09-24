import { and, desc, eq } from "drizzle-orm";
import { UserError } from "@/core/actions";
import { seoulDateKey } from "@/core/format";
import type { DateKey } from "../../domain/dates";
import { ESTIMATE_STATUS_LABEL, NOTE_KIND_LABEL, type ClientGrade, type NoteKind } from "../../domain/labels";
import { clientNotes, clients, projects } from "../../db/schema";
import type { Db } from "../db";
import { listEstimates, listInvoices, type EstimateSummary, type InvoiceSummary } from "./documents-read";
import { loadBoard, type BoardProject } from "./projects";
import { assertOwned } from "./owned";

const CLIENT_MISSING = "고객을 찾을 수 없어요.";

export interface ClientRow {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  grade: ClientGrade;
  notes: string;
  createdAt: Date;
  projectCount: number;
  activeProjects: number;
  /** Supply amount paid, all time. */
  paid: number;
  /** Payout still owed on unpaid invoices. */
  outstanding: number;
  lastActivity: DateKey;
}

export type ClientSort = "recent" | "revenue" | "name";

export interface ClientFilter {
  q?: string;
  grade?: ClientGrade;
  sort?: ClientSort;
}

export async function listClients(db: Db, workspaceId: string, filter: ClientFilter = {}): Promise<ClientRow[]> {
  const [clientRows, projectRows, invoiceRows, noteRows] = await Promise.all([
    db.select().from(clients).where(eq(clients.workspaceId, workspaceId)),
    db
      .select({ clientId: projects.clientId, status: projects.status, createdAt: projects.createdAt })
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId)),
    listInvoices(db, workspaceId),
    db
      .select({ clientId: clientNotes.clientId, occurredOn: clientNotes.occurredOn })
      .from(clientNotes)
      .where(eq(clientNotes.workspaceId, workspaceId)),
  ]);

  const q = filter.q?.trim().toLowerCase();
  const rows = clientRows
    .filter((client) => !filter.grade || client.grade === filter.grade)
    .filter(
      (client) =>
        !q || [client.name, client.company, client.email, client.phone].some((field) => field.toLowerCase().includes(q)),
    )
    .map((client): ClientRow => {
      const own = projectRows.filter((p) => p.clientId === client.id);
      const bills = invoiceRows.filter((invoice) => invoice.clientId === client.id);
      const days = [
        seoulDateKey(client.createdAt),
        ...own.map((p) => seoulDateKey(p.createdAt)),
        ...bills.map((invoice) => invoice.paidOn ?? invoice.issuedOn),
        ...noteRows.filter((n) => n.clientId === client.id).map((n) => n.occurredOn),
      ];
      return {
        ...client,
        projectCount: own.length,
        activeProjects: own.filter((p) => p.status === "progress" || p.status === "review").length,
        paid: bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.totals.supply, 0),
        outstanding: bills.filter((b) => b.status !== "paid").reduce((s, b) => s + b.totals.payout, 0),
        lastActivity: days.sort().at(-1)!,
      };
    });

  const sort = filter.sort ?? "recent";
  return rows.sort((a, b) => {
    if (sort === "revenue") return b.paid - a.paid || a.name.localeCompare(b.name, "ko");
    if (sort === "name") return a.name.localeCompare(b.name, "ko");
    return b.lastActivity.localeCompare(a.lastActivity) || a.name.localeCompare(b.name, "ko");
  });
}

export interface HistoryEvent {
  key: string;
  day: DateKey;
  label: string;
  title: string;
  href: string | null;
  /** hollow: something opened, partial: in motion, solid: closed or paid. */
  state: "hollow" | "partial" | "solid";
}

export interface ClientNote {
  id: string;
  kind: NoteKind;
  body: string;
  occurredOn: DateKey;
}

export interface ClientDetail {
  client: ClientRow;
  notes: ClientNote[];
  projects: BoardProject[];
  estimates: EstimateSummary[];
  invoices: InvoiceSummary[];
  history: HistoryEvent[];
}

export async function loadClient(db: Db, workspaceId: string, id: string): Promise<ClientDetail | null> {
  const [row] = (await listClients(db, workspaceId)).filter((client) => client.id === id);
  if (!row) return null;

  const [notes, board, allEstimates, allInvoices] = await Promise.all([
    db
      .select({ id: clientNotes.id, kind: clientNotes.kind, body: clientNotes.body, occurredOn: clientNotes.occurredOn })
      .from(clientNotes)
      .where(and(eq(clientNotes.clientId, id), eq(clientNotes.workspaceId, workspaceId)))
      .orderBy(desc(clientNotes.occurredOn), desc(clientNotes.createdAt)),
    loadBoard(db, workspaceId),
    listEstimates(db, workspaceId),
    listInvoices(db, workspaceId),
  ]);
  const ownProjects = board.filter((p) => p.clientId === id);
  const ownEstimates = allEstimates.filter((e) => e.clientId === id);
  const ownInvoices = allInvoices.filter((i) => i.clientId === id);

  const history: HistoryEvent[] = [];
  const push = (event: HistoryEvent) => history.push(event);
  for (const note of notes) {
    push({ key: `note-${note.id}`, day: note.occurredOn, label: NOTE_KIND_LABEL[note.kind], title: note.body, href: null, state: "hollow" });
  }
  for (const p of ownProjects) {
    const href = `/dev-freelancing/projects/${p.id}`;
    if (p.completedAt) {
      push({ key: `done-${p.id}`, day: seoulDateKey(p.completedAt), label: "프로젝트 완료", title: p.title, href, state: "solid" });
    }
    const label = p.status === "inquiry" ? "프로젝트 문의" : "프로젝트 시작";
    push({ key: `start-${p.id}`, day: p.startOn ?? seoulDateKey(p.createdAt), label, title: p.title, href, state: "partial" });
  }
  for (const e of ownEstimates) {
    const href = `/dev-freelancing/estimates/${e.id}`;
    push({ key: `est-${e.id}`, day: e.issuedOn, label: "견적서 작성", title: `${e.number} · ${e.title}`, href, state: "hollow" });
    if (e.decidedAt && (e.status === "accepted" || e.status === "declined" || e.status === "invoiced")) {
      const label = e.status === "declined" ? ESTIMATE_STATUS_LABEL.declined : ESTIMATE_STATUS_LABEL.accepted;
      const state = e.status === "declined" ? "hollow" : "partial";
      push({ key: `dec-${e.id}`, day: seoulDateKey(e.decidedAt), label: `견적 ${label}`, title: `${e.number} · ${e.title}`, href, state });
    }
  }
  for (const i of ownInvoices) {
    const href = `/dev-freelancing/invoices/${i.id}`;
    push({ key: `inv-${i.id}`, day: i.issuedOn, label: "인보이스 발행", title: `${i.number} · ${i.title}`, href, state: "hollow" });
    if (i.paidOn) push({ key: `paid-${i.id}`, day: i.paidOn, label: "입금 확인", title: `${i.number} · ${i.title}`, href, state: "solid" });
  }
  history.sort((a, b) => b.day.localeCompare(a.day) || a.key.localeCompare(b.key));

  return { client: row, notes, projects: ownProjects, estimates: ownEstimates, invoices: ownInvoices, history };
}

export async function clientOptions(db: Db, workspaceId: string) {
  return db
    .select({ id: clients.id, name: clients.name, company: clients.company })
    .from(clients)
    .where(eq(clients.workspaceId, workspaceId))
    .orderBy(clients.name);
}

export type ClientOption = Awaited<ReturnType<typeof clientOptions>>[number];

// ---------------------------------------------------------------------------------------------
// Mutations

export interface ClientInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  grade: ClientGrade;
  notes: string;
}

export async function createClient(db: Db, workspaceId: string, input: ClientInput): Promise<string> {
  const [row] = await db.insert(clients).values({ workspaceId, ...input }).returning({ id: clients.id });
  return row.id;
}

export async function updateClient(db: Db, workspaceId: string, id: string, input: ClientInput): Promise<void> {
  const updated = await db
    .update(clients)
    .set(input)
    .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
    .returning({ id: clients.id });
  if (updated.length === 0) throw new UserError(CLIENT_MISSING);
}

/** Deletes the client and their notes; projects and documents stay, without a client. */
export async function deleteClient(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
    .returning({ id: clients.id });
  if (deleted.length === 0) throw new UserError(CLIENT_MISSING);
}

export interface NoteInput {
  kind: NoteKind;
  body: string;
  occurredOn: DateKey;
}

export async function addClientNote(db: Db, workspaceId: string, clientId: string, input: NoteInput): Promise<void> {
  await assertOwned(db, workspaceId, clients, clientId, CLIENT_MISSING);
  await db.insert(clientNotes).values({ workspaceId, clientId, ...input });
}

export async function deleteClientNote(db: Db, workspaceId: string, id: string): Promise<void> {
  const deleted = await db
    .delete(clientNotes)
    .where(and(eq(clientNotes.id, id), eq(clientNotes.workspaceId, workspaceId)))
    .returning({ id: clientNotes.id });
  if (deleted.length === 0) throw new UserError("메모를 찾을 수 없어요.");
}
