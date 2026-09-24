import { date, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Platform tables (Postgres `public` schema).
 *
 * Every product module stores its rows in its own Postgres schema and scopes
 * them to a workspace — the tenant. Today a workspace is an anonymous visitor
 * (cookie); swapping in real auth only changes how the workspace id is resolved.
 */

export const workspaces = pgTable("workspaces", {
  id: uuid().primaryKey(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/** Marks that a module's demo data has been seeded for a workspace. */
export const workspaceModules = pgTable(
  "workspace_modules",
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    moduleId: text().notNull(),
    seededAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.moduleId] })],
);

/** Daily AI call counter per workspace, used for quota enforcement. */
export const aiUsage = pgTable(
  "ai_usage",
  {
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    day: date().notNull(),
    calls: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.workspaceId, t.day] })],
);
