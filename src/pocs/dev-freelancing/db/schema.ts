import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * DevFlow — tables in the Postgres schema `dev_freelancing`.
 * Every table carries `workspaceId` (the tenant); money is integer won; calendar days are "YYYY-MM-DD".
 */
export const devFreelancing = pgSchema("dev_freelancing");

export const taxModeEnum = devFreelancing.enum("tax_mode", ["withholding", "vat", "none"]);
export const clientGradeEnum = devFreelancing.enum("client_grade", ["new", "regular", "vip"]);
export const noteKindEnum = devFreelancing.enum("note_kind", ["call", "meeting", "email", "memo"]);
export const projectStatusEnum = devFreelancing.enum("project_status", ["inquiry", "progress", "review", "done"]);
export const priorityEnum = devFreelancing.enum("priority", ["low", "medium", "high"]);
export const estimateStatusEnum = devFreelancing.enum("estimate_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
  "invoiced",
]);
export const invoiceStatusEnum = devFreelancing.enum("invoice_status", ["issued", "awaiting", "paid"]);
export const lineUnitEnum = devFreelancing.enum("line_unit", ["hour", "lump"]);
export const planCategoryEnum = devFreelancing.enum("plan_category", ["website", "app", "nocode"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** One row per workspace: who issues the documents and the defaults they start from. */
export const profiles = devFreelancing.table("profiles", {
  workspaceId: tenant().primaryKey(),
  displayName: text().notNull(),
  businessName: text().notNull().default(""),
  headline: text().notNull().default(""),
  bio: text().notNull().default(""),
  email: text().notNull().default(""),
  phone: text().notNull().default(""),
  businessNumber: text(),
  taxMode: taxModeEnum().notNull().default("withholding"),
  bankAccount: text().notNull().default(""),
  hourlyRate: integer().notNull().default(60000),
  monthlyGoal: integer().notNull().default(5000000),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const clients = devFreelancing.table(
  "clients",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    company: text().notNull().default(""),
    email: text().notNull().default(""),
    phone: text().notNull().default(""),
    grade: clientGradeEnum().notNull().default("new"),
    notes: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.createdAt)],
);

/** Manual CRM history: calls, meetings, emails and memos with a client. */
export const clientNotes = devFreelancing.table(
  "client_notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    kind: noteKindEnum().notNull().default("memo"),
    body: text().notNull(),
    occurredOn: date({ mode: "string" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.clientId)],
);

export const projects = devFreelancing.table(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    title: text().notNull(),
    description: text().notNull().default(""),
    status: projectStatusEnum().notNull().default("inquiry"),
    priority: priorityEnum().notNull().default("medium"),
    budget: integer().notNull().default(0),
    startOn: date({ mode: "string" }),
    dueOn: date({ mode: "string" }),
    /** Order inside its kanban column (ascending). */
    position: integer().notNull().default(0),
    completedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.status, t.position)],
);

export const milestones = devFreelancing.table(
  "milestones",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text().notNull(),
    estimatedHours: numeric({ mode: "number", precision: 6, scale: 1 }),
    dueOn: date({ mode: "string" }),
    position: integer().notNull().default(0),
    doneAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.projectId, t.position)],
);

export const timeEntries = devFreelancing.table(
  "time_entries",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    milestoneId: uuid().references(() => milestones.id, { onDelete: "set null" }),
    /** Seoul calendar day the work belongs to. */
    workedOn: date({ mode: "string" }).notNull(),
    minutes: integer().notNull(),
    note: text().notNull().default(""),
    /** Set when the entry came from the timer. */
    startedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.workedOn), index().on(t.workspaceId, t.projectId)],
);

