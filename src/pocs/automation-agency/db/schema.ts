import {
  boolean,
  date,
  index,
  integer,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { workspaces } from "@/core/db/schema";

/**
 * AutoMate Pro tables, in the `automation_agency` Postgres schema.
 * Every table carries the tenant column; money is integer won.
 */
export const s = pgSchema("automation_agency");

export const industryEnum = s.enum("industry", ["manufacturing", "retail", "service", "it", "other"]);
export const packageKindEnum = s.enum("package_kind", ["data", "communication", "reporting", "settlement"]);
export const stageEnum = s.enum("project_stage", [
  "waiting",
  "analysis",
  "development",
  "testing",
  "deployment",
  "maintenance",
]);
export const maintenanceStatusEnum = s.enum("maintenance_status", ["none", "active", "paused", "ended"]);
export const quoteStatusEnum = s.enum("quote_status", ["draft", "sent", "accepted", "declined"]);
export const complexityEnum = s.enum("complexity", ["simple", "normal", "complex"]);
export const leadStatusEnum = s.enum("lead_status", ["new", "consulting", "quoted", "won", "on_hold"]);
export const platformEnum = s.enum("platform", ["make", "zapier", "n8n", "apps_script"]);
export const nodeKindEnum = s.enum("node_kind", ["trigger", "action", "condition"]);

const tenant = () =>
  uuid()
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" });

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** The agency's own details, printed as the supplier (공급자) on quotes. One row per workspace. */
export const agencyProfiles = s.table("agency_profiles", {
  workspaceId: tenant().primaryKey(),
  agencyName: text().notNull(),
  representative: text().notNull(),
  businessNumber: text().notNull().default(""),
  email: text().notNull().default(""),
  phone: text().notNull().default(""),
  updatedAt: createdAt(),
});

/** Solution catalogue: productised automation packages. */
export const packages = s.table(
  "packages",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    industry: industryEnum().notNull(),
    kind: packageKindEnum().notNull(),
    summary: text().notNull(),
    details: text().notNull().default(""),
    tools: text().array().notNull().default([]),
    buildHours: integer().notNull(),
    monthlyHoursSaved: integer().notNull(),
    setupFee: integer().notNull(),
    monthlyFee: integer().notNull(),
    archived: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("packages_workspace_idx").on(t.workspaceId)],
);

/** Accepted work for a client, travelling from 대기 to 유지보수. */
export const projects = s.table(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientName: text().notNull(),
    industry: industryEnum().notNull().default("other"),
    stage: stageEnum().notNull().default("waiting"),
    progress: integer().notNull().default(0),
    assignee: text().notNull().default(""),
    startDate: date({ mode: "string" }),
    dueDate: date({ mode: "string" }),
    notes: text().notNull().default(""),
    setupFee: integer().notNull().default(0),
    monthlyFee: integer().notNull().default(0),
    maintenanceStatus: maintenanceStatusEnum().notNull().default("none"),
    maintenanceStartedOn: date({ mode: "string" }),
    maintenanceEndedOn: date({ mode: "string" }),
    quoteId: uuid().references(() => quotes.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [index("projects_workspace_idx").on(t.workspaceId)],
);

export const projectPackages = s.table(
  "project_packages",
  {
    workspaceId: tenant(),
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    packageId: uuid()
      .notNull()
      .references(() => packages.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.packageId] }),
    index("project_packages_workspace_idx").on(t.workspaceId),
  ],
);

export const quotes = s.table(
  "quotes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    number: text().notNull(),
    clientName: text().notNull(),
    contactName: text().notNull().default(""),
    issuedOn: date({ mode: "string" }).notNull(),
    validUntil: date({ mode: "string" }).notNull(),
    status: quoteStatusEnum().notNull().default("draft"),
    notes: text().notNull().default(""),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [unique("quotes_workspace_number_uq").on(t.workspaceId, t.number)],
);

export const quoteItems = s.table(
  "quote_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    quoteId: uuid()
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    packageId: uuid().references(() => packages.id, { onDelete: "set null" }),
    name: text().notNull(),
    complexity: complexityEnum().notNull().default("normal"),
    quantity: integer().notNull().default(1),
    unitSetupFee: integer().notNull(),
    unitMonthlyFee: integer().notNull(),
    position: integer().notNull(),
  },
  (t) => [index("quote_items_quote_idx").on(t.quoteId)],
);

/** A saved ROI calculation for a prospective client (lead). */
export const diagnoses = s.table(
  "diagnoses",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    clientName: text().notNull(),
    contactName: text().notNull().default(""),
    industry: industryEnum().notNull().default("other"),
    weeklyHours: integer().notNull(),
    hourlyCost: integer().notNull(),
    automationRate: integer().notNull(),
    investment: integer().notNull(),
    monthlyFee: integer().notNull(),
    status: leadStatusEnum().notNull().default("new"),
    note: text().notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("diagnoses_workspace_idx").on(t.workspaceId)],
);

export const workflows = s.table(
  "workflows",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    name: text().notNull(),
    description: text().notNull().default(""),
    platform: platformEnum().notNull(),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: createdAt(),
  },
  (t) => [index("workflows_workspace_idx").on(t.workspaceId)],
);

export const workflowNodes = s.table(
  "workflow_nodes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    workflowId: uuid()
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    kind: nodeKindEnum().notNull(),
    app: text().notNull(),
    label: text().notNull(),
    column: integer().notNull(),
    lane: integer().notNull(),
  },
  (t) => [index("workflow_nodes_workflow_idx").on(t.workflowId)],
);

export const workflowEdges = s.table(
  "workflow_edges",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: tenant(),
    workflowId: uuid()
      .notNull()
      .references(() => workflows.id, { onDelete: "cascade" }),
    fromNodeId: uuid()
      .notNull()
      .references(() => workflowNodes.id, { onDelete: "cascade" }),
    toNodeId: uuid()
      .notNull()
      .references(() => workflowNodes.id, { onDelete: "cascade" }),
    label: text().notNull().default(""),
  },
  (t) => [index("workflow_edges_workflow_idx").on(t.workflowId)],
);

export const schema = {
  s,
  industryEnum,
  packageKindEnum,
  stageEnum,
  maintenanceStatusEnum,
  quoteStatusEnum,
  complexityEnum,
  leadStatusEnum,
  platformEnum,
  nodeKindEnum,
  agencyProfiles,
  packages,
  projects,
  projectPackages,
  quotes,
  quoteItems,
  diagnoses,
  workflows,
  workflowNodes,
  workflowEdges,
};

export type Industry = (typeof industryEnum.enumValues)[number];
export type PackageKind = (typeof packageKindEnum.enumValues)[number];
export type Stage = (typeof stageEnum.enumValues)[number];
export type MaintenanceStatus = (typeof maintenanceStatusEnum.enumValues)[number];
export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];
export type Complexity = (typeof complexityEnum.enumValues)[number];
export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type Platform = (typeof platformEnum.enumValues)[number];
export type NodeKind = (typeof nodeKindEnum.enumValues)[number];