/** The running timer: at most one per workspace, persisted so it survives reloads and devices. */
export const timers = devFreelancing.table("timers", {
  workspaceId: tenant().primaryKey(),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  milestoneId: uuid().references(() => milestones.id, { onDelete: "set null" }),
  note: text().notNull().default(""),
  startedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const estimates = devFreelancing.table(
  "estimates",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    number: text().notNull(),
    title: text().notNull(),
    status: estimateStatusEnum().notNull().default("draft"),
    taxMode: taxModeEnum().notNull().default("withholding"),
    discount: integer().notNull().default(0),
    issuedOn: date({ mode: "string" }).notNull(),
    validUntil: date({ mode: "string" }).notNull(),
    notes: text().notNull().default(""),
    sentAt: timestamp({ withTimezone: true }),
    decidedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex().on(t.workspaceId, t.number), index().on(t.workspaceId, t.status)],
);

export const invoices = devFreelancing.table(
  "invoices",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    estimateId: uuid().references(() => estimates.id, { onDelete: "set null" }),
    number: text().notNull(),
    title: text().notNull(),
    status: invoiceStatusEnum().notNull().default("issued"),
    taxMode: taxModeEnum().notNull().default("withholding"),
    discount: integer().notNull().default(0),
    issuedOn: date({ mode: "string" }).notNull(),
    dueOn: date({ mode: "string" }).notNull(),
    notes: text().notNull().default(""),
    sentAt: timestamp({ withTimezone: true }),
    paidOn: date({ mode: "string" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex().on(t.workspaceId, t.number), index().on(t.workspaceId, t.status)],
);

const lineItemColumns = () => ({
  id: uuid().primaryKey().defaultRandom(),
  workspaceId: tenant(),
  position: integer().notNull().default(0),
  title: text().notNull(),
  unit: lineUnitEnum().notNull().default("hour"),
  quantity: numeric({ mode: "number", precision: 8, scale: 2 }).notNull(),
  unitPrice: integer().notNull(),
});

export const estimateItems = devFreelancing.table(
  "estimate_items",
  {
    ...lineItemColumns(),
    estimateId: uuid()
      .notNull()
      .references(() => estimates.id, { onDelete: "cascade" }),
  },
  (t) => [index().on(t.workspaceId, t.estimateId)],
);

export const invoiceItems = devFreelancing.table(
  "invoice_items",
  {
    ...lineItemColumns(),
    invoiceId: uuid()
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
  },
  (t) => [index().on(t.workspaceId, t.invoiceId)],
);

export const portfolioItems = devFreelancing.table(
  "portfolio_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    title: text().notNull(),
    summary: text().notNull().default(""),
    role: text().notNull().default(""),
    outcome: text().notNull().default(""),
    stack: text().array().notNull().default([]),
    url: text().notNull().default(""),
    period: text().notNull().default(""),
    published: boolean().notNull().default(true),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.position)],
);

export const servicePlans = devFreelancing.table(
  "service_plans",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    category: planCategoryEnum().notNull(),
    name: text().notNull(),
    price: integer().notNull(),
    delivery: text().notNull().default(""),
    features: text().array().notNull().default([]),
    featured: boolean().notNull().default(false),
    position: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.workspaceId, t.category, t.position)],
);

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  notes: many(clientNotes),
  estimates: many(estimates),
  invoices: many(invoices),
}));

export const clientNotesRelations = relations(clientNotes, ({ one }) => ({
  client: one(clients, { fields: [clientNotes.clientId], references: [clients.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  milestones: many(milestones),
  timeEntries: many(timeEntries),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, { fields: [timeEntries.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [timeEntries.milestoneId], references: [milestones.id] }),
}));

export const estimatesRelations = relations(estimates, ({ one, many }) => ({
  client: one(clients, { fields: [estimates.clientId], references: [clients.id] }),
  project: one(projects, { fields: [estimates.projectId], references: [projects.id] }),
  items: many(estimateItems),
}));

export const estimateItemsRelations = relations(estimateItems, ({ one }) => ({
  estimate: one(estimates, { fields: [estimateItems.estimateId], references: [estimates.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, { fields: [invoices.clientId], references: [clients.id] }),
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
  estimate: one(estimates, { fields: [invoices.estimateId], references: [estimates.id] }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));
